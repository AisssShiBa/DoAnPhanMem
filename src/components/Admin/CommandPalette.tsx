import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Users,
  Tags,
  Bell,
  ScrollText,
  X,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

  const go = (path: string) => {
    navigate(path);
    onClose();
    setQuery("");
    setSelected(0);
  };

  const commands: Command[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Tổng quan hệ thống",
      icon: <LayoutDashboard size={16} />,
      action: () => go("/admin"),
    },
    {
      id: "users",
      label: "Quản lý người dùng",
      description: "Xem và quản lý tài khoản",
      icon: <Users size={16} />,
      action: () => go("/admin/users"),
    },
    {
      id: "tags",
      label: "Thẻ mặc định",
      description: "Cấu hình nhãn cho sinh viên mới",
      icon: <Tags size={16} />,
      action: () => go("/admin/tags"),
    },
    {
      id: "notifs",
      label: "Thông báo hệ thống",
      description: "Gửi broadcast đến toàn bộ user",
      icon: <Bell size={16} />,
      action: () => go("/admin/notifications"),
    },
    {
      id: "logs",
      label: "Nhật ký (Audit Log)",
      description: "Theo dõi hoạt động hệ thống",
      icon: <ScrollText size={16} />,
      action: () => go("/admin/logs"),
    },
  ];

  // useMemo thay vì useState + useEffect để tính filtered
  const filtered = useMemo(
    () =>
      query.trim()
        ? commands.filter(
            (c) =>
              c.label.toLowerCase().includes(query.toLowerCase()) ||
              c.description?.toLowerCase().includes(query.toLowerCase()),
          )
        : commands,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, open],
  );

  // Reset selected khi query thay đổi — dùng onChange thay vì useEffect
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(0); // reset ở đây, không cần useEffect
  };

  // Keyboard navigation — chỉ 1 useEffect duy nhất, không setState trực tiếp
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        filtered[selected]?.action();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, onClose]);

  // Reset state khi đóng — dùng onClose wrapper thay vì useEffect
  const handleClose = () => {
    setQuery("");
    setSelected(0);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg mx-4 bg-[#16162a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={16} className="text-gray-500 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={handleQueryChange}
            placeholder="Tìm kiếm trang, hành động..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-8">
              Không tìm thấy kết quả
            </p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selected === i
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                <span
                  className={`shrink-0 ${selected === i ? "text-indigo-400" : "text-gray-600"}`}
                >
                  {cmd.icon}
                </span>
                <div>
                  <p
                    className={`text-sm font-medium ${selected === i ? "text-white" : "text-gray-300"}`}
                  >
                    {cmd.label}
                  </p>
                  {cmd.description && (
                    <p className="text-xs text-gray-600">{cmd.description}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-gray-700">
          <span>↑↓ Di chuyển</span>
          <span>↵ Chọn</span>
          <span>Esc Đóng</span>
        </div>
      </div>
    </div>
  );
}
