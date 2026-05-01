import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../assets/Images/Logo.png";
//Import các Icon từ lucide-react
import {
  LayoutDashboard,
  Users,
  Tags,
  Bell,
  ScrollText,
  LogOut,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  // Menu
  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    {
      path: "/admin/users",
      label: "Quản lý người dùng",
      icon: <Users size={20} />,
    },
    { path: "/admin/tags", label: "Thẻ mặc định", icon: <Tags size={20} /> },
    {
      path: "/admin/notifications",
      label: "Thông báo hệ thống",
      icon: <Bell size={20} />,
    },
    {
      path: "/admin/logs",
      label: "Nhật ký (Audit Log)",
      icon: <ScrollText size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f1a] text-white overflow-hidden">
      {/* SIDEBAR*/}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col bg-white/5">
        {/*Logo*/}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link
            to="/admin"
            className="flex items-center gap-3 text-xl font-black tracking-wider group"
          >
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="flex">
              SOFT<span className="text-indigo-400">WHERE</span>
            </span>
          </Link>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            // Kiểm tra xem menu nào đang được chọn
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Đăng xuất */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/20"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* KHU VỰC BÊN PHẢI (Header + Nội dung chính) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER TOP */}
        <header className="h-16 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md">
          <div className="text-gray-400 text-sm">
            Xin chào,{" "}
            <span className="text-white font-medium">Quản trị viên</span>
          </div>

          {/* Avatar Admin */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Adminstrator</p>
              <p className="text-xs text-emerald-400">Đang hoạt động</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg">
              A
            </div>
          </div>
        </header>

        {/* MAIN CONTENT (Nơi các trang con như Dashboard, User hiển thị) */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
