import { createContext, useContext, useMemo, ReactNode } from "react";

import { Users, CircleGauge, Settings, type LucideIcon } from "lucide-react";

import type {
  DashboardContextValue,
  MenuItem,
  Menu,
  CurrentMenu,
} from "@/types/context";

export const DashboardContext = createContext<DashboardContextValue | null>(
  null,
);

export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within an DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const canAny = (permissions: string[]): boolean => {
    return true; // Placeholder: allow all permissions for now
  };

  const can = (permission: string): boolean => {
    return true; // Placeholder: allow all permissions for now
  };

  const cannot = (permission: string): boolean => {
    return false; // Placeholder: allow all permissions for now
  };

  const user = {
    id: "123",
    name: "John Doe",
    email: "john.doe@example.com",
  };

  const filterMenuItemsByPermissions = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems
      .filter((item) => !item.permission || canAny(item.permission))
      .map((item) => {
        if (item.items) {
          const filteredSubmenu = item.items.filter(
            (sub) => !sub.permission || canAny(sub.permission),
          );
          return { ...item, items: filteredSubmenu };
        }
        return item;
      });
  };

  const menu: Menu = {
    navMain: filterMenuItemsByPermissions([
      {
        title: "Dashboard",
        url: "/",
        icon: CircleGauge,
        permission: ["dashboard.overview"],
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
        permission: ["users.browse"],
      },
    ]),
    navSecondary: filterMenuItemsByPermissions([
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        permission: ["settings.smtp"],
      },
    ]),
    hidden: [
      {
        title: "Profile",
        url: "/profile",
      },
    ],
  };

  const isActive = (url?: string): boolean =>
    (!!url && url === location.pathname) ||
    (!!url &&
      url.includes(":") &&
      location.pathname.startsWith(url.split("/:")[0] || ""));

  const findActiveMenuItem = (
    items: MenuItem[],
    parentIcon?: LucideIcon | null,
  ): CurrentMenu | null => {
    for (const item of items) {
      const icon = item.icon || parentIcon || null;

      // Check current item
      if (isActive(item.url)) {
        return {
          title: item.title,
          url: item.url || "/",
          icon,
        };
      }

      // Check children
      if (item.children) {
        for (const child of item.children) {
          if (isActive(child.url)) {
            return {
              title: child.title,
              url: child.url || "/",
              icon,
            };
          }
        }
      }

      // Check nested items
      if (item.items) {
        for (const subItem of item.items) {
          if (isActive(subItem.url)) {
            return {
              title: subItem.title,
              url: subItem.url || "/",
              icon,
            };
          }

          // Check nested children
          if (subItem.children) {
            for (const child of subItem.children) {
              if (isActive(child.url)) {
                return {
                  title: child.title,
                  url: child.url || "/",
                  icon,
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  const currentMenu: CurrentMenu = useMemo(() => {
    // Check main navigation
    const mainNavMatch = findActiveMenuItem(menu.navMain || []);
    if (mainNavMatch) return mainNavMatch;

    // Check secondary navigation
    const secondaryNavMatch = findActiveMenuItem(menu.navSecondary || []);
    if (secondaryNavMatch) return secondaryNavMatch;

    // Check hidden navigation
    const hiddenNavMatch = findActiveMenuItem(menu.hidden || []);
    if (hiddenNavMatch) return hiddenNavMatch;

    // Check documents
    for (const item of menu.documents || []) {
      if (isActive(item.url)) {
        return {
          title: item.name,
          url: item.url || "/",
          icon: item.icon,
        };
      }
    }

    // Default to Dashboard
    return {
      title: "Dashboard",
      url: "/",
      icon: CircleGauge,
    };
  }, [location.pathname, menu]);

  const getFirstPermittedMenuItem = (): string | null => {
    const allMenuItems = [...menu.navMain, ...(menu.navSecondary || [])];
    for (const item of allMenuItems) {
      if (!item.permission || canAny(item.permission)) {
        if (item.items) {
          for (const subItem of item.items) {
            if (
              subItem.url &&
              (!subItem.permission || canAny(subItem.permission))
            ) {
              return subItem.url;
            }
          }
        }

        if (item.url) return item.url;
      }
    }
    return null; // No permitted menu item found
  };

  const redirectToFirstPermittedMenuItem = (): boolean | void => {
    const firstPermittedMenuItem = getFirstPermittedMenuItem();
    if (firstPermittedMenuItem) {
      // navigate(firstPermittedMenuItem);
      return;
    }
    return false;
  };

  // Context value to be provided to children components
  const value: DashboardContextValue = {
    menu,
    currentMenu,
    user,
    can,
    cannot,
    canAny,
    redirectToFirstMenu: redirectToFirstPermittedMenuItem,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
