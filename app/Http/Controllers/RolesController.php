<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Security\Privileges;
use Inertia\Facades\Props;
use Spark\Http\Request;

class RolesController extends Controller
{
    public function index(Request $request)
    {
        authorize('permission', 'roles.browse');

        $roles = Role::latest('id')
            ->when(
                $request->has('search'),
                fn($query) => $query->like('name', '%' . $request->input('search') . '%')
            )
            ->paginate($request->input('per_page', 10));

        return inertia('admin/roles', [
            'roles' => $roles,
            'privileges' => Props::once(Privileges::list()->toArray(...))
        ]);
    }

    public function store(Request $request)
    {
        authorize('permission', 'roles.create');

        $role = Role::create(
            $request->validate([
                'name' => 'required|max:100|unique:roles,name',
                'privileges' => 'required|array|min:1|max:200',
            ])
        );

        if ($role->wasCreated()) {
            return inertia()
                ->back()
                ->with('success', 'Role created successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to create role.');
    }

    public function update(int $id, Request $request)
    {
        authorize('permission', 'roles.edit');

        $role = Role::findOrFail($id);
        $role->fill(
            $request->validate([
                'name' => "required|max:100|unique:roles,name,$id",
                'privileges' => 'required|array|min:1|max:200',
            ])
        );

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
        authorize('permission', 'roles.delete');

        Role::destroy($id);

        return inertia()
            ->back()
            ->with('success', 'Role deleted successfully.');
    }
}
