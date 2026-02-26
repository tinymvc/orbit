<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Spark\Http\Request;

class NotificationsController extends Controller
{
    public function __invoke(Request $request)
    {
        // ─── POST actions ────────────────────────────────────────────────
        if ($request->isPost()) {
            return $this->handleAction($request);
        }

        // ─── GET – return notifications for the current user ─────────────
        $notifications = Notification::where('user_id', user('id'))
            ->latest('id')
            ->paginate($request->input('per_page', 20));

        return inertia('admin/notifications', [
            'notifications' => $notifications,
        ]);
    }

    private function handleAction(Request $request)
    {
        $action = $request->input('action');
        $userId = user('id');

        return match ($action) {
            'mark-read' => $this->markRead($request->input('id'), $userId),
            'mark-all-read' => $this->markAllRead($userId),
            'remove' => $this->remove($request->input('id'), $userId),
            'clear' => $this->clear($userId),
            default => inertia()->back()->with('error', 'Unknown action.'),
        };
    }

    private function markRead(int $id, int $userId)
    {
        Notification::where('id', $id)
            ->where('user_id', $userId)
            ->update(['read_at' => now()]);

        return inertia()->back();
    }

    private function markAllRead(int $userId)
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return inertia()->back();
    }

    private function remove(int $id, int $userId)
    {
        Notification::where('id', $id)
            ->where('user_id', $userId)
            ->delete();

        return inertia()->back();
    }

    private function clear(int $userId)
    {
        Notification::where('user_id', $userId)->delete();

        return inertia()->back();
    }
}
