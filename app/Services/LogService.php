<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log as LaravelLog;

class LogService
{
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

    private function createLog($type, $module, $message, $metadata = [])
    {
        $requestMetadata = $this->getMetadata($metadata);
        $userId = Auth::check() ? Auth::id() : null;

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

        return Log::create($logData);
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
