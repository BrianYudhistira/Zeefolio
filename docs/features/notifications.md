[← Back to Index](../README.md)

# Feature: In-App Notifications & Real-Time SSE Stream

## Overview & Actors
- **Business Goal:** Deliver real-time activity feedback to users via the `TopBar` notification bell (with live toast popups over **Server-Sent Events**) and a full notification inbox page supporting read/unread filtering, *mark as read*, *popup dismissal*, and *soft-deletion*.
- **Actors / Roles:** All authenticated users (`member`, `admin`, `superadmin`, or custom role — requires only the `auth` middleware).
- **Related Entities:** [`user_notifications`](../01-database-erd.md#user-notifications), [`logs`](../01-database-erd.md#logs), [`users`](../01-database-erd.md#users).

## Feature Interconnections
- **Prerequisites (Upstream):**
  - User is authenticated via [Authentication](./auth.md).
  - Notification records are created by `LogService::dispatchNotification()` ([Background System](../02-background-system.md#audit-and-notification-dispatch)) during mutations in [Home & Profile](./home-profile.md), [Projects](./projects.md), [Skills](./skills.md), [Experiences](./experiences.md), [Contacts](./contacts.md), [Members](./members.md), [Roles & Permissions](./roles-and-permissions.md), [Platform Settings](./platform-settings.md), [Account Settings](./account-settings.md), or when a visitor submits a contact message in [Public Portfolio](./public-portfolio.md#public-contact-form-submission).
- **Triggers / Leads To (Downstream):**
  - Clicking a notification (in the `TopBar.jsx` popover or on `Notifications/Index.jsx`) marks it as read (`PUT /admin/notifications/{id}/read`) and navigates the user to the contextual `action_url` (e.g., `/admin/projects`, `/admin/skills`, `/admin/contacts`, `/admin/members`, `/admin/roles`, `/admin/settings`).
  - `user_notifications` rows (including soft-deleted records) are permanently purged after **90 days** by [Daily Model Pruning](../02-background-system.md#daily-pruning).

---

## End-to-End Business Process Flows

### 1. Shared Popover Props (`TopBar`) & Initial Backfill
- **Entry Point:** Every authenticated Inertia request → `HandleInertiaRequests::resolveUserNotifications()`
- **Flow Steps:**
  1. If a user has zero rows in `user_notifications` (including `withTrashed()`), performs a one-time backfill of up to 8 recent entries from `logs` (`module IN ('Skills', 'Portfolio', 'Users')`).
  2. Queries the user's **15 most recent notifications** where `is_popup_hidden = false` to populate the `TopBar.jsx` notification dropdown.

### 2. Real-Time Streaming via Server-Sent Events (SSE)
- **Entry Point:** `AdminLayout.jsx` opens `new EventSource(route('admin.notifications.stream', { last_id }))` → `GET /admin/notifications/stream` (`Admin\NotificationStreamController@index`, middleware `auth`)
- **Flow Steps:**
  1. **Session Lock Release:** Calls `$request->session()->save()` immediately so the open SSE stream does not hold a PHP session lock or block concurrent Inertia visits.
  2. **Cursor Resolution (`resolveCursorId`):** Reads the `Last-Event-ID` header or `last_id` query parameter to stream only notifications with `id > $cursorId`.
  3. **EventStream Loop (`response()->eventStream()`):**
     - Queries new notifications (`user_id = $userId`, `is_popup_hidden = false`, `id > $cursorId`) and yields `notification` events with JSON payloads (`toPayload()`).
     - Emits a `heartbeat` event every 10 seconds when idle and ends the cycle after 25 seconds with `cycle-end` (`reconnect_in_ms: 3000`, or a single-pass flush with `4000ms` on `php artisan serve`).
  4. **Frontend Handling (`AdminLayout.jsx` & `Notifications/Index.jsx`):**
     - Because all Admin pages share `AdminLayout` as an **Inertia Persistent Layout**, the `EventSource` connection persists across page transitions.
     - When a `notification` event arrives, `AdminLayout.jsx` prepends it to `liveNotifications`, displays a toast alert, and dispatches the `"admin:sse-notification"` CustomEvent.
     - If `Pages/Admin/Notifications/Index.jsx` is open, its `"admin:sse-notification"` listener triggers a **400ms debounced** `router.reload({ only: ["notificationsList", "stats"] })`.

### 3. Notifications Inbox Page, Filters & Read / Dismiss / Delete Actions
- **Entry Point:** `GET /admin/notifications?filter={all|unread|read}` (`Admin\NotificationController@index`) → `Pages/Admin/Notifications/Index.jsx`
- **Flow Steps:**
  1. **Inbox Listing & Filtering:** Lists all non-deleted notifications for the user (including items dismissed from the `TopBar` popup), paginated at **20 items per page** with `All`, `Unread` (`whereNull('read_at')`), and `Read` (`whereNotNull('read_at')`) filter tabs.
  2. **Mark as Read & Navigation (`navigateNotification`):**
     - **Single Item:** `PUT /admin/notifications/{notification}/read` (`NotificationController@markAsRead`) verifies ownership (`user_id === $user->id`, HTTP 403 otherwise), sets `read_at = now()`, and navigates to `action_url`.
     - **Mark All Read:** *Mark all read* button in `TopBar.jsx` → `PUT /admin/notifications/read-all` (`NotificationController@markAllAsRead`) sets `read_at = now()` on all unread notifications for the user.
  3. **Popup Dismissal (Hides from `TopBar` Without Deleting from Inbox):**
     - **Dismiss Single Popup Item:** `PUT /admin/notifications/{notification}/popup-dismiss` (`NotificationController@dismissFromPopup`) sets `is_popup_hidden = true`.
     - **Clear Popup:** `PUT /admin/notifications/popup-clear` (`NotificationController@dismissAllFromPopup`) sets `is_popup_hidden = true` on all visible popup items for the user.
  4. **Soft-Delete from Notifications Inbox:**
     - **Delete Single Item:** Delete icon button on a notification card → `DELETE /admin/notifications/{notification}` (`NotificationController@destroy`) soft-deletes the row (`deleted_at = now()`).
     - **Delete All (With Confirmation Modal):** *Delete All* button opens `ConfirmDeleteModal.jsx` → `DELETE /admin/notifications` (`NotificationController@clearAll`) soft-deletes all notifications belonging to the user.

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Actor as User / Visitor
    participant LogSvc as LogService
    participant DB as user_notifications Table
    participant SSE as NotificationStreamController
    participant UI as AdminLayout (Persistent) & TopBar

    Actor->>LogSvc: Content Mutation / Admin Action / Contact Message
    LogSvc->>DB: UserNotification::create(user_id, module, message, action_url)
    SSE->>DB: Poll id > cursorId (every 2s)
    DB-->>SSE: Return new notification rows
    SSE-->>UI: Emit SSE event: "notification" (JSON payload)
    UI->>UI: Show Toast + Increment TopBar Unread Badge
    UI->>UI: Dispatch "admin:sse-notification" (400ms debounced reload on Inbox page)
```
