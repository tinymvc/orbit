import type { LucideIcon } from "lucide-react";

// App Context Types
export interface MenuItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  permission?: string[];
  items?: SubMenuItem[];
  children?: SubMenuItem[];
}

export interface SubMenuItem {
  title: string;
  url: string;
  permission?: string[];
  children?: SubMenuItem[];
}

export interface DocumentItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface Menu {
  navMain: MenuItem[];
  navSecondary?: MenuItem[];
  documents?: DocumentItem[];
  hidden: MenuItem[];
}

export interface CurrentMenu {
  title: string;
  url: string;
  icon: LucideIcon | null;
}

export interface DashboardContextValue {
  menu: Menu;
  currentMenu: CurrentMenu;
  redirectToFirstMenu: () => boolean | void;
}
