import { MenuItem } from "@/types/context";
import { Users, CircleGauge, Rss } from "lucide-react";

export const navMain: MenuItem[] = [
  // Main navigation items for the admin dashboard
  {
    title: "Dashboard",
    url: "/admin",
    icon: CircleGauge,
    permission: ["dashboard.overview"],
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    permission: ["users.browse"],
  },
  {
    title: "Posts",
    icon: Rss,
    permission: ["posts.browse"],
    items: [
      {
        title: "All Posts",
        url: "/admin/posts",
      },
      {
        title: "Categories",
        url: "/admin/categories",
      },
    ],
  },
];

export const navSecondary: MenuItem[] = [
  // This section can be used for additional links like settings, support, etc.
];

export const breadcrumbSupport: MenuItem[] = [
  // This section can be used for support links or documentation.
  {
    title: "Profile",
    url: "/admin/profile",
  },
  {
    title: "Roles",
    url: "/admin/roles",
  },
];
