<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserBulkActionRequest;
use App\Http\Requests\UserRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\UserServices;
use Spark\Facades\Gate;
use Spark\Http\Request;

class UsersController extends Controller
{
    public function __construct(private UserServices $users)
    {
    }

    public function index(Request $request)
    {
        Gate::authorize('permission', 'users.browse');

        $input = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:500',
            'page' => 'nullable|integer|min:1',
            'search' => 'nullable|string|max:200',
            'status' => 'nullable|string|in:active,inactive,suspended,banned',
            'role' => 'nullable|integer|min:1',
        ]);

        $users = User::latest('id')
            ->with('roles:id,name,privileges')
            ->when(
                $request->has('search'),
                fn($query) => $query->whereRaw(
                    'CONCAT(first_name, " ", last_name) LIKE :search OR email LIKE :search OR username LIKE :search',
                    ['search' => '%' . $request->input('search') . '%']
                )
            )
            ->when(
                $request->has('status'),
                fn($query) => $query->where('status', $request->input('status'))
            )
            ->when(
                $request->has('role'),
                fn($query) => $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('roles.id', $request->input('role'));
                })
            );

        return inertia('admin/users', [
            'users' => fn() => $users->paginate(
                (int) ($input['per_page'] ?: 10)
            )->toArray(),
            'roles' => fn() => Role::query()->get(['id', 'name']),
        ]);
    }

    public function store(UserRequest $request)
    {
        $this->users->save($request->validated());

        return inertia()->back()->with('success', 'User created successfully.');
    }

    public function update(int $id, UserRequest $request)
    {
        $this->users->save($request->validated(), User::findOrFail($id));

        return inertia()->back()->with('success', 'User updated successfully.');
    }

    public function bulkAction(UserBulkActionRequest $request)
    {
        [$level, $message] = $this->users->bulkAction($request->validated());

        return inertia()->back()->with($level, $message);
    }

    public function destroy(int $id)
    {
        Gate::authorize('permission', 'users.delete');

        User::destroy($id);

        return inertia()
            ->back()
            ->with('success', 'User deleted successfully.');
    }
}
