import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Tags,
  Bell,
  ScrollText,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import logo from "../../assets/Images/Logo.png";

const menuItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    desc: "Tổng quan hệ thống",
    exact: true,
  },
  {
    path: "/admin/users",
    label: "Người dùng",
    icon: <Users size={18} />,
    desc: "Quản lý tài khoản",
  },
  {
    path: "/admin/notifications",
    label: "Thông báo",
    icon: <Bell size={18} />,
    desc: "Phát thanh hệ thống",
  },
  {
    path: "/admin/logs",
    label: "Nhật ký",
    icon: <ScrollText size={18} />,
    desc: "Audit log",
  },
];

function isActive(item: (typeof menuItems)[0], pathname: string) {
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}

export default function AdminLayout() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  const currentPage = menuItems.find((item) =>
    isActive(item, location.pathname),
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#080815] text-white overflow-hidden">
      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto
          w-72 h-full shrink-0
          flex flex-col
          bg-[#0d0d20] border-r border-white/6
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/6 shrink-0">
          <Link
            to="/admin"
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d0d20]" />
            </div>
            <div>
              <p className="text-base font-black tracking-wider leading-none">
                SOFT<span className="text-violet-400">WHERE</span>
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1">
                <Shield size={9} /> Admin Panel
              </p>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 text-gray-500 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
            Menu
          </p>
          {menuItems.map((item) => {
            const active = isActive(item, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${
                    active
                      ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/4 border border-transparent"
                  }
                `}
              >
                {/* Active glow */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-violet-400 rounded-r-full" />
                )}
                <span
                  className={`shrink-0 transition-colors ${active ? "text-violet-400" : "text-gray-600 group-hover:text-gray-300"}`}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${active ? "text-violet-300" : ""}`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[10px] text-gray-600 truncate">
                    {item.desc}
                  </p>
                </div>
                {active && (
                  <ChevronRight size={13} className="opacity-50 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin card */}
        <div className="p-3 border-t border-white/6 space-y-2 shrink-0">
          {/* Activity pulse */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/3 border border-white/5 rounded-xl">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-black">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d0d20]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.full_name ?? "Administrator"}
              </p>
              <p className="text-[10px] text-gray-600 truncate">
                {user?.email ?? ""}
              </p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/8 transition-colors border border-transparent hover:border-red-400/15 group"
          >
            <LogOut
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-white/6 flex items-center justify-between px-5 bg-[#0d0d20]/80 backdrop-blur-md">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-lg transition"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 font-medium hidden sm:inline">
                Admin
              </span>
              {currentPage && (
                <>
                  <ChevronRight
                    size={13}
                    className="text-gray-700 hidden sm:inline"
                  />
                  <span className="text-white font-semibold">
                    {currentPage.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: time + status + avatar */}
          <div className="flex items-center gap-3">
            {/* Live clock */}

            {/* System status pill */}

            {/* Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-200">
                  {user?.full_name ?? "Administrator"}
                </p>
                <p className="text-[10px] text-gray-600">Quản trị viên</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-black text-xs shadow-lg shadow-violet-500/20">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#080815]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
