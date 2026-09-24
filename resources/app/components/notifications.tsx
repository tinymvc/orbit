import { useState, useCallback, useEffect, useRef } from "react";
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
  CheckCheck,
  Trash2,
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
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { router, usePage } from "@inertiajs/react";

import { toast } from "sonner";
import {
  appendNotifications,
  loadNotifications,
  openNotification,
  updateNotification,
  type Notification,
  type NotificationAction,
} from "@/lib/notifications";

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
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(shared?.unreadCount ?? 0);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const mutating = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    setUnreadCount(shared?.unreadCount ?? 0);
  }, [shared?.unreadCount]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);

  const loadPage = useCallback(async (cursor: number | null) => {
    if (request.current || mutating.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const page = await loadNotifications(cursor, controller.signal);
      if (controller.signal.aborted || !mounted.current) return;
      setItems((current) =>
        cursor === null ? page.items : appendNotifications(current, page.items),
      );
      setNextCursor(page.nextCursor);
      setUnreadCount(page.unreadCount);
    } catch (reason) {
      if (!controller.signal.aborted && mounted.current) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Couldn't load notifications. Please try again.",
        );
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (mounted.current) setLoading(false);
      }
    }
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      request.current?.abort();
      request.current = null;
      setLoading(false);
      setOpen(isOpen);
      if (isOpen) {
        setItems([]);
        setNextCursor(null);
        void loadPage(null);
      }
    },
    [loadPage],
  );

  useEffect(() => {
    if (
      !open ||
      !scrollRoot ||
      !sentinel ||
      nextCursor === null ||
      loading ||
      processing ||
      error ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void loadPage(nextCursor);
      },
      { root: scrollRoot, rootMargin: "0px 0px 160px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    open,
    scrollRoot,
    sentinel,
    nextCursor,
    loading,
    processing,
    error,
    loadPage,
  ]);

  const postAction = useCallback(
    async (action: NotificationAction, id?: number): Promise<boolean> => {
      if (mutating.current || request.current) return false;
      mutating.current = true;
      setProcessing(true);
      try {
        const result = await updateNotification(action, id);
        if (!mounted.current) return false;
        setUnreadCount(result.unreadCount);
        setItems((current) => {
          if (action === "clear") return [];
          if (action === "remove")
            return current.filter((notification) => notification.id !== id);
          return current.map((notification) =>
            action === "mark-all-read" || notification.id === id
              ? {
                  ...notification,
                  read_at: notification.read_at || result.readAt,
                }
              : notification,
          );
        });
        if (action === "clear") {
          setNextCursor(null);
          setError(null);
        }
        return true;
      } catch (reason) {
        if (mounted.current)
          toast.error(
            reason instanceof Error
              ? reason.message
              : "Couldn't update notifications.",
          );
        return false;
      } finally {
        mutating.current = false;
        if (mounted.current) setProcessing(false);
      }
    },
    [],
  );

  const handleView = (notification: Notification) => {
    if (loading || processing) return;
    void openNotification(
      notification,
      () => postAction("mark-read", notification.id),
      (url) => {
        if (!mounted.current) return;
        const destination = new URL(url, window.location.origin);
        if (!["http:", "https:"].includes(destination.protocol)) return;
        handleOpenChange(false);
        if (destination.origin === window.location.origin) {
          router.visit(
            destination.pathname + destination.search + destination.hash,
          );
        } else {
          window.location.assign(destination.href);
        }
      },
    );
  };

  const isBusy = loading || processing;
  const badgeCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          disabled={processing}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
              {badgeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="md:max-w-md p-0 gap-0">
        <SheetHeader className="shrink-0 border-b p-5">
          <SheetTitle className="flex items-center gap-2 pr-6 text-lg">
            Notifications
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
                {badgeCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Your latest notifications. Mark them as read or clear them here.
          </SheetDescription>
          {(unreadCount > 0 || items.length > 0) && (
            <div className="flex items-center gap-2 pt-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void postAction("mark-all-read")}
                  className="h-7 gap-1.5 px-2 text-xs"
                  disabled={isBusy}
                >
                  <CheckCheck className="size-3.5" />
                  Mark read
                </Button>
              )}
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void postAction("clear")}
                  className="h-7 gap-1.5 bg-muted/60 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isBusy}
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </SheetHeader>

        {/* ─── Body ───────────────────────────────────────────────── */}
        <div
          ref={setScrollRoot}
          className="min-h-0 flex-1 overflow-y-auto"
          aria-busy={loading}
        >
          {loading && items.length === 0 ? (
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
                    <div className="min-w-0 flex-1 space-y-1">
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
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          disabled={isBusy}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleView(notification);
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>

                    {/* Remove button */}
                    <div className="flex flex-col items-end gap-2">
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            void postAction("mark-read", notification.id)
                          }
                          className="h-6 w-6 rounded-lg text-muted-foreground transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          disabled={isBusy}
                          aria-label="Mark notification as read"
                        >
                          <CheckCheck className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          void postAction("remove", notification.id)
                        }
                        className="h-6 w-6 rounded-lg text-muted-foreground transition-opacity hover:text-destructive focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        disabled={isBusy}
                        aria-label="Remove notification"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !error && nextCursor === null ? (
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
          ) : null}
          {error ? (
            <div className="space-y-2 p-4 text-center" role="alert">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadPage(nextCursor)}
                disabled={isBusy}
              >
                Try again
              </Button>
            </div>
          ) : (
            (nextCursor !== null || (loading && items.length > 0)) && (
              <div ref={setSentinel} className="flex justify-center p-4">
                {loading ? (
                  <span
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    role="status"
                  >
                    <Loader2 className="size-4 animate-spin" /> Loading older
                    notifications…
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={processing}
                    onClick={() => void loadPage(nextCursor)}
                  >
                    Load older notifications
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
