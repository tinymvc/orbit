import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";

import { CircleGauge, Loader2, type LucideIcon } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { AppContextValue, MenuItem, Menu } from "@/types/context";

import { navMain, navSecondary, hiddenItems } from "@/config/menu";

interface AlertState {
  open: boolean;
  loading: boolean;
  title: string;
  confirmText: string;
  cancelText: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

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

  const [alert, setAlert] = useState<AlertState>({
    open: false,
    loading: false,
    title: "",
    description: "",
    confirmText: "Yes",
    cancelText: "Close",
    onClose: () => setAlert((prev: AlertState) => ({ ...prev, open: false })),
    onConfirm: () => {},
  });

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
    navMain: filterMenuItemsByPermissions(navMain || []),
    navSecondary: filterMenuItemsByPermissions(navSecondary || []),
    hidden: hiddenItems || [],
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
    alert,
    fireAlert: (alert: Partial<AlertState>) =>
      setAlert({
        open: alert.open || true,
        loading: alert.loading || false,
        title: alert.title || "",
        description: alert.description || "",
        confirmText: alert.confirmText || "Yes",
        cancelText: alert.cancelText || "Close",
        onClose: () =>
          alert.onClose ||
          setAlert((prev: AlertState) => ({ ...prev, open: false })),
        onConfirm: alert.onConfirm || (() => {}),
      }),
    menu,
    currentMenuItem,
    user: props.auth.user || (null as User | null),
    isAuthenticated,
    can,
    cannot,
    canAny,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* ─── Global Alert ─────────────────────────────────────────────── */}
      <AlertDialog open={alert.open} onOpenChange={alert.onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alert.title}</AlertDialogTitle>
            <AlertDialogDescription>{alert.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={alert.loading}>
              {alert.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={alert.onConfirm}
              disabled={alert.loading}
            >
              {alert.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                alert.confirmText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppContext.Provider>
  );
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContextProvider>{children}</AppContextProvider>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
};
