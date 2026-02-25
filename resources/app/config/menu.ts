import { MenuItem } from "@/types/context";
import { Users, CircleGauge, Settings, Rss } from "lucide-react";

export const navMain: MenuItem[] = [
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
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    permission: ["settings.general"],
  },
];

export const breadcrumbSupport: MenuItem[] = [
  {
    title: "Profile",
    url: "/admin/profile",
  },
  {
    title: "Roles",
    url: "/admin/roles",
  },
];
