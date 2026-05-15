import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/Images/Logo.png";
import {
  Settings,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  LogOut,
  Bell,
  X,
  CheckCheck,
} from "lucide-react";
import api from "../../lib/axios";
import {
  notificationService,
  type NotificationItem,
} from "../../services/notificationService";

interface Props {
  onNavigate?: (page: string) => void;
}

const TYPE_ICON: Record<string, string> = {
  INFO: "ℹ️",
  WARNING: "⚠️",
  MAINTENANCE: "🔧",
};

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

const HeaderUser: React.FC<Props> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      console.error("Lỗi tải thông báo");
    }
  };

  // Poll mỗi 60 giây
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotif = async () => {
    setShowNotif((prev) => !prev);
    if (!showNotif) await fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  const handleNavigate = async (page: string) => {
    if (page === "logout") {
      try {
        await api.post("/auth/logout");
        // eslint-disable-next-line no-empty
      } catch {
      } finally {
        localStorage.removeItem("token");
        navigate("/login");
      }
      return;
    }
    switch (page) {
      case "tasks":
        navigate("/user/tasks");
        break;
      case "calendar":
        navigate("/user/calendar");
        break;
      case "settings":
        navigate("/user/settings");
        break;
      default:
        navigate("/user");
    }
    onNavigate?.(page);
  };

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/user",
    },
    { key: "tasks", label: "Task", icon: CheckSquare, path: "/user/tasks" },
    { key: "calendar", label: "Lịch", icon: Calendar, path: "/user/calendar" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/user" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Logo" className="w-25 h-auto object-contain" />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={key}
                onClick={() => handleNavigate(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* ── Chuông thông báo ── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleOpenNotif}
              className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
              title="Thông báo"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotif && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
                {/* Header dropdown */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm">
                    Thông báo
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-semibold">
                        {unreadCount} mới
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                        title="Đánh dấu tất cả đã đọc"
                      >
                        <CheckCheck size={13} />
                        Đọc tất cả
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotif(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                      <Bell size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Chưa có thông báo nào</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 ${
                          !n.is_read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 mt-0.5">
                            {TYPE_ICON[n.type ?? "INFO"] ?? "ℹ️"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold leading-snug ${!n.is_read ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {n.title}
                            </p>
                            {n.content && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {n.content}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo(n.created_at)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavigate("settings")}
            className={`p-2 rounded-lg transition cursor-pointer ${
              location.pathname === "/user/settings"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title="Cài đặt"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={() => handleNavigate("logout")}
            className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition ml-1"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderUser;
