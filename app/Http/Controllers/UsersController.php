<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spark\Http\Request;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        authorize('permission', 'users.browse');

        $users = User::latest()
            ->when(
                $request->has('search'),
                fn($query) => $query->whereRaw(
                    'CONCAT(first_name, " ", last_name) LIKE :search OR email LIKE :search OR username LIKE :search',
                    ['search' => '%' . $request->input('search') . '%']
                )
            )
            ->paginate($request->input('per_page', 10));

        return inertia('admin/users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        authorize('permission', 'users.create');

        $user = User::create(
            $request->validate([
                'first_name' => 'max:50',
                'last_name' => 'max:50',
                'privileges' => 'required|array|min:1|max:500',
                'email' => 'required|email|max:60|unique:users,email',
                'username' => 'required|max:60|unique:users,username',
                'password' => 'required|min:6|confirmed',
            ])
        );

        if ($user->wasCreated()) {
            return back()->with('success', 'User created successfully.');
        }

        return back()->with('error', 'Failed to create user.');
    }

    public function update(int $id, Request $request)
    {
        authorize('permission', 'users.edit');

        $input = $request->validate([
            'first_name' => 'max:50',
            'last_name' => 'max:50',
            'privileges' => 'required|array|min:1|max:500',
            'email' => "required|email|max:60|unique:users,email,$id",
            'username' => "required|max:60|unique:users,username,$id",
            'password' => 'nullable|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->fill($input->filter());

        if ($user->save()) {
            return back()->with('success', 'User updated successfully.');
        }

        return back()->with('error', 'Failed to update user.');
    }

    public function destroy(int $id)
    {
        authorize('permission', 'users.delete');

        User::destroy($id);

        return back()->with('success', 'User deleted successfully.');
    }
}
