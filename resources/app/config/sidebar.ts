import type { LucideIcon } from "lucide-react";

export const sidebarConfig = {
  collapsible: "icon", // offcanvas | icon | none
  variant: "inset", //  sidebar | floating | inset
};

export const siteIdentity: {
  home_url: string;
  name: string;
  icon?: LucideIcon;
  image?: string;
} = {
  home_url: "/admin",
  name: "Inertia Starter",
  // icon: Eclipse,
  image: "/favicon.ico",
};
