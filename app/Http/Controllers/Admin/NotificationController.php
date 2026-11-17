<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use App\Services\LogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display all user notifications (including those dismissed from the header popup).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filter = trim((string) $request->query('filter', 'all'));
        $logService = app(LogService::class);

        $query = UserNotification::with('actor:id,name,username')
            ->where('user_id', $user->id)
            ->latest('id');

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate(20)->withQueryString()->through(
            fn (UserNotification $n) => $n->toPayload($logService)
        );

        $rawStats = UserNotification::query()
            ->where('user_id', $user->id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN read_at IS NULL THEN 1 ELSE 0 END) as unread_count,
                SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count
            ')
            ->first();

        $stats = [
            'total' => (int) ($rawStats->total ?? 0),
            'unread' => (int) ($rawStats->unread_count ?? 0),
            'read' => (int) ($rawStats->read_count ?? 0),
        ];

        return Inertia::render('Admin/Notifications/Index', [
            'notificationsList' => $notifications,
            'stats' => $stats,
            'filter' => in_array($filter, ['all', 'unread', 'read'], true) ? $filter : 'all',
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, UserNotification $notification): RedirectResponse
    {
        $user = $request->user();

        if ((int) $notification->user_id !== (int) $user->id) {
            abort(403);
        }

        if (! $notification->read_at) {
            $notification->update([
                'read_at' => now(),
            ]);
        }

        return redirect()->back();
    }

    /**
     * Mark all unread notifications for the authenticated user as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        UserNotification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);

        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Hide a single notification from the header popup without deleting it from the database.
     */
    public function dismissFromPopup(Request $request, UserNotification $notification): RedirectResponse
    {
        $user = $request->user();

        if ((int) $notification->user_id !== (int) $user->id) {
            abort(403);
        }

        $notification->update([
            'is_popup_hidden' => true,
        ]);

        return redirect()->back();
    }

    /**
     * Hide all notifications from the header popup without deleting them from the database.
     */
    public function dismissAllFromPopup(Request $request): RedirectResponse
    {
        $user = $request->user();

        UserNotification::query()
            ->where('user_id', $user->id)
            ->where('is_popup_hidden', false)
            ->update([
                'is_popup_hidden' => true,
            ]);

        return redirect()->back();
    }

    /**
     * Soft-delete a single notification from the Notifications page.
     */
    public function destroy(Request $request, UserNotification $notification): RedirectResponse
    {
        $user = $request->user();

        if ((int) $notification->user_id !== (int) $user->id) {
            abort(403);
        }

        $notification->delete();

        return redirect()->back()->with('success', 'Notification deleted.');
    }

    /**
     * Soft-delete all notifications for the authenticated user from the Notifications page.
     */
    public function clearAll(Request $request): RedirectResponse
    {
        $user = $request->user();

        UserNotification::query()
            ->where('user_id', $user->id)
            ->delete();

        return redirect()->back()->with('success', 'All notifications deleted.');
    }
}
