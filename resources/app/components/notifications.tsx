import { useState, useCallback } from "react";
import {
  Bell,
  BellOff,
  ShoppingBag,
  UserPlus,
  Settings,
  ShieldCheck,
  MessageSquare,
  Info,
  X,
  CreditCard,
  Package,
  Mail,
  AlertTriangle,
  CheckCircle,
  Heart,
  Star,
  Tag,
  Upload,
  Download,
  Megaphone,
  Calendar,
  FileText,
  type LucideIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, router, usePage } from "@inertiajs/react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Notification {
  id: number;
  title: string;
  description: string | null;
  slug: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
}

interface SharedNotifications {
  unreadCount: number;
}

// ─── Icon mapping by notification type ──────────────────────────────────────

const typeIcons: Record<string, LucideIcon> = {
  order: ShoppingBag,
  user: UserPlus,
  system: Settings,
  security: ShieldCheck,
  comment: MessageSquare,
  payment: CreditCard,
  shipping: Package,
  email: Mail,
  warning: AlertTriangle,
  success: CheckCircle,
  like: Heart,
  review: Star,
  promotion: Tag,
  upload: Upload,
  download: Download,
  announcement: Megaphone,
  event: Calendar,
  report: FileText,
  info: Info,
};

function getIconForType(type: string): LucideIcon {
  return typeIcons[type] || Bell;
}

// ─── Type badge colors ──────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
  order: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  user: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  system:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  security: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  comment:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  payment:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  shipping:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  email:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  warning:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  like: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  review:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  promotion:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  upload: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  download: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  announcement:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  event: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  report:
    "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

function getColorForType(type: string): string {
  return typeColors[type] || "bg-muted text-muted-foreground";
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Notifications() {
  const { notifications: shared } = usePage<{
    notifications: SharedNotifications | null;
  }>().props;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = shared?.unreadCount ?? 0;

  // Fetch notifications via lazy shared prop — no navigation, stays on current page
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen && !loaded) {
        setLoading(true);
        router.reload({
          only: ["notificationItems"],
          onSuccess: (page) => {
            const data = (page.props as Record<string, unknown>)
              .notificationItems as Notification[] | undefined;
            setItems(data ?? []);
            setLoaded(true);
            setLoading(false);
          },
          onError: () => setLoading(false),
        });
      }
    },
    [loaded],
  );

  // ─── Actions ────────────────────────────────────────────────────────

  const postAction = useCallback(
    (data: Record<string, unknown>, optimisticUpdate: () => void) => {
      optimisticUpdate();
      router.post("/admin/notifications", data as Record<string, string>, {
        preserveState: true,
        preserveScroll: true,
        onError: () => {
          // Reset loaded state so next open re-fetches
          setLoaded(false);
        },
      });
    },
    [],
  );

  const handleMarkAllAsRead = () => {
    postAction({ action: "mark-all-read" }, () => {
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
      );
    });
  };

  const handleClear = () => {
    postAction({ action: "clear" }, () => setItems([]));
  };

  const handleRemove = (id: number) => {
    postAction({ action: "remove", id }, () => {
      setItems((prev) => prev.filter((n) => n.id !== id));
    });
  };

  const handleMarkRead = (id: number) => {
    postAction({ action: "mark-read", id }, () => {
      setItems((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read_at: n.read_at || new Date().toISOString() }
            : n,
        ),
      );
    });
  };

  const localUnreadCount = loaded
    ? items.filter((n) => !n.read_at).length
    : unreadCount;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group h-8 w-8">
          <Bell className="size-5" />
          {localUnreadCount > 0 && (
            <span className="absolute animate-pulse group-hover:animate-none top-0 right-0 flex h-4 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
              {localUnreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="md:max-w-md p-0 gap-0">
        {/* ─── Header ─────────────────────────────────────────────── */}
        {(items.length > 0 || loading) && (
          <SheetHeader className="border-b p-5">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg relative">
                Notifications
                {localUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-4.5 flex h-4 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
                    {localUnreadCount}
                  </span>
                )}
              </SheetTitle>
            </div>
            <div className="flex items-center gap-4 pt-2">
              {localUnreadCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-auto p-0 text-sm text-primary hover:no-underline"
                >
                  Mark all as read
                </Button>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={handleClear}
                className="h-auto p-0 text-sm text-destructive/85 hover:text-destructive hover:no-underline transition-colors"
                disabled={items.length === 0}
              >
                Clear
              </Button>
              <Link
                href="/admin/notifications"
                className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>
          </SheetHeader>
        )}

        {/* ─── Body ───────────────────────────────────────────────── */}
        <div className="h-full overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="animate-spin size-7 text-muted-foreground" />
            </div>
          ) : items.length > 0 ? (
            <div className="divide-y">
              {items.map((notification) => {
                const Icon = getIconForType(notification.type);
                const isRead = !!notification.read_at;
                const colorClass = getColorForType(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`group relative border-l-2 ${
                      isRead ? "border-transparent" : "border-l-primary"
                    } flex gap-3.5 p-4 transition-colors hover:bg-accent/50`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 space-y-1 cursor-pointer"
                      onClick={() => !isRead && handleMarkRead(notification.id)}
                    >
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm leading-tight ${isRead ? "font-medium text-muted-foreground" : "font-semibold"}`}
                        >
                          {notification.title}
                        </p>
                        <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {notification.created_at}
                      </p>
                      {notification.description && (
                        <p className="text-sm text-muted-foreground leading-snug">
                          {notification.description}
                        </p>
                      )}
                      {notification.slug && (
                        <Link
                          href={notification.slug}
                          className="inline-flex text-sm text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </Link>
                      )}
                    </div>

                    {/* Remove button */}
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(notification.id)}
                        className="h-6 w-6 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center p-8 text-center">
              <div className="relative mb-5 mt-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <BellOff className="size-7 text-muted-foreground" />
                </div>
              </div>
              <h3 className="mb-2 text-base font-semibold">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! Check back later.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
