import { MenuItem } from "@/types/context";
import { Users, CircleGauge, Settings } from "lucide-react";

export const DashboardMenuItems = {
  navMain: [
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
  ] as MenuItem[],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      permission: ["settings.smtp"],
    },
  ] as MenuItem[],
  hidden: [
    {
      title: "Profile",
      url: "/admin/profile",
    },
    {
      title: "Roles",
      url: "/admin/roles",
    },
  ] as MenuItem[],
};
