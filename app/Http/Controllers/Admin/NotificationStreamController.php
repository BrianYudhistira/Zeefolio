<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use App\Services\LogService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedEvent;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationStreamController extends Controller
{
    private const STREAM_DURATION_SECONDS = 25;
    private const POLL_INTERVAL_SECONDS = 2;
    private const HEARTBEAT_INTERVAL_SECONDS = 10;
    private const RECONNECT_DELAY_MS = 3000;
    private const CLI_SERVER_RECONNECT_DELAY_MS = 4000;

    /**
     * Stream new user notifications in real time using Laravel's native SSE eventStream().
     */
    public function index(Request $request, LogService $logService): StreamedResponse
    {
        $userId = (int) $request->user()->id;
        $cursorId = $this->resolveCursorId($request);
        $shortCycle = $this->isBuiltInCliServer();

        // Release PHP session lock immediately so concurrent Inertia requests are not blocked.
        if ($request->hasSession()) {
            $request->session()->save();
        }

        $reconnectDelayMs = $shortCycle
            ? self::CLI_SERVER_RECONNECT_DELAY_MS
            : self::RECONNECT_DELAY_MS;

        return response()->eventStream(
            callback: fn (): \Generator => $this->streamEvents($userId, $cursorId, $logService, $shortCycle),
            endStreamWith: new StreamedEvent(
                event: 'cycle-end',
                data: json_encode(['reconnect_in_ms' => $reconnectDelayMs]) ?: "{\"reconnect_in_ms\":{$reconnectDelayMs}}",
            ),
        );
    }

    /**
     * Poll for new notifications and emit SSE events until the stream cycle ends.
     */
    private function streamEvents(
        int $userId,
        int $cursorId,
        LogService $logService,
        bool $shortCycle = false,
    ): \Generator {
        if ($shortCycle) {
            // Built-in php artisan serve handles 1 worker by default (e.g. without --no-reload);
            // flush pending notifications once so concurrent admin requests never stall.
            foreach ($this->fetchNewNotifications($userId, $cursorId) as $notification) {
                yield new StreamedEvent(
                    event: 'notification',
                    data: $notification->toPayload($logService),
                );
            }

            return;
        }

        if (function_exists('set_time_limit')) {
            @set_time_limit(self::STREAM_DURATION_SECONDS + 10);
        }

        $startedAt = time();
        $lastHeartbeatAt = $startedAt;

        while ((time() - $startedAt) < self::STREAM_DURATION_SECONDS) {
            $notifications = $this->fetchNewNotifications($userId, $cursorId);

            foreach ($notifications as $notification) {
                $cursorId = (int) $notification->id;

                yield new StreamedEvent(
                    event: 'notification',
                    data: $notification->toPayload($logService),
                );
            }

            if ($notifications->isNotEmpty()) {
                $lastHeartbeatAt = time();
            } elseif ((time() - $lastHeartbeatAt) >= self::HEARTBEAT_INTERVAL_SECONDS) {
                $lastHeartbeatAt = time();

                yield new StreamedEvent(
                    event: 'heartbeat',
                    data: ['timestamp' => $lastHeartbeatAt],
                );
            }

            sleep(self::POLL_INTERVAL_SECONDS);
        }
    }

    /**
     * Detect PHP's built-in CLI server (`php artisan serve`).
     */
    private function isBuiltInCliServer(): bool
    {
        return PHP_SAPI === 'cli-server';
    }

    private function resolveCursorId(Request $request): int
    {
        $lastEventId = $request->header('Last-Event-ID');

        if (is_numeric($lastEventId)) {
            return max(0, (int) $lastEventId);
        }

        return max(0, (int) $request->query('last_id', 0));
    }

    /**
     * @return Collection<int, UserNotification>
     */
    private function fetchNewNotifications(int $userId, int $afterId): Collection
    {
        return UserNotification::with('actor:id,name,username')
            ->where('user_id', $userId)
            ->where('is_popup_hidden', false)
            ->where('id', '>', $afterId)
            ->orderBy('id')
            ->limit(15)
            ->get([
                'id',
                'user_id',
                'actor_id',
                'module',
                'type',
                'title',
                'message',
                'action_url',
                'is_popup_hidden',
                'read_at',
                'created_at',
            ]);
    }
}
