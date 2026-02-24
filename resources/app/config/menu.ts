import { MenuItem } from "@/types/context";
import { Users, CircleGauge, Settings } from "lucide-react";

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
];

export const navSecondary: MenuItem[] = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    permission: ["settings.smtp"],
  },
];

export const hiddenItems: MenuItem[] = [
  {
    title: "Profile",
    url: "/admin/profile",
  },
  {
    title: "Roles",
    url: "/admin/roles",
  },
];
