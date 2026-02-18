import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import Bread, {
  type PaginatedData,
  type BreadConfig,
} from "@/components/bread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const config: BreadConfig = {
  url: "/admin/users",
  title: "Users",
  name: "User",
  description: "Manage your users and their permissions.",
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
    edit: "users.edit",
    delete: "users.delete",
  },
  recordCallback: (record) => ({
    first_name: record.first_name || "",
    last_name: record.last_name || "",
    username: record.username || "",
    email: record.email || "",
    password: "",
    password_confirmation: "",
    privileges: record.privileges || [],
  }),
  submitCallback: (formData) => {
    const data = { ...formData };
    // Remove empty password on update
    if (!data.password) {
      delete data.password;
      delete data.password_confirmation;
    }
    return data;
  },
};

function FormFields({
  formData,
  isEdit,
  handleChange,
  formErrors,
}: {
  formData: Record<string, unknown>;
  isEdit: boolean;
  handleChange: (field: string, value: unknown) => void;
  formErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={(formData.first_name as string) || ""}
            onChange={(e) => handleChange("first_name", e.target.value)}
          />
          {formErrors.first_name && (
            <p className="text-sm text-destructive">{formErrors.first_name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={(formData.last_name as string) || ""}
            onChange={(e) => handleChange("last_name", e.target.value)}
          />
          {formErrors.last_name && (
            <p className="text-sm text-destructive">{formErrors.last_name}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={(formData.username as string) || ""}
          onChange={(e) => handleChange("username", e.target.value)}
        />
        {formErrors.username && (
          <p className="text-sm text-destructive">{formErrors.username}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={(formData.email as string) || ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {formErrors.email && (
          <p className="text-sm text-destructive">{formErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password{" "}
          {isEdit && (
            <span className="text-muted-foreground">
              (leave blank to keep current)
            </span>
          )}
        </Label>
        <Input
          id="password"
          type="password"
          value={(formData.password as string) || ""}
          onChange={(e) => handleChange("password", e.target.value)}
        />
        {formErrors.password && (
          <p className="text-sm text-destructive">{formErrors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_confirmation">Confirm Password</Label>
        <Input
          id="password_confirmation"
          type="password"
          value={(formData.password_confirmation as string) || ""}
          onChange={(e) =>
            handleChange("password_confirmation", e.target.value)
          }
        />
      </div>
    </div>
  );
}

const columnsCallback = ({
  handleEdit,
  handleDelete,
  can,
}: {
  handleEdit: (record: User) => void;
  handleDelete: (id: number) => void;
  handleCreate: () => void;
  can: { delete: boolean; edit: boolean; create: boolean };
}): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Username
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "first_name",
    header: "First Name",
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return date ? new Date(date).toLocaleDateString() : "—";
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      if (!can.edit && !can.delete) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {can.edit && (
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                Edit
              </DropdownMenuItem>
            )}
            {can.delete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(user.id)}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface UsersPageProps {
  users: PaginatedData<User>;
}

export default function UsersPage({ users }: UsersPageProps) {
  return (
    <Bread<User>
      config={config}
      paginated={users}
      columnsCallback={columnsCallback}
      FormFields={FormFields}
    />
  );
}
