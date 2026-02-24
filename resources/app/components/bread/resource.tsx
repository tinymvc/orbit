import * as React from "react";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { headline } from "@/lib/utils";
import { BreadActionsCell, type BreadConfig } from "@/components/bread";
import { type FieldSchema, AutoFormFields, resolveAccessor } from "./fields";
import { router } from "@inertiajs/react";

// ─── Server Schema Types ────────────────────────────────────────────────────

/**
 * Schema sent from the PHP Resource::toSchema() method.
 * All values are plain JSON — no functions.
 */
export interface ServerResourceSchema {
  name: string;
  title: string;
  description?: string | null;
  url: string;

  fields: ServerFieldSchema[];
  columns: ServerColumnSchema[];
  filters: ServerFilter[];
  bulkActions: ServerBulkAction[];

  permissions: {
    browse?: string | null;
    create?: string | null;
    edit?: string | null;
    delete?: string | null;
  };

  drawerWidth: "sm" | "md" | "lg" | "xl" | "2xl";
  disabled: string[];
  initialColumnVisibility: Record<string, boolean>;
  translations: Record<string, string>;
}

export interface ServerFieldSchema {
  name: string;
  label?: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  options?: { value: string; label: string }[] | string;
  defaultValue?: unknown;
  colSpan?: 1 | 2;
  disabled?: boolean;
  slugFrom?: string;
  createOnly?: boolean;
  editOnly?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  group?: string;
  hidden?: boolean;
  /** JSON-serialisable visibility condition, e.g. { status: "published" } */
  visibleWhen?: Record<string, unknown>;
  unique?: string;
  in?: string;

  // ─── File upload metadata ─────────────────────────────────────────
  /** Server upload directory (e.g. "posts") */
  uploadTo?: string;
  /** Accepted file extensions (e.g. ["jpg","png","webp"]) */
  acceptedTypes?: string[];
  /** Max file size in KB */
  maxFileSize?: number;
  /** Media URL prefix for displaying existing files */
  mediaUrl?: string;
}

export interface ServerColumnSchema {
  key: string;
  header?: string;
  type?: string;
  badgeMap?: Record<string, { label?: string; variant?: string }>;
  clickToEdit?: boolean;
  truncate?: number | boolean;
  visible?: boolean;
  className?: string;
  accessor?: string;
  imageSize?: string;
  /** For belongs_to columns — fields to concat from the relation */
  display?: string[];
  fallback?: string;
}

export interface ServerFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[] | string;
}

export interface ServerBulkAction {
  label: string;
  action: string;
  variant: "default" | "destructive";
}

// ─── Dynamic options helper ─────────────────────────────────────────────────

export type DynamicOptions = Record<string, { value: string; label: string }[]>;

function resolveOptions(
  options: { value: string; label: string }[] | string | undefined,
  dynamicOptions: DynamicOptions,
): { value: string; label: string }[] {
  if (!options) return [];
  if (typeof options === "string" && options.startsWith("dynamic:")) {
    return dynamicOptions[options.slice(8)] ?? [];
  }
  return Array.isArray(options) ? options : [];
}

// ─── Convert server field → frontend FieldSchema ────────────────────────────

function serverFieldToFieldSchema(
  sf: ServerFieldSchema,
  dynamicOptions: DynamicOptions,
): FieldSchema {
  const field: FieldSchema = {
    name: sf.name,
    label: sf.label,
    type: sf.type as FieldSchema["type"],
    placeholder: sf.placeholder,
    required: sf.required,
    description: sf.description,
    maxLength: sf.maxLength,
    min: sf.min,
    max: sf.max,
    step: sf.step,
    rows: sf.rows,
    options: resolveOptions(sf.options, dynamicOptions),
    defaultValue: sf.defaultValue,
    colSpan: sf.colSpan,
    disabled: sf.disabled,
    slugFrom: sf.slugFrom,
    createOnly: sf.createOnly,
    editOnly: sf.editOnly,
    disablePast: sf.disablePast,
    disableFuture: sf.disableFuture,
    group: sf.group,
    hidden: sf.hidden,
    // File upload metadata
    uploadTo: sf.uploadTo,
    acceptedTypes: sf.acceptedTypes,
    maxFileSize: sf.maxFileSize,
    mediaUrl: sf.mediaUrl,
  };

  // Convert visibleWhen JSON to a function
  if (sf.visibleWhen && Object.keys(sf.visibleWhen).length > 0) {
    const conditions = sf.visibleWhen;
    field.visible = (formData: Record<string, unknown>) =>
      Object.entries(conditions).every(([k, v]) => formData[k] === v);
  }

  return field;
}

// ─── Build BreadConfig from server schema ───────────────────────────────────

export function buildConfigFromSchema(
  schema: ServerResourceSchema,
  dynamicOptions: DynamicOptions = {},
): BreadConfig {
  const fields = schema.fields.map((f) =>
    serverFieldToFieldSchema(f, dynamicOptions),
  );

  // Default form values derived from field schemas
  const defaultForm: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      defaultForm[field.name] = field.defaultValue;
    } else {
      switch (field.type) {
        case "multi-select":
          defaultForm[field.name] = [];
          break;
        case "checkbox":
        case "switch":
          defaultForm[field.name] = false;
          break;
        case "number":
          defaultForm[field.name] = field.min ?? 0;
          break;
        default:
          defaultForm[field.name] = "";
      }
    }
  }

  const recordCallback = (record: Record<string, unknown>) => {
    const form: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.hidden) continue;
      const val = record[field.name];
      if (field.type === "file") {
        // Keep string paths as-is for preview; null/undefined → ""
        form[field.name] = val ?? "";
      } else if (field.type === "select" && val !== null && val !== undefined) {
        form[field.name] = String(val);
      } else {
        form[field.name] = val ?? defaultForm[field.name];
      }
    }
    return form;
  };

  const submitCallback = (formData: Record<string, unknown>) => {
    const data = { ...formData };
    for (const field of fields) {
      // Preserve File objects (Inertia auto-converts to FormData)
      if (data[field.name] instanceof File) continue;

      if (field.type === "password" && !data[field.name]) {
        delete data[field.name];
      }
      if (
        field.type === "select" &&
        field.name.endsWith("_id") &&
        data[field.name]
      ) {
        data[field.name] = Number(data[field.name]);
      }
      // For file fields:
      //   File object  → new upload (already handled above)
      //   null         → user removed the file, send empty string to signal deletion
      //   string path  → existing file unchanged, send as-is so backend skips it
      //   ""           → no file (create mode), skip
      if (field.type === "file") {
        if (data[field.name] === null) {
          data[field.name] = "";
        }
        // Keep string values (existing paths) so the backend knows not to delete
        continue;
      }
      if (
        !field.required &&
        !data[field.name] &&
        data[field.name] !== false &&
        data[field.name] !== 0
      ) {
        delete data[field.name];
      }
    }
    return data;
  };

  // Resolve filter dynamic options
  const filters = schema.filters.map((f) => ({
    key: f.key,
    label: f.label,
    options: resolveOptions(f.options, dynamicOptions),
  }));

  // Build bulk actions with router callbacks
  const bulkActions = schema.bulkActions.map((ba) => ({
    label: ba.label,
    action: ba.action,
    variant: ba.variant,
    callback: async (ids: number[]) => {
      router.post(
        `${schema.url}/bulk-action`,
        { action: ba.action, ids },
        { preserveScroll: true },
      );
    },
  }));

  // Strip null permissions
  const permissions: BreadConfig["permissions"] = {};
  if (schema.permissions.browse) permissions.browse = schema.permissions.browse;
  if (schema.permissions.create) permissions.create = schema.permissions.create;
  if (schema.permissions.edit) permissions.edit = schema.permissions.edit;
  if (schema.permissions.delete) permissions.delete = schema.permissions.delete;

  return {
    url: schema.url,
    title: schema.title,
    name: schema.name,
    description: schema.description ?? undefined,
    defaultForm,
    filters,
    permissions,
    recordCallback,
    submitCallback,
    translations: schema.translations as BreadConfig["translations"],
    size: { drawer_width: schema.drawerWidth },
    disabled: schema.disabled,
    initialColumnVisibility: schema.initialColumnVisibility,
    bulkActions,
  };
}

// ─── Build Columns from server schema ───────────────────────────────────────

export function buildColumnsFromSchema(
  schema: ServerResourceSchema,
): (params: {
  handleEdit: (record: Record<string, unknown>) => void;
  handleDelete: (id: number) => void;
  handleCreate: () => void;
  can: { delete: boolean; edit: boolean; create: boolean };
}) => ColumnDef<Record<string, unknown>>[] {
  return ({ handleEdit, handleDelete, can }) => {
    const cols: ColumnDef<Record<string, unknown>>[] = schema.columns.map(
      (col) => {
        const headerText = col.header ?? headline(col.key);

        return {
          accessorKey: col.key,
          header: headerText,
          enableHiding: col.visible !== false,
          cell: ({ row }: { row: Row<Record<string, unknown>> }) => {
            const record = row.original;
            const rawValue = col.accessor
              ? resolveAccessor(record, col.accessor)
              : record[col.key];
            const type = col.type ?? "text";

            const wrapClickToEdit = (content: React.ReactNode) => {
              if (col.clickToEdit) {
                return (
                  <Button
                    variant="link"
                    onClick={() => handleEdit(record)}
                    className="text-foreground w-fit px-0 text-left"
                  >
                    {content}
                  </Button>
                );
              }
              return content;
            };

            switch (type) {
              case "badge": {
                const strVal = String(rawValue ?? "");
                const mapping = col.badgeMap?.[strVal];
                return (
                  <Badge
                    variant={
                      (mapping?.variant ?? "secondary") as
                        | "default"
                        | "secondary"
                        | "outline"
                        | "destructive"
                    }
                  >
                    {mapping?.label ?? headline(strVal)}
                  </Badge>
                );
              }

              case "date":
                return (
                  <span className="text-sm text-muted-foreground">
                    {rawValue ? String(rawValue) : "—"}
                  </span>
                );

              case "image":
                return rawValue ? (
                  <img
                    src={String(rawValue)}
                    alt=""
                    className={
                      col.imageSize ?? "w-10 h-10 rounded-md object-cover"
                    }
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                );

              case "boolean":
                return (
                  <Badge variant={rawValue ? "default" : "outline"}>
                    {rawValue ? "Yes" : "No"}
                  </Badge>
                );

              case "belongs_to": {
                const related = record[col.key] as
                  | Record<string, unknown>
                  | null
                  | undefined;
                if (!related) {
                  return (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                }
                const displayFields = col.display ?? [];
                const name =
                  displayFields
                    .map((f) => String(related[f] ?? ""))
                    .join(" ")
                    .trim() ||
                  (col.fallback ? String(related[col.fallback] ?? "") : "—");
                return <span className="text-sm">{name}</span>;
              }

              case "text":
              default: {
                const text = String(rawValue ?? "—");
                const truncated =
                  col.truncate &&
                  text.length >
                    (typeof col.truncate === "number" ? col.truncate : 50)
                    ? text.slice(
                        0,
                        typeof col.truncate === "number" ? col.truncate : 50,
                      ) + "…"
                    : text;

                return wrapClickToEdit(
                  <span
                    className={`text-sm ${col.className ?? ""}`}
                    title={col.truncate ? text : undefined}
                  >
                    {truncated}
                  </span>,
                );
              }
            }
          },
        } satisfies ColumnDef<Record<string, unknown>>;
      },
    );

    // Actions column
    cols.push({
      id: "actions",
      cell: ({ row }: { row: Row<Record<string, unknown>> }) => {
        if (!can.edit && !can.delete) return null;
        return (
          <BreadActionsCell
            record={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
            can={can}
          />
        );
      },
    });

    return cols;
  };
}

// ─── Build FormFields Component from server field schemas ───────────────────

export function buildFormFieldsFromSchema(
  serverFields: ServerFieldSchema[],
  dynamicOptions: DynamicOptions = {},
): React.ComponentType<{
  formData: Record<string, unknown>;
  isEdit: boolean;
  handleChange: (field: string, value: unknown) => void;
  formErrors: Record<string, string>;
}> {
  const fields = serverFields.map((f) =>
    serverFieldToFieldSchema(f, dynamicOptions),
  );

  return function ServerFormFields({
    formData,
    isEdit,
    handleChange,
    formErrors,
  }) {
    return (
      <AutoFormFields
        fields={fields}
        formData={formData}
        isEdit={isEdit}
        handleChange={handleChange}
        formErrors={formErrors}
      />
    );
  };
}

// ─── Main Hook: useServerResource ───────────────────────────────────────────

/**
 * Converts a server-driven resource schema (from PHP Resource::toSchema())
 * into everything you need to render a Bread table.
 *
 * @example
 * ```tsx
 * const { config, columnsCallback, FormFields } = useServerResource(resource, dynamicOptions);
 * <Bread config={config} paginated={paginated} columnsCallback={columnsCallback} FormFields={FormFields} />
 * ```
 */
export function useServerResource(
  schema: ServerResourceSchema,
  dynamicOptions: DynamicOptions = {},
) {
  const config = React.useMemo(
    () => buildConfigFromSchema(schema, dynamicOptions),
    [schema, dynamicOptions],
  );
  const columnsCallback = React.useMemo(
    () => buildColumnsFromSchema(schema),
    [schema],
  );
  const FormFields = React.useMemo(
    () => buildFormFieldsFromSchema(schema.fields, dynamicOptions),
    [schema.fields, dynamicOptions],
  );

  return { config, columnsCallback, FormFields };
}
