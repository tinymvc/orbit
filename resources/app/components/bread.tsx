import * as React from "react";
import { router, usePage } from "@inertiajs/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Check,
  Filter,
  FilterX,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Loader2,
  EllipsisVertical,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import PermissionDenied from "@/components/denied";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { headline } from "@/lib/utils";
import { useApp } from "@/contexts/app";

import { breadActionIds, breadActionPermission, type FilterValue, parseAdvancedFilter, encodeAdvancedFilter, isActiveFilterValue, readFilterValueFromUrl, getFilterOptionLabels, buildPaginationJumpItems } from "@/lib/bread";
import { Combobox } from "./combobox";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import AdvancedFilterBuilder, { type AdvancedFilterField, type AdvancedFilterValue } from "./advanced-filter-builder";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Paginated response shape from the backend Paginator */
export interface PaginatedData<T = Record<string, unknown>> {
  data: T[];
  pages: number;
  page: number;
  offset: number;
  limit: number;
  first_item: number;
  last_item: number;
  total: number;
  keyword: string;
  links: {
    type: "previous" | "page" | "ellipsis" | "next";
    url: string | null;
    label: string | number;
    active?: boolean;
  }[];
}

/** Filter definition for the Bread component */
export interface BreadFilter {
  /** Query parameter key used as the local state key and display identifier */
  key: string;
  /**
   * Optional override for the query-param key sent to the server.
   * When omitted the `key` field is used as the API param.
   * Useful for exclude filters where the UI key ("list") differs from the
   * server param ("exclude_list").
   */
  queryKey?: string;
  /** Display label */
  label: string;
  /** Available options */
  options: { value: string | number; label: string }[];
  /** Use a multi-select combobox and send multiple values for this filter. */
  multiple?: boolean;
  /**
   * "exclude" renders the filter inside a separate Exclude popover.
   * Omit or pass "filter" to use the standard Filters popover.
   */
  variant?: "filter" | "exclude";
}

/** Props for the reusable BreadActionsCell component */
export interface BreadActionsCellProps<TData = Record<string, unknown>> {
  record: TData;
  onEdit: (record: TData) => void;
  onDelete: (id: number) => void;
  can: { edit: boolean; delete: boolean; restore?: boolean; forceDelete?: boolean };
  softDeletes?: BreadConfig["softDeletes"];
  onRestore?: (id: number) => void;
  onForceDelete?: (id: number) => void;
  disabled?: boolean;
  /** Optional extra menu items rendered before edit/delete */
  extraItems?: React.ReactNode;
}

export type BreadInlineEditOption = {
  value: string | number;
  label: string;
};

export interface BreadInlineEditCellProps {
  value: unknown;
  renderValue: (value: unknown) => React.ReactNode;
  onSave: (value: unknown) => Promise<void>;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "number" | "date" | "select";
  options?: BreadInlineEditOption[];
  required?: boolean;
  disabled?: boolean;
}

export interface BreadConfig {
  url: string;
  /** Legacy drawer width; editor.width takes precedence. */
  size?: { drawer_width: "sm" | "md" | "lg" | "xl" | "2xl" | null };
  title?: string;
  name: string;
  description?: string;
  defaultForm: Record<string, unknown>;
  permissions?: {
    browse?: string;
    create?: string;
    delete?: string;
    edit?: string;
    restore?: string;
    forceDelete?: string;
  };
  /** Enables trash views and row indicators for any BREAD table. */
  softDeletes?: {
    column: string;
    /** Preferred column for the badge; falls back to the first visible data column. */
    badgeColumn?: string;
  };
  recordCallback: (record: Record<string, unknown>) => Record<string, unknown>;
  submitCallback: (
    formData: Record<string, unknown>,
  ) => Record<string, unknown>;
  translations?: {
    add_record?: string;
    edit_record?: string;
    delete?: string;
    delete_description?: string;
    delete_no?: string;
    delete_yes?: string;
    add_record_description?: string;
    edit_record_description?: string;
  };
  editor?: {
    style?: "drawer" | "modal";
    width?:
      | "sm"
      | "md"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl"
      | "full"
      | null;
  };
  disabled?: string[];
  initialColumnVisibility?: Record<string, boolean>;
  /** Define server-side filters shown as dropdowns */
  filters?: BreadFilter[];
  routing?: {
    enabled: boolean;
    createPath: string;
    editPath: (id: number) => string;
  };
  deepLink?: {
    param: string;
    fetchRecord?: (id: number) => Promise<Record<string, unknown>>;
  };
  customActions?: React.ComponentType;
  extraActions?: React.ComponentType;
  serverSorting?: boolean;
  tableStateStorageKey?: string;
  pageSizeOptions?: number[];
  advancedFilters?: {
    fields: AdvancedFilterField[];
    title?: string;
    description?: string;
  };
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    action: string;
    variant: "default" | "destructive";
    callback: (selectedIds: number[]) => Promise<void>;
  }[];
}

interface BreadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record<string, unknown> | null;
  FormFields: React.ComponentType<{
    formData: Record<string, unknown>;
    isEdit: boolean;
    handleChange: (field: string, value: unknown) => void;
    formErrors: Record<string, string>;
  }>;
  config: BreadConfig;
  cannot: (permission: string) => boolean;
}

interface BreadProps<TData = Record<string, unknown>> {
  config: BreadConfig;
  /** Paginated response passed as an Inertia page prop */
  paginated: PaginatedData<TData>;
  columnsCallback: (params: {
    handleEdit: (record: TData) => void;
    handleDelete: (id: number) => void;
    handleCreate: () => void;
    handleRestore?: (id: number) => void;
    handleForceDelete?: (id: number) => void;
    isMutating?: boolean;
    can: { delete: boolean; edit: boolean; create: boolean; restore?: boolean; forceDelete?: boolean };
  }) => ColumnDef<TData>[];
  FormFields: React.ComponentType<{
    formData: Record<string, unknown>;
    isEdit: boolean;
    handleChange: (field: string, value: unknown) => void;
    formErrors: Record<string, string>;
  }>;
}

// ─── Reusable Actions Cell ──────────────────────────────────────────────────

export function BreadActionsCell<TData extends Record<string, unknown>>({
  record,
  onEdit,
  onDelete,
  can,
  extraItems,
  softDeletes,
  onRestore,
  onForceDelete,
  disabled,
}: BreadActionsCellProps<TData>) {
  const trashed = !!softDeletes && !!record[softDeletes.column];
  const editable = !trashed && can.edit;
  const deletable = trashed ? can.forceDelete && !!onForceDelete : can.delete;
  const restorable = trashed && can.restore && !!onRestore;
  if (!editable && !deletable && !restorable && !extraItems) return null;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled}>
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {extraItems}
          {editable && (
            <DropdownMenuItem onClick={() => onEdit(record)}>
              <Pencil className="mr-1 size-4" />
              Edit
            </DropdownMenuItem>
          )}
          {editable && deletable && <Separator className="my-1" />}
          {restorable && (
            <DropdownMenuItem onClick={() => onRestore?.(Number(record.id))}>
              <RotateCcw className="mr-1 size-4" /> Restore
            </DropdownMenuItem>
          )}
          {deletable && (
            <DropdownMenuItem
              onClick={() => trashed ? onForceDelete?.(Number(record.id)) : onDelete(Number(record.id))}
              className="text-destructive"
            >
              <Trash2 className="mr-1 size-4" />
              {trashed ? "Delete permanently" : softDeletes ? "Move to trash" : "Delete"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Reusable Inline Edit Cell ──────────────────────────────────────────────

const inlineInputValue = (
  value: unknown,
  type: BreadInlineEditCellProps["type"],
) => {
  if (value === null || value === undefined) return "";
  if (type === "date") return String(value).slice(0, 10);
  return String(value);
};

export function BreadInlineEditCell({
  value,
  renderValue,
  onSave,
  label,
  type = "text",
  options = [],
  required = false,
  disabled = false,
}: BreadInlineEditCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState(() => inlineInputValue(value, type));
  const [displayValue, setDisplayValue] = React.useState(value);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const committingRef = React.useRef(false);

  React.useEffect(() => {
    if (!editing) setDraft(inlineInputValue(value, type));
    setDisplayValue(value);
  }, [type, value]);

  const openEditor = () => {
    if (disabled || saving) return;
    setDraft(inlineInputValue(displayValue, type));
    setValidationError(null);
    setEditing(true);
  };

  const commit = async (rawValue = draft) => {
    if (committingRef.current) return;

    const trimmedValue = rawValue.trim();
    if (required && !trimmedValue) {
      setValidationError(`${label} is required.`);
      return;
    }

    let nextValue: unknown = trimmedValue || null;
    if (type === "number" && trimmedValue) {
      const numberValue = Number(trimmedValue);
      if (!Number.isFinite(numberValue)) {
        setValidationError(`${label} must be a valid number.`);
        return;
      }
      nextValue = numberValue;
    }

    if (
      inlineInputValue(displayValue, type) === inlineInputValue(nextValue, type)
    ) {
      setEditing(false);
      return;
    }

    committingRef.current = true;
    setSaving(true);
    setValidationError(null);

    try {
      await onSave(nextValue);
      setDisplayValue(nextValue);
      setDraft(inlineInputValue(nextValue, type));
      setEditing(false);
    } catch {
      setEditing(true);
      setValidationError(`Could not save ${label}. Please try again.`);
      setDraft(inlineInputValue(displayValue, type));
    } finally {
      committingRef.current = false;
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(inlineInputValue(displayValue, type));
    setValidationError(null);
    setEditing(false);
  };

  if (!editing) {
    if (disabled) return <>{renderValue(displayValue)}</>;

    return (
      <button
        type="button"
        onClick={openEditor}
        className="group/inline flex min-h-7 w-full min-w-24 items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Edit ${label}`}
        title={`Edit ${label}`}
      >
        <span className="min-w-0 flex-1">{renderValue(displayValue)}</span>
        {saving ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Pencil className="invisible group-hover:visible size-3 shrink-0 text-muted-foreground/45 transition-colors group-hover/inline:text-muted-foreground" />
        )}
      </button>
    );
  }

  if (type === "select") {
    return (
      <div>
      <select
        autoFocus
        value={draft}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          void commit(nextValue);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") cancel();
        }}
        disabled={saving}
        aria-label={label}
        className="h-8 w-full min-w-32 rounded-md border border-input bg-background px-2 text-xs shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      >
        {!required && <option value="">None</option>}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {validationError && <p role="alert" className="mt-1 text-xs text-destructive">{validationError}</p>}
      </div>
    );
  }

  return (
    <div className="min-w-44">
      <div className="flex items-center gap-px">
        <Input
          autoFocus
          type={type}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setValidationError(null);
          }}
          onBlur={() => void commit()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void commit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
          }}
          disabled={saving}
          aria-label={label}
          aria-invalid={Boolean(validationError)}
          className="h-8 text-xs"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-6 shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => void commit()}
          disabled={saving}
          aria-label={`Save ${label}`}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-6 shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancel}
          disabled={saving}
          aria-label={`Cancel editing ${label}`}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      {validationError && (
        <p className="mt-1 text-[10px] text-destructive">{validationError}</p>
      )}
    </div>
  );
}

// ─── Drawer Component ───────────────────────────────────────────────────────

const BreadDrawer = React.memo<BreadDrawerProps>(
  ({ isOpen, onClose, record, FormFields, config, cannot }) => {
    const isMobile = useIsMobile();
    // Draft ref persists create-form data across open/close cycles
    const draftRef = React.useRef<Record<string, unknown> | null>(null);

    const [formData, setFormData] = React.useState<Record<string, unknown>>(
      () =>
        record ? config.recordCallback(record) : { ...config.defaultForm },
    );
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
      {},
    );
    const [processing, setProcessing] = React.useState(false);

    // Reset form data when record/open state changes
    React.useEffect(() => {
      if (isOpen) {
        setFormErrors({});
        if (record) {
          // Edit mode: always load from record
          setFormData(config.recordCallback(record));
        } else {
          // Create mode: restore draft if available, otherwise default
          setFormData(draftRef.current ?? { ...config.defaultForm });
        }
      }
    }, [record, isOpen]);

    // Keep draft in sync for create mode
    React.useEffect(() => {
      if (isOpen && !record) {
        draftRef.current = formData;
      }
    }, [formData, isOpen, record]);

    const clearDraftAndClose = React.useCallback(() => {
      draftRef.current = null;
      onClose();
    }, [onClose]);

    const handleChange = React.useCallback((field: string, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setFormErrors((prev) => {
        if (prev[field]) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return prev;
      });
    }, []);

    const handleSubmit = React.useCallback(
      (e: React.SyntheticEvent) => {
        e.preventDefault();
        const submitData = config.submitCallback(formData);
        setProcessing(true);
        setFormErrors({});

        const hasFiles = Object.values(submitData).some(
          (v) =>
            v instanceof File ||
            (Array.isArray(v) && v.some((item) => item instanceof File)),
        );

        const options = {
          preserveScroll: true,
          forceFormData: hasFiles,
          onSuccess: () => clearDraftAndClose(),
          onError: (errors: Record<string, string>) => setFormErrors(errors),
          onFinish: () => setProcessing(false),
        };

        if (record?.id) {
          // Always POST with _method=put so PHP receives $_POST + $_FILES
          router.post(
            `${config.url}/${record.id}`,
            { ...submitData, _method: "put" } as any,
            { ...options, forceFormData: true },
          );
        } else {
          router.post(config.url, submitData as any, options);
        }
      },
      [formData, record?.id, onClose, config],
    );

    // Permission check
    if (
      (!record &&
        config.permissions?.create &&
        cannot(config.permissions.create)) ||
      (record && config.permissions?.edit && cannot(config.permissions.edit))
    ) {
      return null;
    }

    const formTitle = record ? (config.translations?.edit_record || `Edit ${config.name}`) : `Create ${config.name}`;
    const formDescription = record
      ? config.translations?.edit_record_description || `Update the ${config.name.toLowerCase()} details below`
      : config.translations?.add_record_description || `Add a new ${config.name.toLowerCase()} using the form below`;
    const close = (nextOpen: boolean) => { if (!nextOpen && !processing) onClose(); };
    const formContent = (
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 h-full">
        <div className="overflow-y-auto px-4 flex-1">
          <FormFields
            formData={formData}
            isEdit={!!record}
            handleChange={handleChange}
            formErrors={formErrors}
          />
        </div>

        <div className="px-4 py-4 border-t mt-auto shrink-0">
          <div className="flex gap-2">
            <Button type="submit" disabled={processing} className="flex-1">
              {processing ? "Saving..." : record ? "Update" : "Create"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={clearDraftAndClose}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    );

    if (isMobile) {
      return (
        <Drawer open={isOpen} onOpenChange={close}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{formTitle}</DrawerTitle>
              <DrawerDescription>{formDescription}</DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 flex flex-col gap-4 overflow-y-auto">
              {formContent}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    const EDITOR_STYLE = config?.editor?.style || "drawer";
    const EDITOR_WIDTH = {
      sm: "sm:max-w-sm",
      md: "sm:max-w-sm md:max-w-md",
      lg: "sm:max-w-sm md:max-w-md lg:max-w-lg",
      xl: "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl",
      "2xl": "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl",
      "3xl": "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-3xl",
      "4xl": "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-4xl",
      "5xl": "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-5xl",
      "6xl": "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-6xl",
      full: "w-full sm:max-w-7xl",
    }[config.editor?.width || config.size?.drawer_width || "md"];

    if (EDITOR_STYLE === "modal") {
      return (
        <Dialog open={isOpen} onOpenChange={close}>
          <DialogContent className={`p-0 ${EDITOR_WIDTH}`}>
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{formTitle}</DialogTitle>
              <DialogDescription>{formDescription}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] flex flex-col gap-4 overflow-y-auto">
              {formContent}
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Sheet open={isOpen} onOpenChange={close}>
        <SheetContent side="right" className={EDITOR_WIDTH}>
          <SheetHeader>
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
          </SheetHeader>
          <Separator className="-mt-3" />
          <div className="min-h-0 flex-1 flex flex-col gap-4 overflow-y-auto">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

export default function Bread<TData extends Record<string, unknown> = Record<string, unknown>>({ config, paginated, columnsCallback, FormFields }: BreadProps<TData>) {
  const page = usePage();
  const params = React.useMemo(() => new URL(page.url, window.location.origin).searchParams, [page.url]);
  const data = paginated?.data ?? [];
  const totalPages = paginated?.pages ?? 0;
  const totalItems = paginated?.total ?? 0;
  const currentPage = paginated?.page ?? 1;
  const pageSize = paginated?.limit ?? 10;
  const pagination = { pageIndex: currentPage - 1, pageSize };
  const { can, cannot, fireAlert } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState(config.initialColumnVisibility || {});
  const [rowSelection, setRowSelection] = React.useState({});
  const [localSorting, setLocalSorting] = React.useState<SortingState>([]);
  const sorting: SortingState = config.serverSorting
    ? (params.get("sort") ? [{ id: params.get("sort")!, desc: params.get("direction") !== "asc" }] : []) : localSorting;
  const [searchQuery, setSearchQuery] = React.useState(params.get("search") || "");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const previousSearch = React.useRef(searchQuery);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<TData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<number | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [permanentDelete, setPermanentDelete] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isBulkPending, setIsBulkPending] = React.useState(false);
  const trashScope = params.get("trashed") || "without";
  const regularFilters = (config.filters || []).filter((f) => f.variant !== "exclude");
  const excludeFilters = (config.filters || []).filter((f) => f.variant === "exclude");
  const readFilters = (filters: BreadFilter[]) => Object.fromEntries(filters.flatMap((f) => {
    const value = readFilterValueFromUrl(params, f.queryKey ?? f.key, f.multiple);
    return value && isActiveFilterValue(value) ? [[f.key, value]] : [];
  })) as Record<string, FilterValue>;
  const activeFilters = readFilters(regularFilters);
  const activeExcludeFilters = readFilters(excludeFilters);
  const activeFilterCount = Object.keys(activeFilters).length;
  const activeExcludeFilterCount = Object.keys(activeExcludeFilters).length;
  const advancedFilter = parseAdvancedFilter(params.get("af") ?? params.get("advanced_filter"));
  const storageKey = config.tableStateStorageKey ? `${config.tableStateStorageKey}:${(page.props.auth as { user?: { id?: number } } | undefined)?.user?.id ?? "user"}` : null;
  const restored = React.useRef(false);

  const navigate = (next: URLSearchParams) => {
    router.get(`${config.url}?${next.toString()}`, {}, {
      preserveState: true, preserveScroll: true, replace: true,
      onStart: () => setIsLoading(true), onFinish: () => setIsLoading(false),
    });
  };
  const changeParams = (changes: Record<string, FilterValue | number | undefined>, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      for (const name of Array.from(next.keys())) if (name === key || name.startsWith(`${key}[`)) next.delete(name);
      if (Array.isArray(value)) value.forEach((item, i) => next.set(`${key}[${i}]`, item));
      else if (value !== undefined && value !== "") next.set(key, String(value));
    }
    if (resetPage) next.set("page", "1");
    navigate(next);
  };
  React.useEffect(() => {
    const serverSearch = params.get("search") || "";
    // An earlier search response must not overwrite text still being typed.
    if (serverSearch !== previousSearch.current) {
      previousSearch.current = serverSearch;
      setSearchQuery(serverSearch);
    }
    setRowSelection({});
  }, [page.url]);
  React.useEffect(() => {
    if (previousSearch.current === debouncedSearchQuery) return;
    previousSearch.current = debouncedSearchQuery;
    changeParams({ search: debouncedSearchQuery });
  }, [debouncedSearchQuery]);
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      if (!restored.current) {
        restored.current = true;
        const saved = sessionStorage.getItem(storageKey);
        if (saved && !params.size) { navigate(new URLSearchParams(saved)); return; }
      }
      const saved = new URLSearchParams(params);
      if (config.deepLink) saved.delete(config.deepLink.param);
      sessionStorage.setItem(storageKey, saved.toString());
    } catch { /* Storage can be disabled by the browser. */ }
  }, [page.url, storageKey]);

  const setPagination = (update: { pageIndex: number; pageSize: number } | ((value: typeof pagination) => typeof pagination)) => {
    const next = typeof update === "function" ? update(pagination) : update;
    changeParams({ page: next.pageIndex + 1, per_page: next.pageSize }, false);
  };
  const handlePageSizeChange = (value: string) => changeParams({ per_page: Number(value) });
  const handlePageJumpChange = (value: string) => {
    const pageNumber = Number(value);
    if (Number.isInteger(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) changeParams({ page: pageNumber }, false);
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value);
  const changeFilter = (filters: BreadFilter[], key: string, value: FilterValue) => changeParams({ [filters.find((f) => f.key === key)?.queryKey ?? key]: value });
  const clearFilters = (filters: BreadFilter[]) => changeParams(Object.fromEntries(filters.map((f) => [f.queryKey ?? f.key, ""])));
  const handleFilterChange = (key: string, value: FilterValue) => changeFilter(regularFilters, key, value);
  const handleExcludeFilterChange = (key: string, value: FilterValue) => changeFilter(excludeFilters, key, value);
  const handleClearFilters = () => clearFilters(regularFilters);
  const handleClearExcludeFilters = () => clearFilters(excludeFilters);
  const setAdvancedFilter = (value?: AdvancedFilterValue) => changeParams({ af: value ? encodeAdvancedFilter(value) : "", advanced_filter: "" });
  const updateOpenRecordParam = React.useCallback((id: number | null) => {
    if (!config.deepLink) return;
    const next = new URLSearchParams(params);
    if (id) next.set(config.deepLink.param, String(id)); else next.delete(config.deepLink.param);
    router.replace({ url: `${config.url}?${next}`, preserveState: true, preserveScroll: true });
  }, [config.deepLink?.param, config.url, params]);
  const handleDelete = React.useCallback((id: number) => { setPermanentDelete(false); setRecordToDelete(id); setDeleteDialogOpen(true); }, []);
  const handleForceDelete = React.useCallback((id: number) => { setPermanentDelete(true); setRecordToDelete(id); setDeleteDialogOpen(true); }, []);
  const handleRestore = React.useCallback((id: number) => {
    setIsRestoring(true);
    router.post(`${config.url}/${id}/restore`, {}, {
      preserveScroll: true,
      onSuccess: () => setRowSelection({}),
      onFinish: () => setIsRestoring(false),
    });
  }, [config.url]);
  const confirmDelete = () => {
    if (!recordToDelete || isDeleting) return;
    setIsDeleting(true);
    router.delete(`${config.url}/${recordToDelete}${permanentDelete ? "/force-delete" : ""}`, {
      preserveScroll: true,
      onSuccess: () => { setDeleteDialogOpen(false); setRecordToDelete(null); setRowSelection({}); },
      onFinish: () => setIsDeleting(false),
    });
  };
  const handleEdit = React.useCallback((record: TData) => {
    if (config.softDeletes && record[config.softDeletes.column]) return;
    if (config.routing?.enabled) router.visit(config.routing.editPath(Number(record.id)));
    else { setSelectedRecord(record); setDrawerOpen(true); updateOpenRecordParam(Number(record.id)); }
  }, [config.routing, config.softDeletes, updateOpenRecordParam]);
  const handleCreate = React.useCallback(() => {
    if (config.routing?.enabled) router.visit(config.routing.createPath);
    else { setSelectedRecord(null); setDrawerOpen(true); updateOpenRecordParam(null); }
  }, [config.routing, updateOpenRecordParam]);
  const handleCloseDrawer = () => { setDrawerOpen(false); setSelectedRecord(null); updateOpenRecordParam(null); };
  const deepId = config.deepLink ? Number(params.get(config.deepLink.param)) : 0;
  const previousDeepId = React.useRef(0);
  React.useEffect(() => {
    const wasOpen = previousDeepId.current > 0;
    previousDeepId.current = deepId;
    if (!deepId && wasOpen && selectedRecord) {
      setSelectedRecord(null);
      setDrawerOpen(false);
    }
    if (!config.deepLink || config.routing?.enabled || !Number.isInteger(deepId) || deepId < 1) return;
    if (config.permissions?.edit && cannot(config.permissions.edit)) return;
    let cancelled = false;
    const current = data.find((record) => Number(record.id) === deepId);
    const show = (record: TData) => { if (!cancelled && !(config.softDeletes && record[config.softDeletes.column])) { setSelectedRecord(record); setDrawerOpen(true); } };
    if (current) show(current);
    else config.deepLink.fetchRecord?.(deepId).then((record) => show(record as TData)).catch(() => { if (!cancelled) updateOpenRecordParam(null); });
    return () => { cancelled = true; };
  }, [deepId]);
  const columns = React.useMemo(() => {
    const baseColumns = columnsCallback({
      handleEdit,
      handleDelete,
      handleCreate,
      handleRestore,
      handleForceDelete,
      isMutating: isRestoring || isDeleting || isBulkPending,
      can: {
        delete: !config.permissions?.delete || !!can(config.permissions.delete),
        edit: !config.permissions?.edit || !!can(config.permissions.edit),
        create: !config.permissions?.create || !!can(config.permissions.create),
        restore: !config.permissions?.restore || !!can(config.permissions.restore),
        forceDelete: !config.permissions?.forceDelete || !!can(config.permissions.forceDelete),
      },
    });

    // Add select column if bulk actions are enabled
    if (config.bulkActions && config.bulkActions.length > 0) {
      return [
        {
          id: "select",
          header: ({ table }: { table: any }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }: { row: any }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...baseColumns,
      ];
    }

    return baseColumns;
  }, [
    handleEdit,
    handleDelete,
    handleCreate,
    handleRestore,
    handleForceDelete,
    isRestoring,
    isDeleting,
    isBulkPending,
    config.permissions,
    columnsCallback,
    can,
    config.bulkActions,
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (config.serverSorting) changeParams({ sort: next[0]?.id || "", direction: next[0] ? (next[0].desc ? "desc" : "asc") : "" });
      else setLocalSorting(next);
    },
    enableMultiSort: false,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id?.toString() ?? "",
    manualPagination: true,
    manualSorting: config.serverSorting,
    pageCount: totalPages,
    state: {
      sorting,
      pagination,
      columnVisibility,
      rowSelection,
    },
  });

  const canGoPrevious = pagination.pageIndex > 0;
  const canGoNext = pagination.pageIndex < totalPages - 1;
  const paginationJumpItems = React.useMemo(
    () => buildPaginationJumpItems(totalPages, currentPage),
    [totalPages, currentPage],
  );
  const startItem =
    data.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems,
  );

  // Bulk action helpers
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedRecords = selectedRows.map((row) => row.original);
  const availableBulkActions = (config.bulkActions || []).filter((action) => {
    const permission = config.permissions?.[breadActionPermission(action.action)];
    return (!permission || can(permission)) && breadActionIds(selectedRecords, action.action, config.softDeletes?.column).length > 0;
  });

  const handleBulkAction = React.useCallback(
    async (action: NonNullable<typeof config.bulkActions>[0]) => {
      const selectedIds = breadActionIds(selectedRecords, action.action, config.softDeletes?.column);
      if (selectedIds.length === 0 || isBulkPending) return;

      const call = async () => {
        setIsBulkPending(true);
        try {
          await action.callback(selectedIds);
          setRowSelection({});
        } catch (error) {
          console.error("Bulk action error:", error);
        } finally {
          setIsBulkPending(false);
        }
      };

      if (action.action === "delete" || action.action === "force-delete") {
        const trash = !!config.softDeletes && action.action === "delete";
        const name = config.title || config.name;
        fireAlert({
          title: trash ? `Move ${name.toLowerCase()} to trash?` : `Permanently delete ${name.toLowerCase()}?`,
          description: trash ? `${selectedIds.length} selected records will move to the trash. You can restore them later.` : `${selectedIds.length} selected records and their files will be permanently deleted. This cannot be undone.`,
          confirmText: trash ? "Move to trash" : "Delete permanently",
          cancelText: "Cancel",
          onConfirm: () => call(),
        });
      } else {
        await call();
      }
    },
    [selectedRecords, config, fireAlert, isBulkPending],
  );
  // ─── Render ────────────────────────────────────────────────────────────────
  if (
    config.permissions &&
    config.permissions.browse &&
    cannot(config.permissions.browse)
  ) {
    return <PermissionDenied />;
  }

  return (
    <>
      <div className="px-4 lg:px-6 space-y-4">
        {(config.title || config.description) && (
          <div>
            {config.title && (
              <h1 className="text-2xl font-bold tracking-tight">
                {config.title}
              </h1>
            )}
            {config.description && (
              <p className="text-muted-foreground">{config.description}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {!config.disabled?.includes("search") && (
              <div className="relative w-full min-w-40 max-w-64 flex-1">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${config.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 h-8.5 text-sm"
                />
              </div>
            )}

            {config.softDeletes && (
              <Select
                value={trashScope}
                onValueChange={(value) => changeParams({ trashed: value === "without" ? "" : value })}
                disabled={isLoading || isBulkPending}
              >
                <SelectTrigger className="h-8.5 w-auto shrink-0 gap-2 text-sm" aria-label="Trash view">
                  <Trash2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <SelectValue>{trashScope === "only" ? "Trashed" : trashScope === "with" ? "All" : "Active"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="without">Without trashed</SelectItem>
                  <SelectItem value="with">With trashed</SelectItem>
                  <SelectItem value="only">Only trashed</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* ── Regular Filters popover ── */}
            {regularFilters.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Filter className="h-4 w-4" />
                    <span className="hidden lg:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 px-1.5 py-0 text-xs rounded-full"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-fit min-w-60 max-w-sm p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={handleClearFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  {regularFilters.map((filter) => {
                    const value = activeFilters[filter.key];
                    const options = filter.options.map((opt) => ({
                      value: opt.value.toString(),
                      label: opt.label,
                    }));

                    return (
                      <div key={filter.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {filter.label}
                        </Label>
                        {filter.multiple ? (
                          <Combobox
                            multiple
                            className="min-h-8 text-xs w-max max-w-full"
                            placeholder={`All ${filter.label}`}
                            value={Array.isArray(value) ? value : []}
                            options={options}
                            onChange={(v) =>
                              handleFilterChange(
                                filter.key,
                                Array.isArray(v) ? v : v ? [v] : [],
                              )
                            }
                          />
                        ) : filter.options.length >= 20 ? (
                          <Combobox
                            className="min-h-8 text-xs w-max max-w-full"
                            placeholder={`All ${filter.label}`}
                            value={typeof value === "string" ? value : ""}
                            options={[
                              { value: "", label: `All ${filter.label}` },
                              ...options,
                            ]}
                            onChange={(v) =>
                              handleFilterChange(
                                filter.key,
                                v === "__all__" || Array.isArray(v) ? "" : v,
                              )
                            }
                          />
                        ) : (
                          <Select
                            value={typeof value === "string" ? value : ""}
                            onValueChange={(v) =>
                              handleFilterChange(
                                filter.key,
                                v === "__all__" ? "" : v,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue
                                placeholder={`All ${filter.label}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">
                                All {filter.label}
                              </SelectItem>
                              {filter.options.map((opt) => (
                                <SelectItem
                                  key={opt.value.toString()}
                                  value={opt.value.toString()}
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </PopoverContent>
              </Popover>
            )}

            {config.advancedFilters && (
              <AdvancedFilterBuilder
                fields={config.advancedFilters.fields}
                title={config.advancedFilters.title}
                description={config.advancedFilters.description}
                value={advancedFilter}
                onChange={(next) => {
                  setAdvancedFilter(next);
                }}
              />
            )}

            {/* ── Exclude Filters popover ── */}
            {excludeFilters.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <FilterX className="h-4 w-4" />
                    <span className="hidden lg:inline">Exclude</span>
                    {activeExcludeFilterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 px-1.5 py-0 text-xs rounded-full"
                      >
                        {activeExcludeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-fit min-w-60 max-w-sm p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Exclude</h4>
                    {activeExcludeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={handleClearExcludeFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  {excludeFilters.map((filter) => {
                    const value = activeExcludeFilters[filter.key];
                    const options = filter.options.map((opt) => ({
                      value: opt.value.toString(),
                      label: opt.label,
                    }));

                    return (
                      <div key={filter.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {filter.label}
                        </Label>
                        {filter.multiple ? (
                          <Combobox
                            multiple
                            className="h-8 text-xs w-max max-w-full"
                            placeholder="None (include all)"
                            value={Array.isArray(value) ? value : []}
                            options={options}
                            onChange={(v) =>
                              handleExcludeFilterChange(
                                filter.key,
                                Array.isArray(v) ? v : v ? [v] : [],
                              )
                            }
                          />
                        ) : filter.options.length >= 20 ? (
                          <Combobox
                            className="h-8 text-xs w-max max-w-full"
                            placeholder="None (include all)"
                            value={typeof value === "string" ? value : ""}
                            options={[
                              { value: "", label: "None (include all)" },
                              ...options,
                            ]}
                            onChange={(v) =>
                              handleExcludeFilterChange(
                                filter.key,
                                v === "__none__" || Array.isArray(v) ? "" : v,
                              )
                            }
                          />
                        ) : (
                          <Select
                            value={typeof value === "string" ? value : ""}
                            onValueChange={(v) =>
                              handleExcludeFilterChange(
                                filter.key,
                                v === "__none__" ? "" : v,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="None (include all)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">
                                None (include all)
                              </SelectItem>
                              {filter.options.map((opt) => (
                                <SelectItem
                                  key={opt.value.toString()}
                                  value={opt.value.toString()}
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            {!config.disabled?.includes("columns") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 className="h-4 w-4" />
                    <span className="hidden lg:inline">Columns</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" &&
                        column.getCanHide(),
                    )
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : headline(column.id)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {config.extraActions && <config.extraActions />}
            {config.customActions ? (
              <config.customActions />
            ) : (
              !config.disabled?.includes("add_record") &&
              (!config.permissions ||
                !config.permissions.create ||
                can(config.permissions.create)) && (
                <Button onClick={handleCreate}>
                  <Plus className="size-4" />
                  <span className="hidden sm:block">
                    {config.translations?.add_record || `Add ${config.name}`}
                  </span>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Active regular filter badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = regularFilters.find((f) => f.key === key);
              const optionLabels = getFilterOptionLabels(filter, value);
              return (
                <Badge key={key} variant="secondary" className="gap-1 pr-1">
                  <span className="opacity-65 font-light">{filter?.label}</span>
                  {optionLabels.join(", ")}
                  <button
                    type="button"
                    onClick={() => handleFilterChange(key, "")}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/10"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">
                      Remove {filter?.label} filter
                    </span>
                  </button>
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Active exclude filter badges */}
        {activeExcludeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(activeExcludeFilters).map(([key, value]) => {
              const filter = excludeFilters.find((f) => f.key === key);
              const optionLabels = getFilterOptionLabels(filter, value);
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="gap-1 pr-1 border-destructive/40 text-destructive"
                >
                  <X className="h-3 w-3 opacity-60" />
                  <span className="opacity-65 font-light">{filter?.label}</span>
                  {optionLabels.join(", ")}
                  <button
                    type="button"
                    onClick={() => handleExcludeFilterChange(key, "")}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">
                      Remove {filter?.label} exclude filter
                    </span>
                  </button>
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={handleClearExcludeFilters}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Bulk actions toolbar */}
        {config.bulkActions &&
          config.bulkActions.length > 0 &&
          selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" disabled={isBulkPending || availableBulkActions.length === 0}>
                    <EllipsisVertical className="h-4 w-4" />
                    Bulk Actions
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {availableBulkActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleBulkAction(action)}
                      variant={
                        action.variant === "destructive"
                          ? "destructive"
                          : undefined
                      }
                    >
                      {action.icon && action.icon}
                      {action.label}{config.softDeletes && ` (${breadActionIds(selectedRecords, action.action, config.softDeletes.column).length})`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-sm font-medium">
                {selectedCount} {config.name.toLowerCase()}(s) selected
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.toggleAllPageRowsSelected(true)}
                >
                  Select all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRowSelection({})}
                >
                  Deselect all
                </Button>
              </div>
            </div>
          )}

        <Card className="p-0 overflow-hidden rounded-md border shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-muted/85 hover:bg-muted/85"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : config.serverSorting &&
                          header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="size-3.5" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-45" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <Loader2 className="mx-auto animate-spin opacity-50" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const trashed = !!config.softDeletes && !!row.original[config.softDeletes.column];
                    const cells = row.getVisibleCells();
                    const badgeCell = cells.find((cell) => cell.column.id === config.softDeletes?.badgeColumn)
                      ?? cells.find((cell) => cell.column.id !== "select" && cell.column.id !== "actions");

                    return (
                      <TableRow key={row.id} data-trashed={trashed || undefined} className="group data-[trashed=true]:bg-muted/40">
                        {cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {trashed && cell.id === badgeCell?.id ? (
                              <div className="flex items-center gap-2">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                <Badge variant="outline" className="shrink-0 gap-1 text-muted-foreground font-normal">
                                  <Trash2 className="size-3" aria-hidden="true" />
                                  Trashed
                                </Badge>
                              </div>
                            ) : flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center opacity-75"
                    >
                      No {config.name.toLowerCase()} found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden lg:block text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems}{" "}
            {config.name.toLowerCase()}s
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="hidden lg:flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {(
                    config.pageSizeOptions ?? [
                      10, 20, 30, 40, 50, 100, 200, 500,
                    ]
                  ).map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium min-w-25">
              Page {pagination.pageIndex + 1} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }
                disabled={!canGoPrevious}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex - 1,
                  }))
                }
                disabled={!canGoPrevious}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={`${currentPage}`}
                onValueChange={handlePageJumpChange}
                disabled={totalPages <= 1}
              >
                <SelectTrigger className="h-8!">
                  <SelectValue placeholder={`${currentPage}`} />
                </SelectTrigger>
                <SelectContent side="top" className="max-h-72">
                  {paginationJumpItems.map((item) =>
                    item.type === "page" ? (
                      <SelectItem key={item.page} value={`${item.page}`}>
                        {item.page}
                      </SelectItem>
                    ) : (
                      <SelectItem key={item.key} value={item.key} disabled>
                        ...
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex + 1,
                  }))
                }
                disabled={!canGoNext}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: totalPages - 1,
                  }))
                }
                disabled={!canGoNext}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!config.routing?.enabled &&
        FormFields &&
        (
          <BreadDrawer
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            record={selectedRecord}
            FormFields={FormFields}
            config={config}
            cannot={cannot}
          />
        )}

      {        (!(permanentDelete ? config.permissions?.forceDelete : config.permissions?.delete) ||
          can((permanentDelete ? config.permissions?.forceDelete : config.permissions?.delete)!)) && (
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => { if (!isDeleting) setDeleteDialogOpen(open); }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {permanentDelete ? "Delete permanently?" : config.softDeletes ? "Move to trash?" : config?.translations?.delete || "Are you absolutely sure?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {config.softDeletes && !permanentDelete
                    ? `This ${config.name.toLowerCase()} will be hidden from active records. Its files will be kept, and you can restore it later.`
                    : permanentDelete ? `This ${config.name.toLowerCase()} and its files will be permanently deleted. This cannot be undone.`
                    : config?.translations?.delete_description || `This action cannot be undone. This will permanently delete the ${config.name.toLowerCase()} and its files.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {config?.translations?.delete_no || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => { event.preventDefault(); confirmDelete(); }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    permanentDelete ? "Delete permanently" : config.softDeletes ? "Move to trash" : config?.translations?.delete_yes || "Yes, Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
    </>
  );
}
