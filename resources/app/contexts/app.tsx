import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

import { CircleGauge, type LucideIcon } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import type { AppContextValue, MenuItem, Menu } from "@/types/context";

import { DashboardMenuItems } from "@/lib/consts";

export const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// Inner provider that uses usePage (must be inside Inertia's App component)
const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { props } = usePage<{ app: AppConfig; auth: { user: User | null } }>();

  useEffect(() => {
    const flash = props.flash as {
      info?: string;
      success?: string;
      error?: string;
    };

    if (flash?.success) {
      toast.success(flash.success);
    } else if (flash?.error) {
      toast.error(flash.error);
    } else if (flash?.info) {
      toast.info(flash.info);
    }
  }, [props.flash]);

  const isAuthenticated = (): boolean =>
    !!props.auth.user && props.auth.user.id > 0;

  const can = (permission: string): boolean | null | undefined =>
    isAuthenticated() &&
    props.auth.user &&
    props.auth.user?.privileges &&
    props.auth.user.privileges.includes(permission);

  const canAny = (permissions: string[]): boolean =>
    permissions.some(
      (permission) =>
        isAuthenticated() &&
        props.auth?.user?.privileges &&
        props.auth.user.privileges.includes(permission),
    );

  const cannot = (permission: string): boolean => !can(permission);

  const filterMenuItemsByPermissions = (menuItems: MenuItem[]): MenuItem[] =>
    menuItems
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

  const menu: Menu = {
    navMain: filterMenuItemsByPermissions(DashboardMenuItems.navMain || []),
    navSecondary: filterMenuItemsByPermissions(
      DashboardMenuItems.navSecondary || [],
    ),
    hidden: DashboardMenuItems.hidden || [],
  };

  const isActive = (url?: string): boolean =>
    (!!url && url === location.pathname) ||
    (!!url &&
      url.includes(":") &&
      location.pathname.startsWith(url.split("/:")[0] || ""));

  const findActiveMenuItem = (
    items: MenuItem[],
    parentIcon?: LucideIcon | null,
  ): MenuItem | null => {
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

  const currentMenuItem: MenuItem = useMemo(() => {
    // Check main navigation
    const mainNavMatch = findActiveMenuItem(menu.navMain || []);
    if (mainNavMatch) return mainNavMatch;

    // Check secondary navigation
    const secondaryNavMatch = findActiveMenuItem(menu.navSecondary || []);
    if (secondaryNavMatch) return secondaryNavMatch;

    // Check hidden navigation
    const hiddenNavMatch = findActiveMenuItem(menu.hidden || []);
    if (hiddenNavMatch) return hiddenNavMatch;

    // Default to Dashboard
    return {
      title: "Dashboard",
      url: "/admin",
      icon: CircleGauge,
    };
  }, [location.pathname, menu]);

  // Context value to be provided to children components
  const value: AppContextValue = {
    app: props.app || ({} as AppConfig),
    menu,
    currentMenuItem,
    user: props.auth.user || (null as User | null),
    isAuthenticated,
    can,
    cannot,
    canAny,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContextProvider>{children}</AppContextProvider>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
};
