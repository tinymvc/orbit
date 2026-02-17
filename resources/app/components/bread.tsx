import * as React from "react";
import { useNavigate } from "react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Plus,
  Search,
  Loader2,
  EllipsisVertical,
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
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

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
import { useAuth } from "@/contexts/auth";
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
import { headline } from "@/lib/utils";

// Type definitions
interface BreadConfig {
  title?: string;
  name: string;
  description?: string;
  defaultForm: Record<string, unknown>;
  permissions?: {
    browse?: string;
    create?: string;
    delete?: string;
    edit?: string;
  };
  recordCallback: (record: Record<string, unknown>) => Record<string, unknown>;
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
  createMutation: UseMutationResult<ApiResponse, AxiosError, unknown> | null;
  updateMutation: UseMutationResult<
    ApiResponse,
    AxiosError,
    { id: number; data: unknown }
  > | null;
  FormFields: React.ComponentType<{
    formData: Record<string, unknown>;
    isEdit: boolean;
    handleChange: (field: string, value: unknown) => void;
    formErrors: Record<string, string[]>;
  }>;
  config: BreadConfig;
  cannot: (permission: string) => boolean;
}

interface BreadProps<TData = Record<string, unknown>> {
  config: BreadConfig;
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
    formErrors: Record<string, string[]>;
  }>;
  fetchMutation: (
    params: QueryParams,
  ) => UseQueryResult<PaginatedResponse<TData>, AxiosError>;
  deleteMutation: UseMutationResult<ApiResponse, AxiosError, number>;
  createMutation: UseMutationResult<ApiResponse, AxiosError, unknown>;
  updateMutation: UseMutationResult<
    ApiResponse,
    AxiosError,
    { id: number; data: unknown }
  >;
}

interface QueryParams {
  page: number;
  per_page: number;
  search?: string;
}

// Memoized Bread Drawer Component
const BreadDrawer = React.memo<BreadDrawerProps>(
  ({
    isOpen,
    onClose,
    record,
    createMutation,
    updateMutation,
    FormFields,
    config,
    cannot,
  }) => {
    const isMobile = useIsMobile();
    const [formData, setFormData] = React.useState(config.defaultForm);
    const [formErrors, setFormErrors] = React.useState<
      Record<string, string[]>
    >({});
    const isSubmitting =
      (createMutation && createMutation.isPending) ||
      (updateMutation && updateMutation.isPending);

    // Extract errors from mutation results
    React.useEffect(() => {
      const activeMutation = record ? updateMutation : createMutation;
      if (activeMutation?.error) {
        const axiosError = activeMutation.error as AxiosError<ApiResponse>;
        const errors = axiosError.response?.data?.errors;
        if (errors) {
          setFormErrors(errors);
        }
      } else if (activeMutation?.isSuccess) {
        setFormErrors({});
      }
    }, [
      createMutation?.error,
      updateMutation?.error,
      createMutation?.isSuccess,
      updateMutation?.isSuccess,
      record,
    ]);

    React.useEffect(() => {
      if (isOpen) {
        setFormErrors({}); // Clear errors when drawer opens
        if (record) {
          setFormData(config.recordCallback(record));
        } else {
          setFormData({ ...config.defaultForm });
        }
      }
    }, [record, isOpen]);

    const handleChange = React.useCallback((field: string, value: unknown) => {
      setFormData((prev: Record<string, unknown>) => ({
        ...prev,
        [field]: value,
      }));
    }, []);

    const handleSubmit = React.useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
          // Combine country code and phone number
          const submitData = config.submitCallback(formData);

          if (record?.id && updateMutation) {
            await updateMutation.mutateAsync({
              id: record.id as number,
              data: submitData,
            });
          } else if (createMutation) {
            await createMutation.mutateAsync(submitData);
          }
          onClose();
        } catch (error) {
          // Error handling is done in the mutation hooks
          console.error("Form submission error:", error);
        }
      },
      [formData, record?.id, onClose, createMutation, updateMutation, config],
    );

    // permission create and edit check
    if (
      (!record &&
        config.permissions &&
        config.permissions.create &&
        cannot(config.permissions.create)) ||
      (record &&
        config.permissions &&
        config.permissions.edit &&
        cannot(config.permissions.edit))
    ) {
      return; // return nothing if no permission
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
            <Button
              type="submit"
              disabled={isSubmitting || false}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : record ? "Update" : "Create"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting || false}
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

export default function Bread<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  config,
  columnsCallback,
  FormFields,
  fetchMutation,
  deleteMutation,
  createMutation,
  updateMutation,
}: BreadProps<TData>) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState(
    config.initialColumnVisibility || {},
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<TData | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<number | null>(
    null,
  );

  const { can, cannot } = useAuth();

  // Debounce search query with use-debounce library
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Build query params
  const queryParams = React.useMemo((): QueryParams => {
    const params: QueryParams = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    };

    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }

    return params;
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchQuery]);

  // Use TanStack Query for data fetching
  const { data: response, isLoading } = fetchMutation(queryParams);

  // permission check
  if (
    config.permissions &&
    config.permissions.browse &&
    cannot(config.permissions.browse)
  ) {
    return <PermissionDenied />;
  }

  // Extract data from response
  const data = response?.data || [];
  const totalPages = response?.last_page || 0;
  const totalItems = response?.total || 0;

  const handleDelete = React.useCallback((id: number) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!recordToDelete) return;

    try {
      await deleteMutation.mutateAsync(recordToDelete);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Delete error:", error);
    } finally {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  }, [recordToDelete, deleteMutation]);

  const navigate = useNavigate();

  const handleEdit = React.useCallback(
    (record: TData) => {
      if (config.routing?.enabled && record.id) {
        navigate(config.routing.editPath(record.id as number));
      } else {
        setSelectedRecord(record);
        setDrawerOpen(true);
      }
    },
    [config.routing, navigate],
  );

  const handleCreate = React.useCallback(() => {
    if (config.routing?.enabled) {
      navigate(config.routing.createPath);
    } else {
      setSelectedRecord(null);
      setDrawerOpen(true);
    }
  }, [config.routing, navigate]);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [],
  );

  const handlePageSizeChange = React.useCallback((value: string) => {
    setPagination({
      pageIndex: 0,
      pageSize: Number(value),
    });
  }, []);

  const handleCloseDrawer = React.useCallback(() => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  }, []);

  // Memoize columns with stable references
  const columns = React.useMemo(() => {
    const baseColumns = columnsCallback({
      handleEdit,
      handleDelete,
      handleCreate,
      can: {
        delete: !config.permissions?.delete || can(config.permissions.delete),
        edit: !config.permissions?.edit || can(config.permissions.edit),
        create: !config.permissions?.create || can(config.permissions.create),
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
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id?.toString() ?? "",
    manualPagination: true,
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
  const startItem =
    data.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems,
  );

  // Get selected row IDs
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedIds = selectedRows.map((row) => Number(row.id));

  // Handle bulk actions
  const handleBulkAction = React.useCallback(
    async (action: NonNullable<typeof config.bulkActions>[0]) => {
      if (selectedIds.length === 0) return;

      try {
        await action.callback(selectedIds);
        // Clear selection after successful action
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
          {!config.disabled?.includes("search") && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${config.name.toLowerCase()}...`}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
          )}
          {!config.disabled?.includes("search") && selectedCount === 0 && (
            <div className="flex-1" />
          )}
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
              (!config.permissions ||
                !config.permissions.create ||
                can(config.permissions.create)) && (
                <Button onClick={handleCreate}>
                  <Plus className="size-4" />
                  {config.translations?.add_record || `Add ${config.name}`}
                </Button>
              )
            )}
          </div>
        </div>

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
                value={`${pagination.pageSize}`}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
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
        (createMutation || updateMutation) && (
          <BreadDrawer
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            record={selectedRecord}
            createMutation={createMutation}
            updateMutation={updateMutation}
            FormFields={FormFields}
            config={config}
            cannot={cannot}
          />
        )}

      {deleteMutation &&
        (!config.permissions ||
          !config.permissions.delete ||
          can(config.permissions.delete)) && (
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
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
                <AlertDialogCancel>
                  {config?.translations?.delete_no || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>
                  {config?.translations?.delete_yes || "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
    </>
  );
}
