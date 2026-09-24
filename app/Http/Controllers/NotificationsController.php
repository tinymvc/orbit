<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Spark\Http\Request;
use function array_slice;
use function count;
use function in_array;

class NotificationsController extends Controller
{
    private const PAGE_SIZE = 20;

    public function index(Request $request)
    {
        $input = $request->validate([
            'before' => 'nullable|integer|min:1|regex:/^[1-9][0-9]*$/'
        ]);

        $query = Notification::where('user_id', user('id'))
            ->latest('id');

        if ($input['before'] !== null) {
            $query->where('id', '<', $input['before']);
        }

        // One extra row tells us whether another page exists without a count query.
        $rows = $query->limit(self::PAGE_SIZE + 1)->all();
        $hasMore = count($rows) > self::PAGE_SIZE;
        $items = array_slice($rows, 0, self::PAGE_SIZE);

        return json([
            'items' => $items,
            'nextCursor' => $hasMore ? end($items)->id : null,
            'unreadCount' => $this->unreadCount(),
        ]);
    }

    public function __invoke(Request $request)
    {
        $input = $request->validate([
            'action' => 'required|string|in:mark-read,mark-all-read,remove,clear',
        ]);

        $action = $input['action'];
        $userId = user('id');
        $readAt = null;

        if (in_array($action, ['mark-read', 'remove'], true)) {
            $id = $request->validate(['id' => 'required|integer|min:1|regex:/^[1-9][0-9]*$/'])
                ->number('id');

            $notification = Notification::where('user_id', $userId)
                ->where('id', $id)
                ->firstOrFail();

            $query = Notification::where('user_id', $userId)
                ->where('id', $id);

            if ($action === 'mark-read') {
                // Preserve the first read timestamp, including repeated clicks.
                $readAt = $notification->read_at ?: now()->toDateTimeString();
                $query->whereNull('read_at')->update(['read_at' => $readAt]);
            } else {
                $query->delete();
            }
        } elseif ($action === 'mark-all-read') {
            $readAt = now()->toDateTimeString();
            Notification::where('user_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => $readAt]);
        } else {
            Notification::where('user_id', $userId)->delete();
        }

        return $request->expectsJson()
            ? json(['unreadCount' => $this->unreadCount(), 'readAt' => $readAt])
            : inertia()->back();
    }

    private function unreadCount(): int
    {
        return Notification::where('user_id', user('id'))->whereNull('read_at')->count();
    }
}
