import { useState } from "react";
import { Bell, BellOff, ShoppingBag, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Link } from "react-router";

interface Notification {
  id: number;
  title: string;
  slug: string;
  description: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
}

export function Notifications() {
  const notifications: Notification[] = [
    {
      id: 1,
      title: "New order",
      slug: "/orders/1",
      description: "Mrs. Eldridge Koch ordered 2 products.",
      time: "26 minutes ago",
      read: false,
      icon: ShoppingBag,
    },
    {
      id: 2,
      title: "New order",
      slug: "/orders/2",
      description: "Dr. Angelo Rempel ordered 3 products.",
      time: "26 minutes ago",
      read: false,
      icon: ShoppingBag,
    },
    {
      id: 3,
      title: "New order",
      slug: "/orders/3",
      description: "Marlon VonRueden ordered 3 products.",
      time: "26 minutes ago",
      read: false,
      icon: ShoppingBag,
    },
    {
      id: 4,
      title: "New order",
      slug: "/orders/4",
      description: "Daniela Schulist Sr. ordered 3 products.",
      time: "26 minutes ago",
      read: true,
      icon: ShoppingBag,
    },
    {
      id: 5,
      title: "New order",
      slug: "/orders/5",
      description: "Madisyn Considine ordered 4 products.",
      time: "26 minutes ago",
      read: true,
      icon: ShoppingBag,
    },
    {
      id: 6,
      title: "New order",
      slug: "/orders/6",
      description: "Arvid Lynch ordered 2 products.",
      time: "26 minutes ago",
      read: true,
      icon: ShoppingBag,
    },
  ];

  const [open, setOpen] = useState(false);
  const [notificationList, setNotificationList] =
    useState<Notification[]>(notifications);
  const unreadCount = notificationList.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotificationList(notificationList.map((n) => ({ ...n, read: true })));
  };

  const handleClear = () => {
    setNotificationList([]);
  };

  const handleRemove = (id: number) => {
    setNotificationList(notificationList.filter((n) => n.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group h-8 w-8">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute animate-pulse group-hover:animate-none top-0 right-0 flex h-4 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="md:max-w-md p-0 gap-0">
        {notificationList.length > 0 && (
          <SheetHeader className="border-b p-5">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg relative">
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-4.5 flex h-4 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </SheetTitle>
            </div>
            <div className="flex items-center gap-4 pt-2">
              {unreadCount > 0 && (
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
                disabled={notificationList.length === 0}
              >
                Clear
              </Button>
            </div>
          </SheetHeader>
        )}
        <div className="h-full overflow-y-auto">
          {notificationList.length > 0 ? (
            <div className="divide-y">
              {notificationList.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`group relative border-l-2 ${
                      notification.read
                        ? "border-transparent"
                        : "border-l-primary"
                    } flex gap-3.5 p-4 transition-colors hover:bg-accent/50`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {notification.time}
                      </p>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {notification.description}
                      </p>
                      {notification.slug && (
                        <Link
                          to={notification.slug}
                          className="h-auto p-0 text-sm text-primary hover:no-underline cursor-pointer"
                        >
                          View
                        </Link>
                      )}
                    </div>
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
                Please check again later.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
