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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { headline, toSlug } from "@/lib/utils";
import type { Row } from "@tanstack/react-table";
import { usePage } from "@inertiajs/react";

// ─── Type definitions ───────────────────────────────────────────────────────

interface RoleFormData {
  name: string;
  slug: string;
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
  isEdit: boolean;
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

// ─── Privilege Group Card ───────────────────────────────────────────────────

const FULL_ACCESS_KEY = "all.access";

interface GroupCardProps {
  groupKey: string;
  permissions: Record<string, string>;
  selected: string[];
  disabled: boolean;
  onTogglePermission: (key: string) => void;
  onToggleGroup: (groupKey: string) => void;
}

const GroupCard = React.memo<GroupCardProps>(
  ({
    groupKey,
    permissions,
    selected,
    disabled,
    onTogglePermission,
    onToggleGroup,
  }) => {
    const [open, setOpen] = React.useState(false);
    const keys = Object.keys(permissions);
    const count = keys.filter((k) => selected.includes(k)).length;
    const total = keys.length;
    const allSelected = count === total;
    const someSelected = count > 0 && !allSelected;
    const progress = total > 0 ? (count / total) * 100 : 0;

    return (
      <div
        className={`rounded-lg border transition-colors ${
          disabled
            ? "opacity-40 pointer-events-none"
            : allSelected
              ? "border-primary/40 bg-primary/3"
              : "bg-card"
        }`}
      >
        {/* Group header */}
        <button
          type="button"
          className="flex w-full items-center gap-3 p-3 text-left"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
        >
          <Checkbox
            id={`group-${groupKey}`}
            checked={allSelected}
            onCheckedChange={() => {
              onToggleGroup(groupKey);
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
            className={
              someSelected
                ? "data-[state=unchecked]:bg-primary/20 data-[state=unchecked]:border-primary"
                : ""
            }
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {headline(groupKey)}
              </span>
              <Badge
                variant={allSelected ? "default" : "secondary"}
                className="text-[0.65rem] px-1.5 py-0 h-4 font-medium"
              >
                {count}/{total}
              </Badge>
            </div>
            {/* Mini progress bar */}
            <div className="mt-1.5 h-0.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  allSelected ? "bg-primary" : "bg-primary/60"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <svg
            className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Expanded permissions */}
        {open && (
          <div className="px-4 pb-3 pt-0">
            <Separator className="mb-3" />
            <div className="grid gap-2 pl-2">
              {Object.entries(permissions).map(([permKey, permLabel]) => {
                const checked = selected.includes(permKey);
                return (
                  <label
                    key={permKey}
                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors cursor-pointer hover:bg-muted/60 ${
                      checked ? "bg-primary/5" : ""
                    }`}
                  >
                    <Checkbox
                      id={permKey}
                      checked={checked}
                      onCheckedChange={() => onTogglePermission(permKey)}
                      disabled={disabled}
                    />
                    <span className="text-[0.81rem] font-normal select-none">
                      {permLabel}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);

// ─── Privileges Box Component ──────────────────────────────────────────────

const PrivilegesBox = React.memo<PrivilegesBoxProps>(
  ({ formData, formErrors, handleChange }) => {
    const { props } = usePage<{
      privileges: Record<string, Record<string, string>>;
    }>();
    const allPrivileges = props.privileges || {};
    const currentPrivileges = formData.privileges || [];

    const hasFullAccess = currentPrivileges.includes(FULL_ACCESS_KEY);

    // Separate `all` group from the rest
    const groups = React.useMemo(() => {
      return Object.entries(allPrivileges).filter(([k]) => k !== "all");
    }, [allPrivileges]);

    // Total granular stats
    const totalPerms = groups.reduce(
      (sum, [, perms]) => sum + Object.keys(perms).length,
      0,
    );
    const selectedPerms = groups.reduce(
      (sum, [, perms]) =>
        sum +
        Object.keys(perms).filter((k) => currentPrivileges.includes(k)).length,
      0,
    );

    // ── Handlers ──────────────────────────────────────────────────────

    const handleFullAccessToggle = React.useCallback(
      (checked: boolean) => {
        if (checked) {
          handleChange("privileges", [FULL_ACCESS_KEY]);
        } else {
          handleChange("privileges", []);
        }
      },
      [handleChange],
    );

    const handlePrivilegeToggle = React.useCallback(
      (key: string) => {
        const next = currentPrivileges.includes(key)
          ? currentPrivileges.filter((p: string) => p !== key)
          : [...currentPrivileges, key];
        handleChange("privileges", next);
      },
      [currentPrivileges, handleChange],
    );

    const handleGroupToggle = React.useCallback(
      (groupKey: string) => {
        const groupPerms = Object.keys(allPrivileges[groupKey] || {});
        const allSelected = groupPerms.every((p) =>
          currentPrivileges.includes(p),
        );
        const next = allSelected
          ? currentPrivileges.filter((p: string) => !groupPerms.includes(p))
          : [...new Set([...currentPrivileges, ...groupPerms])];
        handleChange("privileges", next);
      },
      [currentPrivileges, allPrivileges, handleChange],
    );

    const handleSelectAll = React.useCallback(() => {
      const allKeys = groups.flatMap(([, perms]) => Object.keys(perms));
      handleChange("privileges", allKeys);
    }, [groups, handleChange]);

    const handleDeselectAll = React.useCallback(() => {
      handleChange("privileges", []);
    }, [handleChange]);

    return (
      <div className="space-y-4">
        <Label className="block">Privileges</Label>
        {formErrors.privileges && (
          <p className="text-xs text-destructive">{formErrors.privileges}</p>
        )}

        {/* ── Full Access toggle ───────────────────────────────────────── */}
        <div
          className={`rounded-lg border-2 p-4 transition-all ${
            hasFullAccess
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-muted hover:border-muted-foreground/30"
          }`}
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                hasFullAccess
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Full Access</div>
              <p className="text-xs text-muted-foreground">
                Grants unrestricted access to all areas. No other permissions
                needed.
              </p>
            </div>
            <Switch
              checked={hasFullAccess}
              onCheckedChange={handleFullAccessToggle}
            />
          </label>
        </div>

        {/* ── Granular permissions ──────────────────────────────────────── */}
        <div
          className={`space-y-3 transition-all ${
            hasFullAccess ? "opacity-40 pointer-events-none select-none" : ""
          }`}
        >
          {/* Quick actions bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedPerms} of {totalPerms} permissions selected
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={handleSelectAll}
                disabled={hasFullAccess || selectedPerms === totalPerms}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={handleDeselectAll}
                disabled={hasFullAccess || selectedPerms === 0}
              >
                Deselect all
              </Button>
            </div>
          </div>

          {/* Group cards */}
          {groups.map(([groupKey, permissions]) => (
            <GroupCard
              key={groupKey}
              groupKey={groupKey}
              permissions={permissions}
              selected={currentPrivileges}
              disabled={hasFullAccess}
              onTogglePermission={handlePrivilegeToggle}
              onToggleGroup={handleGroupToggle}
            />
          ))}
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
  ({ formData, isEdit, handleChange, formErrors }) => {
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
            onChange={(e) => {
              handleChange("name", e.target.value);
              !isEdit && handleChange("slug", toSlug(e.target.value));
            }}
            placeholder="Enter name"
            maxLength={100}
            required
          />
          {formErrors.name && (
            <p className="text-xs text-destructive">{formErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="block mb-2">
            Slug
          </Label>
          <div>
            <Input
              id="slug"
              value={fd.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="Enter slug"
              maxLength={100}
            />
            <span className="text-xs text-muted-foreground">
              Auto generated from name if left empty. Must be unique.
            </span>
          </div>
          {formErrors.slug && (
            <p className="text-xs text-destructive">{formErrors.slug}</p>
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
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }: { row: Row<Role> }) => (
      <Badge variant="secondary">{row.original.slug}</Badge>
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
    slug: role.slug || toSlug((role.name as string) || ""),
    privileges: role.privileges || [],
  }),
  submitCallback: (formData) => ({
    ...formData,
    slug: formData.slug || toSlug(formData.name as string),
  }),
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
