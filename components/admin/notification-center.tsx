"use client";

/**
 * Euphoria — Notification Center
 * Live admin notification dropdown with auto-refresh polling.
 * Derives notifications from orders, low stock, and pending reviews.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShoppingCart, Package, Star, Info, Check, CheckCheck, X } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/notification.actions";
import { useRouter } from "next/navigation";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
  href: string;
}

function relativeTime(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
  });
}

function getTimeGroup(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  if (d >= todayStart) return "Today";
  if (d >= yesterdayStart) return "Yesterday";
  return "Older";
}

const typeConfig: Record<string, { icon: typeof ShoppingCart; color: string; bg: string }> = {
  NEW_ORDER: {
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  LOW_STOCK: {
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  NEW_REVIEW: {
    icon: Star,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  SYSTEM: {
    icon: Info,
    color: "text-gray-600",
    bg: "bg-gray-50",
  },
};

export function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load read state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("Euphoria-read-notifications");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await getNotifications(20);
      if (result.success && result.data) {
        // Map Prisma Notification to AdminNotification expected by the UI
        const mapped = result.data.notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
          isRead: n.isRead,
          href:
            n.data && typeof n.data === "object" && "href" in n.data
              ? String((n.data as { href: unknown }).href)
              : "/admin",
        })) as AdminNotification[];

        setNotifications(mapped);
        const unread = mapped.filter((n: AdminNotification) => !readIds.has(n.id)).length;
        setUnreadCount(unread);
      }
    } catch {
      // Silently fail on polling
    }
  }, [readIds]);

  // Initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = async () => {
    if (!isOpen) {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      localStorage.setItem("Euphoria-read-notifications", JSON.stringify(Array.from(newReadIds)));
    } catch {
      // Ignore storage errors
    }

    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    const newReadIds = new Set(readIds);
    notifications.forEach((n) => newReadIds.add(n.id));
    setReadIds(newReadIds);
    setUnreadCount(0);

    try {
      localStorage.setItem("Euphoria-read-notifications", JSON.stringify(Array.from(newReadIds)));
    } catch {
      // Ignore storage errors
    }

    await markAllNotificationsRead();
  };

  const handleNotificationClick = async (notification: AdminNotification) => {
    await handleMarkRead(notification.id);
    setIsOpen(false);
    router.push(notification.href);
  };

  // Group notifications by time
  const grouped = notifications.reduce<Record<string, AdminNotification[]>>((acc, notification) => {
    const group = getTimeGroup(String(notification.createdAt));
    if (!acc[group]) acc[group] = [];
    acc[group].push(notification);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "Older"];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-gray-500">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
                  <p className="mt-2 text-xs text-gray-400">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-12 px-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">All caught up!</p>
                  <p className="mt-0.5 text-xs text-gray-400">No new notifications</p>
                </div>
              ) : (
                groupOrder.map((group) => {
                  const items = grouped[group];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={group}>
                      <div className="sticky top-0 z-10 bg-gray-50/90 px-4 py-1.5 backdrop-blur-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          {group}
                        </p>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {items.map((notification) => {
                          const config = typeConfig[notification.type] || typeConfig.SYSTEM;
                          const Icon = config?.icon || ShoppingCart;
                          const isRead = readIds.has(notification.id);

                          return (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                                !isRead ? "bg-blue-50/30" : ""
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config?.bg || "bg-gray-50"} ${config?.color || "text-gray-600"}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-xs font-semibold ${
                                      isRead ? "text-gray-600" : "text-gray-900"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  {!isRead && (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-[10px] text-gray-400">
                                  {relativeTime(notification.createdAt)}
                                </p>
                              </div>
                              {!isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkRead(notification.id);
                                  }}
                                  className="mt-1 shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
