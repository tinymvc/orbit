import type { LucideIcon } from "lucide-react";

// App Context Types
export interface MenuItem {
  title: string;
  url: string;
  icon?: LucideIcon | null;
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

export interface Menu {
  navMain: MenuItem[];
  navSecondary?: MenuItem[];
  hidden?: MenuItem[];
}

export interface AppContextValue {
  app: AppConfig;
  privileges: Record<string, Record<string, string>>;
  menu: Menu;
  currentMenuItem: MenuItem;
  user: User | null;
  isAuthenticated: () => boolean;
  can: (permission: string) => boolean | null | undefined;
  cannot: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
}
