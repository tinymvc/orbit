<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Http\Requests\RoleRequest;
use Spark\Facades\Gate;
use Inertia\Facades\Inertia;
use Spark\Http\Request;

class RolesController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('permission', 'roles.browse');

        $input = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:500',
            'page' => 'nullable|integer|min:1',
            'search' => 'nullable|string|max:200',
        ]);

        $roles = Role::latest('id')
            ->when(
                $request->has('search'),
                fn($query) => $query->like('name', '%' . $request->input('search') . '%')
            );

        return inertia('admin/roles', [
            'roles' => fn() => $roles->paginate(
                (int) ($input['per_page'] ?: 10)
            )->toArray(),
            'privileges' => Inertia::once(privileges_list(...))
        ]);
    }

    public function store(RoleRequest $request)
    {
        $role = Role::create($request->validated());

        if ($role->wasCreated()) {
            return inertia()
                ->back()
                ->with('success', 'Role created successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to create role.');
    }

    public function update(int $id, RoleRequest $request)
    {
        $role = Role::findOrFail($id);
        $role->fill($request->validated());

        $role->save();

        if ($role->wasUpdated()) {
            return inertia()
                ->back()
                ->with('success', 'Role updated successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to update role.');
    }

    public function destroy(int $id)
    {
        Gate::authorize('permission', 'roles.delete');

        Role::destroy($id);

        return inertia()
            ->back()
            ->with('success', 'Role deleted successfully.');
    }
}
