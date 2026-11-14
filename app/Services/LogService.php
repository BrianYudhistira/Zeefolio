<?php

namespace App\Services;

use App\Models\Log;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log as LaravelLog;

class LogService
{
    private const NOTIFIABLE_MODULES = [
        'Skills',
        'Portfolio',
        'Users',
        'Account',
        'Roles',
        'Permissions',
        'Settings',
    ];

    private function getMetadata(array $customMetadata = []): array
    {
        $ipAddress = $customMetadata['ip_address'] ?? request()->ip();
        $userAgent = $customMetadata['user_agent'] ?? request()->userAgent();
        $location = $customMetadata['location'] ?? $this->getLocationFromIp($ipAddress);

        return [
            'ip_address' => $ipAddress,
            'user_agent' => is_string($userAgent) ? substr($userAgent, 0, 255) : null,
            'location' => $location,
        ];
    }

    /**
     * Resolve client location without blocking HTTP requests or leaking IPs over cleartext HTTP.
     */
    private function getLocationFromIp(?string $ip): string
    {
        if (
            ! $ip ||
            $ip === '127.0.0.1' ||
            $ip === '::1' ||
            filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
        ) {
            return 'Local';
        }

        $cached = Cache::get("geoip:{$ip}");
        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $request = request();
        foreach (['CF-IPCountry', 'CloudFront-Viewer-Country', 'X-Vercel-IP-Country', 'X-Country-Code'] as $header) {
            $country = strtoupper(trim((string) $request->header($header)));
            if ($country !== '' && $country !== 'XX' && $country !== 'T1' && strlen($country) <= 64) {
                return $country;
            }
        }

        return 'Unknown';
    }

    /**
     * Resolve the default dashboard action URL for a notification based on module and message.
     */
    public function resolveActionUrl(?string $module, string $message, ?string $customUrl = null): ?string
    {
        if ($customUrl) {
            return $customUrl;
        }

        $lowerMsg = strtolower($message);

        return match ($module) {
            'Skills' => str_contains($lowerMsg, 'custom tech stack')
                ? '/admin/tech-stacks'
                : '/admin/skills',
            'Portfolio' => match (true) {
                str_contains($lowerMsg, 'project') => '/admin/projects',
                str_contains($lowerMsg, 'experience') => '/admin/experiences',
                str_contains($lowerMsg, 'contact') || str_contains($lowerMsg, 'message') => '/admin/contacts',
                str_contains($lowerMsg, 'promoted') => '/admin/settings',
                default => '/admin/home',
            },
            'Users' => '/admin/members',
            'Account' => '/admin/account',
            'Roles', 'Permissions' => '/admin/roles',
            'Settings' => '/admin/settings',
            default => '/admin/dashboard',
        };
    }

    private function createLog($type, $module, $message, $metadata = [])
    {
        $requestMetadata = $this->getMetadata($metadata);
        $userId = $metadata['user_id'] ?? (Auth::check() ? Auth::id() : null);

        $level = in_array($type, ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'], true)
            ? $type
            : 'info';
        $prefix = $module ? "[{$module}] " : '';

        LaravelLog::log($level, $prefix . $message, array_filter([
            'module' => $module,
            'user_id' => $userId,
            ...$requestMetadata,
        ], static fn ($value) => $value !== null));

        $logData = array_merge(
            [
                'type' => $type,
                'module' => $module,
                'message' => $message,
                'user_id' => $userId,
            ],
            $requestMetadata
        );

        $log = Log::create($logData);

        $recipientId = $metadata['notify_user_id'] ?? $userId;
        if ($recipientId && in_array($module, self::NOTIFIABLE_MODULES, true)) {
            $this->dispatchNotification(
                recipientId: (int) $recipientId,
                actorId: $userId ? (int) $userId : null,
                module: (string) $module,
                type: (string) $type,
                message: (string) $message,
                title: $metadata['title'] ?? "{$module} Activity",
                actionUrl: $this->resolveActionUrl($module, (string) $message, $metadata['action_url'] ?? null)
            );
        }

        return $log;
    }

    /**
     * Create a dedicated user notification record (separate from system logs).
     */
    public function dispatchNotification(
        int $recipientId,
        ?int $actorId,
        string $module,
        string $type,
        string $message,
        ?string $title = null,
        ?string $actionUrl = null
    ): ?UserNotification {
        try {
            $resolvedActionUrl = $this->resolveActionUrl($module, $message, $actionUrl);
            $recipients = [$recipientId];

            if (in_array($module, ['Skills', 'Portfolio', 'Users'], true)) {
                $adminIds = User::query()
                    ->whereIn('role', [User::ROLE_SUPERADMIN, User::ROLE_ADMIN])
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->all();

                $recipients = array_values(array_unique(array_merge($recipients, $adminIds)));
            }

            $created = null;
            foreach ($recipients as $targetUserId) {
                $notif = UserNotification::create([
                    'user_id' => $targetUserId,
                    'actor_id' => $actorId,
                    'module' => $module,
                    'type' => $type,
                    'title' => $title ?: "{$module} Update",
                    'message' => $message,
                    'action_url' => $resolvedActionUrl,
                    'read_at' => null,
                ]);

                if ($targetUserId === $recipientId) {
                    $created = $notif;
                }
            }

            return $created;
        } catch (\Throwable $e) {
            LaravelLog::warning('Failed to dispatch user notification: ' . $e->getMessage());

            return null;
        }
    }

    public function infoLog($module = null, $message = null, $metadata = [])
    {
        return $this->createLog('info', $module, $message, $metadata);
    }

    public function warningLog($module = null, $message = null, $metadata = [])
    {
        return $this->createLog('warning', $module, $message, $metadata);
    }

    public function errorLog($module = null, $message = null, $metadata = [])
    {
        return $this->createLog('error', $module, $message, $metadata);
    }
}
