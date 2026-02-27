import { Link, router, usePage } from "@inertiajs/react";
import {
  Bell,
  BellOff,
  ShoppingBag,
  UserPlus,
  Settings,
  ShieldCheck,
  MessageSquare,
  Info,
  Trash2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface PaginatedNotifications {
  data: Notification[];
  pages: number;
  page: number;
  total: number;
  limit: number;
  first_item: number;
  last_item: number;
}

// ─── Icon & color mapping ───────────────────────────────────────────────────

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

const badgeVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  order: "default",
  user: "secondary",
  system: "outline",
  security: "destructive",
  comment: "secondary",
  payment: "default",
  shipping: "outline",
  email: "secondary",
  warning: "destructive",
  success: "default",
  like: "secondary",
  review: "outline",
  promotion: "secondary",
  upload: "outline",
  download: "outline",
  announcement: "destructive",
  event: "default",
  report: "outline",
  info: "secondary",
};

function getIcon(type: string): LucideIcon {
  return typeIcons[type] || Bell;
}

function getColor(type: string): string {
  return typeColors[type] || "bg-muted text-muted-foreground";
}

// ─── Actions helper ─────────────────────────────────────────────────────────

function postAction(data: Record<string, unknown>) {
  router.post("/admin/notifications", data as Record<string, string>, {
    preserveScroll: true,
  });
}

function goToPage(page: number) {
  router.get(
    "/admin/notifications",
    { page },
    { preserveState: true, preserveScroll: true },
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { notifications: paginated } = usePage<{
    notifications: PaginatedNotifications;
  }>().props;

  const notifications = paginated.data ?? [];
  const currentPage = paginated.page ?? 1;
  const totalPages = paginated.pages ?? 1;
  const total = paginated.total ?? 0;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="px-4 lg:px-6 w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your notifications and stay up to date.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => postAction({ action: "mark-all-read" })}
                >
                  <CheckCheck className="size-4" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => postAction({ action: "clear" })}
                >
                  <Trash2 className="size-4" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                const isRead = !!notification.read_at;
                const colorClass = getColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-accent/50 ${
                      !isRead ? "bg-accent/20" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm leading-tight ${isRead ? "font-medium text-muted-foreground" : "font-semibold"}`}
                        >
                          {notification.title}
                        </p>
                        <Badge
                          variant={
                            badgeVariants[notification.type] || "outline"
                          }
                          className="capitalize text-[10px] px-1.5 py-0"
                        >
                          {notification.type}
                        </Badge>
                        {!isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
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
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() =>
                            postAction({
                              action: "mark-read",
                              id: notification.id,
                            })
                          }
                        >
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6.5 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          postAction({
                            action: "remove",
                            id: notification.id,
                          })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">No notifications</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                You're all caught up! We'll notify you when something new
                happens.
              </p>
            </div>
          )}
        </CardContent>

        {/* ─── Pagination ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              {paginated.first_item}–{paginated.last_item} of {total}{" "}
              notifications
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hidden lg:flex"
                onClick={() => goToPage(1)}
                disabled={!canGoPrevious}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage - 1)}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hidden lg:flex"
                onClick={() => goToPage(totalPages)}
                disabled={!canGoNext}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
