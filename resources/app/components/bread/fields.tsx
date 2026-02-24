import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/date-picker";
import { DateTimePicker } from "@/components/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { headline } from "@/lib/utils";

// ─── Field Schema Types ─────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "url"
  | "tel"
  | "textarea"
  | "richtext"
  | "select"
  | "multi-select"
  | "checkbox"
  | "switch"
  | "date"
  | "datetime"
  | "hidden"
  | "file"
  | "slug"
  | "custom";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  /** The form field key */
  name: string;
  /** Display label. Auto-generated from name if omitted */
  label?: string;
  /** Field input type */
  type: FieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Field description / help text */
  description?: string;
  /** Max length for text inputs */
  maxLength?: number;
  /** Min value for number inputs */
  min?: number;
  /** Max value for number inputs */
  max?: number;
  /** Step for number inputs */
  step?: number;
  /** Number of rows for textarea */
  rows?: number;
  /** Options for select / multi-select */
  options?: FieldOption[];
  /** Default value */
  defaultValue?: unknown;
  /** Grid column span: 1 or 2 (default: 1 for normal fields, 2 for textarea/richtext) */
  colSpan?: 1 | 2;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Conditional visibility based on form data */
  visible?: (formData: Record<string, unknown>, isEdit: boolean) => boolean;
  /** Conditional disable based on form data */
  disabledWhen?: (
    formData: Record<string, unknown>,
    isEdit: boolean,
  ) => boolean;
  /** Source field for auto-slug generation */
  slugFrom?: string;
  /** Custom render function */
  render?: (props: {
    value: unknown;
    onChange: (value: unknown) => void;
    formData: Record<string, unknown>;
    isEdit: boolean;
    error?: string;
  }) => React.ReactNode;
  /** Only show on create */
  createOnly?: boolean;
  /** Only show on edit */
  editOnly?: boolean;
  /** Disable past dates for date/datetime */
  disablePast?: boolean;
  /** Disable future dates for date/datetime */
  disableFuture?: boolean;
  /** Group label — fields with the same group are placed under a section heading */
  group?: string;
  /** Whether to show in the form at all (useful for computed fields) */
  hidden?: boolean;

  // ─── File upload fields ───────────────────────────────────────────
  /** Server directory for uploads (e.g. "posts") */
  uploadTo?: string;
  /** Accepted file extensions (e.g. ["jpg","png","webp"]) */
  acceptedTypes?: string[];
  /** Max file size in KB */
  maxFileSize?: number;
  /** Media URL prefix for displaying existing files (e.g. "/uploads/") */
  mediaUrl?: string;
}

// ─── Slug Helper ────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Field Renderer ─────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  formData: Record<string, unknown>;
  isEdit: boolean;
}

export const FieldRenderer = React.memo<FieldRendererProps>(
  ({ field, value, onChange, error, formData, isEdit }) => {
    // Custom render
    if (field.type === "custom" && field.render) {
      return (
        <div className="space-y-2">
          {field.label !== null && (
            <Label htmlFor={field.name} className="block mb-2">
              {field.label || headline(field.name)}
              {field.required && <sup className="text-destructive"> *</sup>}
            </Label>
          )}
          {field.render({ value, onChange, formData, isEdit, error })}
          {field.description && !error && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    if (field.type === "hidden") {
      return null;
    }

    const label = field.label || headline(field.name);
    const isDisabled =
      field.disabled || (field.disabledWhen?.(formData, isEdit) ?? false);

    return (
      <div className="space-y-2">
        {field.type !== "checkbox" && field.type !== "switch" && (
          <Label htmlFor={field.name} className="block mb-2">
            {label}
            {field.required && <sup className="text-destructive"> *</sup>}
          </Label>
        )}

        {/* Text-like inputs */}
        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "password" ||
          field.type === "number" ||
          field.type === "url" ||
          field.type === "tel" ||
          field.type === "slug") && (
          <Input
            id={field.name}
            type={
              field.type === "slug"
                ? "text"
                : field.type === "number"
                  ? "number"
                  : field.type
            }
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${label.toLowerCase()}`}
            maxLength={field.maxLength}
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required}
            disabled={isDisabled}
          />
        )}

        {/* Textarea */}
        {field.type === "textarea" && (
          <Textarea
            id={field.name}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${label.toLowerCase()}`}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            required={field.required}
            disabled={isDisabled}
          />
        )}

        {/* Rich text (textarea with more rows for now) */}
        {field.type === "richtext" && (
          <Textarea
            id={field.name}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${label.toLowerCase()}`}
            rows={field.rows || 10}
            maxLength={field.maxLength}
            required={field.required}
            disabled={isDisabled}
            className="font-mono text-sm"
          />
        )}

        {/* Select */}
        {field.type === "select" && (
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${label.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Multi-select */}
        {field.type === "multi-select" && (
          <MultiSelectField
            options={field.options || []}
            value={(value as string[]) || []}
            onChange={onChange}
            disabled={isDisabled}
          />
        )}

        {/* Checkbox */}
        {field.type === "checkbox" && (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => onChange(!!checked)}
              disabled={isDisabled}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-normal cursor-pointer"
            >
              {label}
              {field.required && <sup className="text-destructive"> *</sup>}
            </Label>
          </div>
        )}

        {/* Switch */}
        {field.type === "switch" && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor={field.name} className="cursor-pointer">
                {label}
              </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {field.description}
                </p>
              )}
            </div>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => onChange(checked)}
              disabled={isDisabled}
            />
          </div>
        )}

        {/* Date */}
        {field.type === "date" && (
          <DatePicker
            value={(value as string) || undefined}
            onChange={(v) => onChange(v)}
            disabled={isDisabled}
            disablePast={field.disablePast}
            disableFuture={field.disableFuture}
          />
        )}

        {/* DateTime */}
        {field.type === "datetime" && (
          <DateTimePicker
            value={(value as string) || undefined}
            onChange={(v) => onChange(v)}
            disabled={isDisabled}
            disablePast={field.disablePast}
            disableFuture={field.disableFuture}
          />
        )}

        {/* File Upload */}
        {field.type === "file" && (
          <FileUploadField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
          />
        )}

        {/* Description (not shown for switch since it handles its own) */}
        {field.description && field.type !== "switch" && !error && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}

        {/* Error */}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

// ─── File Upload Field ──────────────────────────────────────────────────────

interface FileUploadFieldProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileUploadField = React.memo<FileUploadFieldProps>(
  ({ field, value, onChange, disabled }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [sizeError, setSizeError] = React.useState<string | null>(null);

    const acceptAttr = field.acceptedTypes?.length
      ? field.acceptedTypes.map((t) => `.${t}`).join(",")
      : undefined;

    const maxSizeBytes = field.maxFileSize ? field.maxFileSize * 1024 : null;

    // Determine what we're showing
    const isNewFile = value instanceof File;
    const isExistingFile = typeof value === "string" && value.length > 0;
    const hasFile = isNewFile || isExistingFile;

    // Build preview URL
    const previewUrl = React.useMemo(() => {
      if (isNewFile) return URL.createObjectURL(value as File);
      if (isExistingFile) {
        const path = value as string;
        // If already a full URL, use as-is
        if (path.startsWith("http://") || path.startsWith("https://"))
          return path;
        // Prefix with mediaUrl
        const base = (field.mediaUrl || "/uploads/").replace(/\/$/, "");
        return `${base}/${path.replace(/^\//, "")}`;
      }
      return null;
    }, [value, isNewFile, isExistingFile, field.mediaUrl]);

    // Cleanup blob URL
    React.useEffect(() => {
      return () => {
        if (isNewFile && previewUrl) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl, isNewFile]);

    const isImage = React.useMemo(() => {
      if (isNewFile) return (value as File).type.startsWith("image/");
      if (isExistingFile) {
        const ext = (value as string).split(".").pop()?.toLowerCase() ?? "";
        return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
          ext,
        );
      }
      return false;
    }, [value, isNewFile, isExistingFile]);

    const handleFiles = React.useCallback(
      (files: FileList | null) => {
        if (!files?.length) return;
        const file = files[0]!;

        // Validate size
        if (maxSizeBytes && file.size > maxSizeBytes) {
          setSizeError(
            `File too large (${formatFileSize(file.size)}). Max: ${formatFileSize(maxSizeBytes)}`,
          );
          return;
        }

        // Validate extension
        if (field.acceptedTypes?.length) {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
          if (!field.acceptedTypes.includes(ext)) {
            setSizeError(
              `Invalid file type (.${ext}). Accepted: ${field.acceptedTypes.join(", ")}`,
            );
            return;
          }
        }

        setSizeError(null);
        onChange(file);
      },
      [maxSizeBytes, field.acceptedTypes, onChange],
    );

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      },
      [disabled, handleFiles],
    );

    const handleRemove = React.useCallback(() => {
      onChange(null);
      setSizeError(null);
      if (inputRef.current) inputRef.current.value = "";
    }, [onChange]);

    return (
      <div className="space-y-2">
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />

        {/* Drop zone / upload area */}
        {!hasFile ? (
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <svg
              className="w-8 h-8 text-muted-foreground/60 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span>{" "}
              or drag and drop
            </p>
            {field.acceptedTypes?.length ? (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {field.acceptedTypes.map((t) => t.toUpperCase()).join(", ")}
                {field.maxFileSize
                  ? ` · Max ${formatFileSize(field.maxFileSize * 1024)}`
                  : ""}
              </p>
            ) : field.maxFileSize ? (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Max {formatFileSize(field.maxFileSize * 1024)}
              </p>
            ) : null}
          </div>
        ) : (
          /* File preview / info */
          <div className="relative flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
            {/* Image preview */}
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-16 h-16 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate pr-3">
                {isNewFile
                  ? (value as File).name
                  : (value as string).split("/").pop()}
              </p>
              {isNewFile && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize((value as File).size)}
                </p>
              )}
              {isExistingFile && (
                <p className="text-xs text-muted-foreground">Current file</p>
              )}

              {/* Replace button */}
              <button
                type="button"
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                Replace
              </button>
            </div>

            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleRemove}
                title="Remove file"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Size error */}
        {sizeError && <p className="text-xs text-destructive">{sizeError}</p>}
      </div>
    );
  },
);

// ─── Multi-Select Field ─────────────────────────────────────────────────────

interface MultiSelectFieldProps {
  options: FieldOption[];
  value: string[];
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

const MultiSelectField = React.memo<MultiSelectFieldProps>(
  ({ options, value, onChange, disabled }) => {
    const toggle = (optValue: string) => {
      const next = value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      onChange(next);
    };

    return (
      <div className="rounded-lg border bg-card p-3 space-y-2.5 max-h-48 overflow-y-auto">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={`ms-${opt.value}`}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
              disabled={disabled}
            />
            <Label
              htmlFor={`ms-${opt.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {opt.label}
            </Label>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground">No options available</p>
        )}
      </div>
    );
  },
);

// ─── Auto Form Fields Generator ─────────────────────────────────────────────

interface AutoFormFieldsProps {
  fields: FieldSchema[];
  formData: Record<string, unknown>;
  isEdit: boolean;
  handleChange: (field: string, value: unknown) => void;
  formErrors: Record<string, string>;
}

/**
 * Automatically renders form fields from a schema definition.
 * Supports grouping, conditional visibility, auto-slug, and grid layout.
 */
export const AutoFormFields = React.memo<AutoFormFieldsProps>(
  ({ fields, formData, isEdit, handleChange, formErrors }) => {
    // Filter fields based on visibility
    const visibleFields = fields.filter((f) => {
      if (f.hidden) return false;
      if (f.createOnly && isEdit) return false;
      if (f.editOnly && !isEdit) return false;
      if (f.visible && !f.visible(formData, isEdit)) return false;
      return true;
    });

    // Auto-slug handling
    const slugFields = visibleFields.filter(
      (f) => f.type === "slug" && f.slugFrom,
    );

    const handleFieldChange = React.useCallback(
      (fieldName: string, value: unknown) => {
        handleChange(fieldName, value);

        // Auto-populate slug fields
        for (const sf of slugFields) {
          if (sf.slugFrom === fieldName && !isEdit) {
            handleChange(sf.name, toSlug(value as string));
          }
        }
      },
      [handleChange, slugFields, isEdit],
    );

    // Group fields
    const groups = new Map<string, FieldSchema[]>();
    const ungrouped: FieldSchema[] = [];

    for (const field of visibleFields) {
      if (field.group) {
        if (!groups.has(field.group)) {
          groups.set(field.group, []);
        }
        groups.get(field.group)!.push(field);
      } else {
        ungrouped.push(field);
      }
    }

    const renderFieldGrid = (fieldList: FieldSchema[]) => {
      // Build rows: full-width fields get their own row, others pair up
      const rows: FieldSchema[][] = [];
      let currentRow: FieldSchema[] = [];

      for (const field of fieldList) {
        const span =
          field.colSpan ??
          (field.type === "textarea" ||
          field.type === "richtext" ||
          field.type === "multi-select" ||
          field.type === "custom"
            ? 2
            : 1);

        if (span === 2) {
          if (currentRow.length > 0) {
            rows.push(currentRow);
            currentRow = [];
          }
          rows.push([field]);
        } else {
          currentRow.push(field);
          if (currentRow.length === 2) {
            rows.push(currentRow);
            currentRow = [];
          }
        }
      }
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }

      return rows.map((row) => {
        if (row.length === 1) {
          const field = row[0]!;
          const span =
            field.colSpan ??
            (field.type === "textarea" ||
            field.type === "richtext" ||
            field.type === "multi-select" ||
            field.type === "custom"
              ? 2
              : 1);

          return (
            <div
              key={field.name}
              className={
                span === 2 ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-4"
              }
            >
              <FieldRenderer
                field={field}
                value={formData[field.name]}
                onChange={(v) => handleFieldChange(field.name, v)}
                error={formErrors[field.name]}
                formData={formData}
                isEdit={isEdit}
              />
            </div>
          );
        }

        return (
          <div
            key={row.map((f) => f.name).join("-")}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {row.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={(v) => handleFieldChange(field.name, v)}
                error={formErrors[field.name]}
                formData={formData}
                isEdit={isEdit}
              />
            ))}
          </div>
        );
      });
    };

    return (
      <div className="space-y-4 pb-4">
        {/* Ungrouped fields */}
        {renderFieldGrid(ungrouped)}

        {/* Grouped fields */}
        {Array.from(groups.entries()).map(([groupName, fieldList]) => (
          <div key={groupName} className="space-y-4">
            <div className="pt-2">
              <h3 className="text-sm font-semibold">{groupName}</h3>
              <div className="border-b mt-1.5" />
            </div>
            {renderFieldGrid(fieldList)}
          </div>
        ))}
      </div>
    );
  },
);

// ─── Column Helpers ─────────────────────────────────────────────────────────

export type ColumnType =
  | "text"
  | "badge"
  | "date"
  | "link"
  | "image"
  | "boolean"
  | "custom";

export interface ColumnSchema<TData = Record<string, unknown>> {
  /** The key in the data object */
  key: string;
  /** Header label. Auto-generated from key if omitted */
  header?: string;
  /** How to render the cell */
  type?: ColumnType;
  /** Badge variant mapping: value → variant */
  badgeMap?: Record<
    string,
    {
      label?: string;
      variant?: "default" | "secondary" | "outline" | "destructive";
    }
  >;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether clicking the cell opens edit */
  clickToEdit?: boolean;
  /** Custom cell render function */
  render?: (record: TData, index: number) => React.ReactNode;
  /** Whether the column is initially visible (default true) */
  visible?: boolean;
  /** Width class */
  className?: string;
  /** Relationship key (e.g., "user.display_name") */
  accessor?: string;
  /** Max display items for array fields */
  maxItems?: number;
  /** Date format string */
  dateFormat?: string;
  /** Image size class */
  imageSize?: string;
  /** Whether to truncate long text */
  truncate?: boolean | number;
}

/**
 * Resolve a nested accessor like "user.first_name" from a record
 */
export function resolveAccessor(
  record: Record<string, unknown>,
  accessor: string,
): unknown {
  return accessor
    .split(".")
    .reduce<unknown>((obj, key) => (obj as any)?.[key], record);
}
