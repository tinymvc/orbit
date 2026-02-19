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
import { headline } from "@/lib/utils";
import { useApp } from "@/contexts/app";
import type { Row } from "@tanstack/react-table";

// ─── Type definitions ───────────────────────────────────────────────────────

interface UserFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation?: string;
  privileges: string[];
  [key: string]: unknown;
}

interface PrivilegesBoxProps {
  formData: UserFormData;
  formErrors: Record<string, string>;
  handleChange: (field: string, value: unknown) => void;
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

interface PrivilegesCellProps {
  privileges: string[];
}

interface ColumnsCallbackParams {
  handleEdit: (user: User) => void;
  handleDelete: (id: number) => void;
  handleCreate: () => void;
  can: { edit: boolean; delete: boolean; create: boolean };
}

// ─── Privileges Box Component ──────────────────────────────────────────────

const PrivilegesBox = React.memo<PrivilegesBoxProps>(
  ({ formData, formErrors, handleChange }) => {
    const { app } = useApp();
    const privileges: Record<string, Record<string, string>> = app.privileges ||
    {};

    const handlePrivilegeToggle = (privilegeKey: string) => {
      const currentPrivileges = formData.privileges || [];
      const newPrivileges = currentPrivileges.includes(privilegeKey)
        ? currentPrivileges.filter((p: string) => p !== privilegeKey)
        : [...currentPrivileges, privilegeKey];
      handleChange("privileges", newPrivileges);
    };

    const handleGroupToggle = (groupKey: string) => {
      const groupPermissions = Object.keys(privileges[groupKey] || {});
      const currentPrivileges = formData.privileges || [];
      const allSelected = groupPermissions.every((p) =>
        currentPrivileges.includes(p),
      );

      const newPrivileges = allSelected
        ? currentPrivileges.filter((p: string) => !groupPermissions.includes(p))
        : [...new Set([...currentPrivileges, ...groupPermissions])];
      handleChange("privileges", newPrivileges);
    };

    return (
      <div className="space-y-4">
        <Label className="block mb-2">Privileges</Label>
        {formErrors.privileges && (
          <p className="text-xs text-destructive">{formErrors.privileges}</p>
        )}
        <div className="space-y-3">
          {Object.entries(privileges).map(([groupKey, permissions]) => {
            const groupPermissions = Object.keys(permissions);
            const currentPrivileges = formData.privileges || [];
            const allSelected = groupPermissions.every((p) =>
              currentPrivileges.includes(p),
            );
            const someSelected =
              groupPermissions.some((p) => currentPrivileges.includes(p)) &&
              !allSelected;

            return (
              <div
                key={groupKey}
                className="rounded-lg border bg-card text-card-foreground shadow-xs"
              >
                <div className="p-3 pb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`group-${groupKey}`}
                      checked={allSelected}
                      onCheckedChange={() => handleGroupToggle(groupKey)}
                      className={
                        someSelected
                          ? "data-[state=checked]:bg-muted-foreground"
                          : ""
                      }
                    />
                    <Label
                      htmlFor={`group-${groupKey}`}
                      className="text-sm font-semibold cursor-pointer"
                    >
                      {headline(groupKey)}
                    </Label>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-0">
                  <div className="space-y-3 pl-5">
                    {Object.entries(permissions).map(
                      ([permissionKey, permissionLabel]) => (
                        <div
                          key={permissionKey}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={permissionKey}
                            checked={(formData.privileges || []).includes(
                              permissionKey,
                            )}
                            onCheckedChange={() =>
                              handlePrivilegeToggle(permissionKey)
                            }
                          />
                          <Label
                            htmlFor={permissionKey}
                            className="text-[0.81rem] font-normal cursor-pointer"
                          >
                            {permissionLabel}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

// ─── Helpers ────────────────────────────────────────────────────────────────

const usePrivilegeLabel = () => {
  const { app } = useApp();
  const privileges: Record<string, Record<string, string>> = app.privileges ||
  {};

  return (key: string): string => {
    for (const group of Object.values(privileges)) {
      if (group[key]) {
        return group[key];
      }
    }
    return key;
  };
};

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
        <PrivilegesBox
          formData={fd}
          formErrors={formErrors}
          handleChange={handleChange}
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

const PrivilegesCell = React.memo<PrivilegesCellProps>(({ privileges }) => {
  const getLabel = usePrivilegeLabel();
  const count = privileges.length;
  const permissions = privileges.slice(0, 3).map((per: string) => (
    <Badge key={per} variant="outline" className="text-muted-foreground">
      {getLabel(per)}
    </Badge>
  ));
  return (
    <div className="flex flex-wrap gap-1.5">
      {permissions}{" "}
      {count > 3 && (
        <Badge variant="outline" className="text-muted-foreground">
          +{` ${count - 3}`}
        </Badge>
      )}
    </div>
  );
});

// ─── Columns ────────────────────────────────────────────────────────────────

const columnsCallback = ({
  handleEdit,
  handleDelete,
  can,
}: ColumnsCallbackParams) => [
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
    accessorKey: "privileges",
    header: "Privileges",
    cell: ({ row }: { row: Row<User> }) => (
      <PrivilegesCell
        privileges={(row.original.privileges as string[]) || []}
      />
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
    cell: ({ row }: { row: Row<User> }) =>
      (can.edit || can.delete) && (
        <BreadActionsCell
          record={row.original}
          onEdit={handleEdit}
          onDelete={handleDelete}
          can={can}
        />
      ),
  },
];

// ─── Page Config ────────────────────────────────────────────────────────────

const config: BreadConfig = {
  url: "/admin/users",
  title: "Users",
  name: "User",
  description: "Manage application users, their details, and permissions.",
  filters: [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "banned", label: "Banned" },
        { value: "unverified", label: "Unverified" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ],
  defaultForm: {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    privileges: [],
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
    privileges: user.privileges || [],
  }),
  submitCallback: (formData) => {
    const data = { ...formData };
    if (!data.password) {
      delete data.password;
      delete data.password_confirmation;
    }
    return data;
  },
};

// ─── Page Component ─────────────────────────────────────────────────────────

export default function UsersPage({ users }: { users: PaginatedData<User> }) {
  return (
    <Bread<User>
      config={config}
      paginated={users}
      columnsCallback={columnsCallback as any}
      FormFields={FormFields}
    />
  );
}
