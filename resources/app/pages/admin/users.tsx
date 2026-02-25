import * as React from "react";

import Bread, {
  BreadActionsCell,
  type PaginatedData,
  type BreadConfig,
} from "@/components/bread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Row } from "@tanstack/react-table";
import { Link, usePage, router } from "@inertiajs/react";
import { Ban, Check, KeyRound, MailCheck, ShieldUser } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { headline } from "@/lib/utils";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// ─── Type definitions ───────────────────────────────────────────────────────

interface UserFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation?: string;
  roles: number[];
  [key: string]: unknown;
}

interface FormFieldsProps {
  formData: Record<string, unknown>;
  isEdit: boolean;
  handleChange: (field: string, value: unknown) => void;
  formErrors: Record<string, string>;
}

interface NameCellProps {
  row: Row<User>;
  onEdit: (user: User) => void;
}

interface EmailCellProps {
  email: string;
}

interface RolesCellProps {
  roles: Role[];
}

interface ColumnsCallbackParams {
  handleEdit: (user: User) => void;
  handleDelete: (id: number) => void;
  handleCreate: () => void;
  can: { edit: boolean; delete: boolean; create: boolean };
}

interface UserRolesSelectorProps {
  selectedRoles: number[];
  onChange: (roles: number[]) => void;
  error?: string;
}

// ─── User Roles Selector ─────────────────────────────────────────────────────

const UserRolesSelector = React.memo<UserRolesSelectorProps>(
  ({ selectedRoles, onChange, error }) => {
    const { props } = usePage<{ roles: Role[] }>();
    const availableRoles: Role[] = props.roles || [];

    const handleToggle = (roleId: number) => {
      const next = selectedRoles.includes(roleId)
        ? selectedRoles.filter((id) => id !== roleId)
        : [...selectedRoles, roleId];
      onChange(next);
    };

    return (
      <div className="space-y-2">
        <Label className="block mb-2">
          Roles <sup className="text-destructive">*</sup>
        </Label>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {availableRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roles available. Please{" "}
            <a href="/admin/roles" className="text-primary underline">
              create a role
            </a>{" "}
            first.
          </p>
        ) : (
          <div className="rounded-lg border bg-card p-3 space-y-3">
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-center gap-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => handleToggle(role.id)}
                />
                <Label
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {role.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

// ─── Memoized form fields component ─────────────────────────────────────────

const FormFields = React.memo<FormFieldsProps>(
  ({ formData, isEdit, handleChange, formErrors }) => {
    const fd = formData as unknown as UserFormData;

    return (
      <div className="space-y-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="block mb-2">
              First Name
            </Label>
            <Input
              id="first_name"
              value={fd.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              placeholder="Enter first name"
              maxLength={100}
            />
            {formErrors.first_name && (
              <p className="text-xs text-destructive">
                {formErrors.first_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="block mb-2">
              Last Name
            </Label>
            <Input
              id="last_name"
              value={fd.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              placeholder="Enter last name"
              maxLength={100}
            />
            {formErrors.last_name && (
              <p className="text-xs text-destructive">{formErrors.last_name}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="block mb-2">
            Username <sup className="text-destructive">*</sup>
          </Label>
          <Input
            id="username"
            value={fd.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Enter username"
            maxLength={100}
            required
          />
          {formErrors.username && (
            <p className="text-xs text-destructive">{formErrors.username}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="block mb-2">
            Email <sup className="text-destructive">*</sup>
          </Label>
          <Input
            id="email"
            value={fd.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter email"
            maxLength={100}
            required
          />
          {formErrors.email && (
            <p className="text-xs text-destructive">{formErrors.email}</p>
          )}
        </div>
        <div>
          {isEdit && (
            <h2 className="text-base font-medium mb-2">Change Password</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="block mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={fd.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Enter password"
                maxLength={100}
              />
              {formErrors.password && (
                <p className="text-xs text-destructive">
                  {formErrors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="block mb-2">
                Confirm Password
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                value={fd.password_confirmation || ""}
                onChange={(e) =>
                  handleChange("password_confirmation", e.target.value)
                }
                placeholder="Enter confirm password"
                maxLength={100}
              />
            </div>
          </div>
          {isEdit && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Leave blank to keep current password
            </p>
          )}
        </div>
        <UserRolesSelector
          selectedRoles={fd.roles || []}
          onChange={(roles) => handleChange("roles", roles)}
          error={formErrors.roles}
        />
      </div>
    );
  },
);

// ─── Memoized table cell components ─────────────────────────────────────────

const NameCell = React.memo<NameCellProps>(({ row, onEdit }) => (
  <Button
    variant="link"
    onClick={() => onEdit(row.original)}
    className="text-foreground w-fit px-0 text-left"
  >
    <img
      src={row.original.avatar_url || undefined}
      alt={row.original.display_name}
      className="inline-block w-6 h-6 rounded-full"
    />
    {row.original.display_name}
  </Button>
));

const EmailCell = React.memo<EmailCellProps>(({ email }) => (
  <Badge variant="secondary">{email}</Badge>
));

const StatusCell = React.memo<{ status: string }>(({ status }) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "default" },
    banned: { label: "Banned", color: "destructive" },
    suspended: { label: "Suspended", color: "destructive" },
    inactive: { label: "Inactive", color: "outline" },
  };

  const { label, color } = statusMap[status] || {
    label: headline(status),
    color: "default",
  };

  return <Badge variant={color as any}>{label}</Badge>;
});

const RolesCell = React.memo<RolesCellProps>(({ roles }) => {
  const count = roles.length;
  const visible = roles.slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((role) => (
        <Badge
          key={role.id}
          variant="outline"
          className="text-muted-foreground"
        >
          {role.name}
        </Badge>
      ))}
      {count > 3 && (
        <Badge variant="outline" className="text-muted-foreground">
          +{` ${count - 3}`}
        </Badge>
      )}
    </div>
  );
});

// ─── Columns ────────────────────────────────────────────────────────────────

const columnsCallback =
  (bulkAction: (action: string, selectedIds: number[]) => void) =>
  ({ handleEdit, handleDelete, can }: ColumnsCallbackParams) => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: Row<User> }) => (
        <NameCell row={row} onEdit={handleEdit} />
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: Row<User> }) => (
        <EmailCell email={row.original.email} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<User> }) => (
        <StatusCell status={row.original.status} />
      ),
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }: { row: Row<User> }) => (
        <RolesCell roles={(row.original.roles as Role[]) || []} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined At",
      cell: ({ row }: { row: Row<User> }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.created_at}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<User> }) => (
        <div className="flex items-center justify-end gap-0.5">
          {row.original.status !== "banned" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => bulkAction("banned", [row.original.id])}
                >
                  <Ban className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ban This User</p>
              </TooltipContent>
            </Tooltip>
          )}
          {row.original.status !== "active" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => bulkAction("active", [row.original.id])}
                >
                  <Check className="size-4 text-green-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Activate This User</p>
              </TooltipContent>
            </Tooltip>
          )}
          {(can.edit || can.delete) && (
            <BreadActionsCell
              record={row.original}
              onEdit={handleEdit}
              onDelete={handleDelete}
              can={can}
              extraItems={
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      bulkAction("send-reset-link", [row.original.id])
                    }
                  >
                    <KeyRound className="mr-1 size-4" />
                    Send Forgot Password Link
                  </DropdownMenuItem>
                  {!row.original.email_verified_at &&
                    row.original.status === "inactive" && (
                      <DropdownMenuItem
                        onClick={() =>
                          bulkAction("send-email-verification", [
                            row.original.id,
                          ])
                        }
                      >
                        <MailCheck className="mr-1 size-4" />
                        Send Email Verification Link
                      </DropdownMenuItem>
                    )}
                </>
              }
            />
          )}
        </div>
      ),
    },
  ];

// ─── Page Config ────────────────────────────────────────────────────────────

const config = (
  roles: Role[],
  bulkAction: (action: string, selectedIds: number[]) => void,
): BreadConfig => ({
  url: "/admin/users",
  title: "Users",
  name: "User",
  description: "Manage application users, their details, and role assignments.",
  filters: [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "banned", label: "Banned" },
        { value: "suspended", label: "Suspended" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "role",
      label: "Role",
      options: roles.map((role) => ({
        value: role.id.toString(),
        label: role.name,
      })) as { value: string; label: string }[],
    },
  ],
  defaultForm: {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    roles: [],
  },
  permissions: {
    browse: "users.browse",
    create: "users.create",
    delete: "users.delete",
    edit: "users.edit",
  },
  recordCallback: (user) => ({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    username: user.username || "",
    email: user.email || "",
    password: "",
    password_confirmation: "",
    roles: ((user.roles as Role[]) || []).map((r) => r.id),
  }),
  submitCallback: (formData) => {
    const data = { ...formData };
    if (!data.password) {
      delete data.password;
      delete data.password_confirmation;
    }
    return data;
  },
  extraActions: () => (
    <>
      <Link
        href="/admin/roles"
        className="text-sm text-primary hover:underline"
      >
        <Button variant="outline" size="sm">
          <ShieldUser />
          <span className="hidden md:inline-block">Manage Roles</span>
        </Button>
      </Link>
    </>
  ),
  bulkActions: [
    {
      label: "Active Selected",
      action: "active",
      variant: "default",
      callback: async (selectedIds) => bulkAction("active", selectedIds),
    },
    {
      label: "Ban Selected",
      action: "banned",
      variant: "default",
      callback: async (selectedIds) => bulkAction("banned", selectedIds),
    },
    {
      label: "Delete Selected",
      action: "delete",
      variant: "destructive",
      callback: async (selectedIds) => bulkAction("delete", selectedIds),
    },
  ],
});

// ─── Page Component ─────────────────────────────────────────────────────────

export default function UsersPage({
  users,
  roles,
}: {
  users: PaginatedData<User>;
  roles: Role[];
}) {
  const bulkAction = (action: string, selectedIds: number[]) => {
    router.post("/admin/users/bulk-action", {
      action,
      ids: selectedIds,
    });
  };

  return (
    <Bread<User>
      config={config(roles, bulkAction)}
      paginated={users}
      columnsCallback={columnsCallback(bulkAction)}
      FormFields={FormFields}
    />
  );
}
