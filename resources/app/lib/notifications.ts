export interface Notification {
  id: number;
  title: string;
  description: string | null;
  slug: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPage {
  items: Notification[];
  nextCursor: number | null;
  unreadCount: number;
}

export type NotificationAction =
  | "mark-read"
  | "mark-all-read"
  | "remove"
  | "clear";

export interface NotificationActionResult {
  unreadCount: number;
  readAt: string | null;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...options.headers,
    },
  });
  if (
    response.redirected ||
    response.status === 401 ||
    response.status === 419
  ) {
    throw new Error(
      "Your session has expired. Refresh the page and sign in again.",
    );
  }
  if (!response.ok) {
    throw new Error("Couldn't update notifications. Please try again.");
  }
  return response.json() as Promise<T>;
}

export function loadNotifications(
  before: number | null,
  signal: AbortSignal,
): Promise<NotificationPage> {
  return request(
    `/admin/notifications/feed${before === null ? "" : `?before=${before}`}`,
    { signal },
  );
}

export function updateNotification(
  action: NotificationAction,
  id?: number,
): Promise<NotificationActionResult> {
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith("XSRF-TOKEN="));
  const token = cookie
    ? decodeURIComponent(cookie.slice("XSRF-TOKEN=".length))
    : "";
  return request("/admin/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify({ action, ...(id === undefined ? {} : { id }) }),
  });
}

export function appendNotifications(
  current: Notification[],
  incoming: Notification[],
): Notification[] {
  const ids = new Set(current.map((notification) => notification.id));
  return [
    ...current,
    ...incoming.filter((notification) => !ids.has(notification.id)),
  ];
}

/** Do not navigate until the read action has succeeded. */
export async function openNotification(
  notification: Notification,
  markRead: () => Promise<boolean>,
  navigate: (url: string) => void,
): Promise<void> {
  if (!notification.slug) return;
  if (!notification.read_at && !(await markRead())) return;
  navigate(notification.slug);
}
