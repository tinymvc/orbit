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
import type { Row } from "@tanstack/react-table";
import { usePage } from "@inertiajs/react";

// ─── Type definitions ───────────────────────────────────────────────────────

interface RoleFormData {
  name: string;
  privileges: string[];
  [key: string]: unknown;
}

interface PrivilegesBoxProps {
  formData: RoleFormData;
  formErrors: Record<string, string>;
  handleChange: (field: string, value: unknown) => void;
}

interface FormFieldsProps {
  formData: Record<string, unknown>;
  handleChange: (field: string, value: unknown) => void;
  formErrors: Record<string, string>;
}

interface NameCellProps {
  row: Row<Role>;
  onEdit: (user: Role) => void;
}

interface PrivilegesCellProps {
  privileges: string[];
}

interface ColumnsCallbackParams {
  handleEdit: (user: Role) => void;
  handleDelete: (id: number) => void;
  handleCreate: () => void;
  can: { edit: boolean; delete: boolean; create: boolean };
}

// ─── Privileges Box Component ──────────────────────────────────────────────

const PrivilegesBox = React.memo<PrivilegesBoxProps>(
  ({ formData, formErrors, handleChange }) => {
    const { props } = usePage<{
      privileges: Record<string, Record<string, string>>;
    }>();
    const privileges: Record<
      string,
      Record<string, string>
    > = props.privileges || {};

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
  const { props } = usePage<{
    privileges: Record<string, Record<string, string>>;
  }>();
  const privileges: Record<string, Record<string, string>> = props.privileges ||
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
  ({ formData, handleChange, formErrors }) => {
    const fd = formData as unknown as RoleFormData;

    return (
      <div className="space-y-4 pb-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="block mb-2">
            Name <sup className="text-destructive">*</sup>
          </Label>
          <Input
            id="name"
            value={fd.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter name"
            maxLength={100}
            required
          />
          {formErrors.name && (
            <p className="text-xs text-destructive">{formErrors.name}</p>
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
    {row.original.name}
  </Button>
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
    cell: ({ row }: { row: Row<Role> }) => (
      <NameCell row={row} onEdit={handleEdit} />
    ),
  },
  {
    accessorKey: "privileges",
    header: "Privileges",
    cell: ({ row }: { row: Row<Role> }) => (
      <PrivilegesCell
        privileges={(row.original.privileges as string[]) || []}
      />
    ),
  },
  {
    accessorKey: "created_at",
    header: "Updated At",
    cell: ({ row }: { row: Row<Role> }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.updated_at}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: { row: Row<Role> }) =>
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
  url: "/admin/roles",
  title: "Roles",
  name: "Role",
  description: "Manage application roles and their permissions.",
  defaultForm: {
    name: "",
    privileges: [],
  },
  permissions: {
    browse: "roles.browse",
    create: "roles.create",
    delete: "roles.delete",
    edit: "roles.edit",
  },
  recordCallback: (role) => ({
    name: role.name || "",
    privileges: role.privileges || [],
  }),
  submitCallback: (formData) => formData,
};

// ─── Page Component ─────────────────────────────────────────────────────────

export default function RolesPage({ roles }: { roles: PaginatedData<Role> }) {
  return (
    <Bread<Role>
      config={config}
      paginated={roles}
      columnsCallback={columnsCallback}
      FormFields={FormFields}
    />
  );
}
