import * as React from "react";
import { router } from "@inertiajs/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  ListFilter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Loader2,
  EllipsisVertical,
  Trash2,
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
  /** Query parameter key sent to the server */
  key: string;
  /** Display label */
  label: string;
  /** Available options */
  options: { value: string; label: string }[];
}

/** Props for the reusable BreadActionsCell component */
export interface BreadActionsCellProps<TData = Record<string, unknown>> {
  record: TData;
  onEdit: (record: TData) => void;
  onDelete: (id: number) => void;
  can: { edit: boolean; delete: boolean };
  /** Optional extra menu items rendered before edit/delete */
  extraItems?: React.ReactNode;
}

export interface BreadConfig {
  /** URL path for this resource, e.g. "/admin/users" */
  url: string;
  title?: string;
  name: string;
  description?: string;
  defaultForm: Record<string, unknown>;
  /** Define server-side filters shown as dropdowns */
  filters?: BreadFilter[];
  permissions?: {
    browse?: string;
    create?: string;
    delete?: string;
    edit?: string;
  };
  /** Transform a record from the table into form data for editing */
  recordCallback: (record: Record<string, unknown>) => Record<string, unknown>;
  /** Transform form data before submission */
  submitCallback: (
    formData: Record<string, unknown>,
  ) => Record<string, unknown>;
  translations?: {
    add_record?: string;
    delete?: string;
    delete_description?: string;
    delete_no?: string;
    delete_yes?: string;
  };
  size?: {
    drawer_width: "sm" | "md" | "lg" | "xl" | "2xl" | null;
  };
  disabled?: string[];
  initialColumnVisibility?: Record<string, boolean>;
  routing?: {
    enabled: boolean;
    createPath: string;
    editPath: (id: number) => string;
  };
  customActions?: React.ComponentType;
  bulkActions?: {
    label: string;
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
    can: { delete: boolean; edit: boolean; create: boolean };
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
}: BreadActionsCellProps<TData>) {
  if (!can.edit && !can.delete && !extraItems) return null;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {extraItems}
          {can.edit && (
            <DropdownMenuItem onClick={() => onEdit(record)}>
              <Pencil className="mr-1 size-4" />
              Edit
            </DropdownMenuItem>
          )}
          {can.edit && can.delete && <Separator className="my-1" />}
          {can.delete && (
            <DropdownMenuItem
              onClick={() => onDelete(record.id as number)}
              className="text-destructive"
            >
              <Trash2 className="mr-1 size-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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

        const options = {
          preserveScroll: true,
          onSuccess: () => clearDraftAndClose(),
          onError: (errors: Record<string, string>) => setFormErrors(errors),
          onFinish: () => setProcessing(false),
        };

        if (record?.id) {
          router.put(`${config.url}/${record.id}`, submitData as any, options);
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

    const formContent = (
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {record ? `Edit ${config.name}` : `Create ${config.name}`}
              </DrawerTitle>
              <DrawerDescription>
                {record
                  ? `Update the ${config.name.toLowerCase()} details below`
                  : `Add a new ${config.name.toLowerCase()} using the form below`}
              </DrawerDescription>
            </DrawerHeader>
            <div className="h-full flex flex-col gap-4 overflow-y-auto">
              {formContent}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    const DRAWER_WIDTH = {
      sm: "sm:max-w-sm",
      md: "sm:max-w-sm md:max-w-md",
      lg: "sm:max-w-sm md:max-w-md lg:max-w-lg",
      xl: "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl",
      "2xl": "sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl",
    }[config.size?.drawer_width || "md"];

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className={DRAWER_WIDTH}>
          <SheetHeader>
            <SheetTitle>
              {record ? `Edit ${config.name}` : `Create ${config.name}`}
            </SheetTitle>
            <SheetDescription>
              {record
                ? `Update the ${config.name.toLowerCase()} details below`
                : `Add a new ${config.name.toLowerCase()} using the form below`}
            </SheetDescription>
          </SheetHeader>
          <div className="h-full flex flex-col gap-4 overflow-y-auto">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

// ─── Main BREAD Component ───────────────────────────────────────────────────

export default function Bread<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({ config, paginated, columnsCallback, FormFields }: BreadProps<TData>) {
  // Derive pagination state from server response
  const currentPage = paginated?.page ?? 1;
  const pageSize = paginated?.limit ?? 10;
  const totalPages = paginated?.pages ?? 0;
  const totalItems = paginated?.total ?? 0;
  const data = paginated?.data ?? [];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState(
    config.initialColumnVisibility || {},
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  // Filter state: key → value (empty string means "all")
  const [activeFilters, setActiveFilters] = React.useState<
    Record<string, string>
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const initial: Record<string, string> = {};
    (config.filters || []).forEach((f) => {
      const v = params.get(f.key);
      if (v) initial[f.key] = v;
    });
    return initial;
  });
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<TData | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { can, cannot } = useApp();

  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Build common request params (search + filters + pagination)
  const buildParams = React.useCallback(
    (overrides: Record<string, string | number> = {}) => {
      const params: Record<string, string | number> = {
        page: overrides.page ?? currentPage,
        per_page: overrides.per_page ?? pageSize,
      };
      const search =
        overrides.search !== undefined
          ? overrides.search
          : debouncedSearchQuery;
      if (search) params.search = search;

      const filters =
        (overrides._filters as unknown as Record<string, string>) ??
        activeFilters;
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      return params;
    },
    [currentPage, pageSize, debouncedSearchQuery, activeFilters],
  );

  const navigate = React.useCallback(
    (params: Record<string, string | number>) => {
      router.get(config.url, params, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    },
    [config.url],
  );

  // Reload data when search query changes
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    navigate(
      buildParams({
        page: 1,
        search: debouncedSearchQuery as unknown as number,
      }),
    );
  }, [debouncedSearchQuery]);

  // Permission check
  if (config.permissions?.browse && cannot(config.permissions.browse)) {
    return <PermissionDenied />;
  }

  // ─── Handlers ───────────────────────────────────────────────────────

  const handleDelete = React.useCallback((id: number) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = React.useCallback(() => {
    if (!recordToDelete) return;
    setIsDeleting(true);

    router.delete(`${config.url}/${recordToDelete}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
      },
    });
  }, [recordToDelete, config.url]);

  const handleEdit = React.useCallback(
    (record: TData) => {
      if (config.routing?.enabled && record.id) {
        router.visit(config.routing.editPath(record.id as number));
      } else {
        setSelectedRecord(record);
        setDrawerOpen(true);
      }
    },
    [config.routing],
  );

  const handleCreate = React.useCallback(() => {
    if (config.routing?.enabled) {
      router.visit(config.routing.createPath);
    } else {
      setSelectedRecord(null);
      setDrawerOpen(true);
    }
  }, [config.routing]);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      navigate(buildParams({ page: newPage }));
    },
    [buildParams, navigate],
  );

  const handlePageSizeChange = React.useCallback(
    (value: string) => {
      navigate(buildParams({ page: 1, per_page: Number(value) }));
    },
    [buildParams, navigate],
  );

  const handleFilterChange = React.useCallback(
    (key: string, value: string) => {
      const newFilters = { ...activeFilters };
      if (value) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      setActiveFilters(newFilters);
      navigate(buildParams({ page: 1, _filters: newFilters as any }));
    },
    [activeFilters, buildParams, navigate],
  );

  const handleClearFilters = React.useCallback(() => {
    setActiveFilters({});
    navigate(buildParams({ page: 1, _filters: {} as any }));
  }, [buildParams, navigate]);

  const activeFilterCount = Object.keys(activeFilters).length;

  const handleCloseDrawer = React.useCallback(() => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  }, []);

  // ─── Table setup ────────────────────────────────────────────────────

  const columns = React.useMemo(() => {
    const baseColumns = columnsCallback({
      handleEdit,
      handleDelete,
      handleCreate,
      can: {
        delete: !config.permissions?.delete || !!can(config.permissions.delete),
        edit: !config.permissions?.edit || !!can(config.permissions.edit),
        create: !config.permissions?.create || !!can(config.permissions.create),
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
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id?.toString() ?? "",
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      pagination: { pageIndex: currentPage - 1, pageSize },
      columnVisibility,
      rowSelection,
    },
  });

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const startItem = data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Bulk selection
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedIds = selectedRows.map((row) => Number(row.id));

  const handleBulkAction = React.useCallback(
    async (action: NonNullable<typeof config.bulkActions>[0]) => {
      if (selectedIds.length === 0) return;

      try {
        await action.callback(selectedIds);
        setRowSelection({});
      } catch (error) {
        console.error("Bulk action error:", error);
      }
    },
    [selectedIds],
  );

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

        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!config.disabled?.includes("search") && (
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${config.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 h-8.5 text-[0.8rem]"
                />
              </div>
            )}
            {config.filters && config.filters.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <ListFilter className="h-4 w-4" />
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
                <PopoverContent align="start" className="w-60 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-1.5 py-0.5 text-xs text-muted-foreground"
                        onClick={handleClearFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  {config.filters.map((filter) => (
                    <div key={filter.key} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {filter.label}
                      </Label>
                      <Select
                        value={activeFilters[filter.key] || ""}
                        onValueChange={(v) =>
                          handleFilterChange(
                            filter.key,
                            v === "__all__" ? "" : v,
                          )
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={`All ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">
                            All {filter.label}
                          </SelectItem>
                          {filter.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>
          {selectedCount === 0 && <div className="flex-1" />}
          <div className="flex items-center gap-2.5">
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
                  .map((column) => {
                    return (
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
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            {config.customActions ? (
              <config.customActions />
            ) : (
              !config.disabled?.includes("add_record") &&
              (!config.permissions?.create ||
                can(config.permissions.create)) && (
                <Button onClick={handleCreate}>
                  <Plus className="size-4" />
                  {config.translations?.add_record || `Add ${config.name}`}
                </Button>
              )
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = config.filters?.find((f) => f.key === key);
              const optionLabel =
                filter?.options.find((o) => o.value === value)?.label ?? value;
              return (
                <Badge key={key} variant="secondary" className="gap-1 pr-1">
                  {filter?.label}: {optionLabel}
                  <button
                    type="button"
                    onClick={() => handleFilterChange(key, "")}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
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

        {config.bulkActions &&
          config.bulkActions.length > 0 &&
          selectedCount > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <EllipsisVertical className="h-4 w-4" />
                    Bulk Actions
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {config.bulkActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleBulkAction(action)}
                      variant={
                        action.variant === "destructive"
                          ? "destructive"
                          : undefined
                      }
                    >
                      {action.label}
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

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/85 hover:bg-muted/85"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
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
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden lg:block text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems}{" "}
            {config.name.toLowerCase()}s
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="hidden lg:flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium min-w-25">
              Page {currentPage} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={!canGoPrevious}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrevious}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(totalPages)}
                disabled={!canGoNext}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!config.routing?.enabled && FormFields && (
        <BreadDrawer
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          record={selectedRecord}
          FormFields={FormFields}
          config={config}
          cannot={cannot}
        />
      )}

      {(!config.permissions?.delete || can(config.permissions.delete)) && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {config?.translations?.delete || "Are you absolutely sure?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {config?.translations?.delete_description ||
                  `This action cannot be undone. This will permanently delete the ${config.name.toLowerCase()} and remove it from our servers.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                {config?.translations?.delete_no || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  config?.translations?.delete_yes || "Yes, Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
