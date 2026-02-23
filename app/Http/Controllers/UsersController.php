<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Spark\Http\Request;
use function in_array;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        authorize('permission', 'users.browse');

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
            )
            ->paginate($request->input('per_page', 10));

        return inertia('admin/users', [
            'users' => $users,
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        authorize('permission', 'users.create');

        $input = $request->validate([
            'first_name' => 'max:50',
            'last_name' => 'max:50',
            'roles' => 'required|array|min:1|max:50',
            'email' => 'required|email|max:60|unique:users,email',
            'username' => 'required|max:60|unique:users,username',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create(
            $input->except('roles')->filter()
        );

        if ($user->wasCreated()) {
            $user->roles()
                ->sync($input->array('roles'));

            return inertia()
                ->back()
                ->with('success', 'User created successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to create user.');
    }

    public function update(int $id, Request $request)
    {
        authorize('permission', 'users.edit');

        $input = $request->validate([
            'first_name' => 'max:50',
            'last_name' => 'max:50',
            'roles' => 'required|array|min:1|max:50',
            'email' => "required|email|max:60|unique:users,email,$id",
            'username' => "required|max:60|unique:users,username,$id",
            'password' => 'nullable|min:8|confirmed',
        ]);

        /** @var \App\Models\User */
        $user = User::findOrFail($id);
        $user->fill($input->except('roles')->filter());

        $result = $user->roles()->sync($input->array('roles'));

        if (
            $user->save() ||
            $result['attached'] > 0 ||
            $result['detached'] > 0
        ) {
            return inertia()
                ->back()
                ->with('success', 'User updated successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to update user.');
    }

    public function bulkAction(Request $request)
    {
        $input = $request->validate([
            'action' => 'required|string|in:delete,active,inactive,banned',
            'ids' => 'required|array|min:1',
        ]);

        if ($input->string('action') === 'delete') {
            authorize('permission', 'users.delete');

            User::destroy($input->array('ids'));

            return inertia()
                ->back()
                ->with('success', 'Selected users deleted successfully.');
        } elseif (in_array($input->string('action'), ['active', 'inactive', 'banned'])) {
            authorize('permission', 'users.edit');

            User::whereIn('id', $input->array('ids'))
                ->update(['status' => $input['action']]);

            $status = [
                'active' => 'activated',
                'inactive' => 'deactivated',
                'banned' => 'banned'
            ][$input->string('action')];

            return inertia()
                ->back()
                ->with('success', "Selected users $status successfully.");
        }

        return inertia()
            ->back()
            ->with('error', 'Invalid action selected.');
    }

    public function destroy(int $id)
    {
        authorize('permission', 'users.delete');

        User::destroy($id);

        return inertia()
            ->back()
            ->with('success', 'User deleted successfully.');
    }
}
