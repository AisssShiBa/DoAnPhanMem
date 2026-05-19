import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  Eye,
  X,
  KeyRound,
  ShieldOff,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Clock,
  CircleDot,
  ListTodo,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";
import {
  adminService,
  type AdminUser,
  type UserTaskStats,
} from "../../services/adminService";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import { SkeletonRow } from "../../components/Admin/Skeleton";
import EmptyState from "../../components/Admin/EmptyState";
import ErrorState from "../../components/Admin/ErrorState";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type FilterStatus = "ALL" | "ACTIVE" | "BANNED" | "PENDING";

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: "danger" | "warning" | "primary";
  onConfirm: () => void;
}

const CONFIRM_INITIAL: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Xác nhận",
  variant: "danger",
  onConfirm: () => {},
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-600",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const getInitials = (name: string | null) =>
  (name ?? "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ─────────────────────────────────────────────────────────────
// Task Detail Drawer — dùng API thật
// ─────────────────────────────────────────────────────────────
function UserTaskDrawer({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [taskDetail, setTaskDetail] = useState<UserTaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setFetchError(false);

    adminService
      .getUserTaskStats(user.id)
      .then((data) => {
        if (!cancelled) setTaskDetail(data);
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const statusColor: Record<string, string> = {
    done: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    in_progress: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    todo: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  const statusLabel: Record<string, string> = {
    done: "Hoàn thành",
    in_progress: "Đang làm",
    todo: "Chưa làm",
  };

  const chartData = taskDetail
    ? [
        { name: "Done", value: taskDetail.done, color: "#10b981" },
        { name: "Doing", value: taskDetail.inProgress, color: "#6366f1" },
        { name: "Todo", value: taskDetail.todo, color: "#f59e0b" },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />

      <div
        className="w-full max-w-md bg-[#0f0f1e] border-l border-white/10 flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideInRight 0.25s ease" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f1e] border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-sm font-black text-white`}
            >
              {getInitials(user.full_name)}
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {user.full_name ?? "—"}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Vai trò", value: user.role?.name ?? "USER" },
              { label: "Trạng thái", value: user.status },
              { label: "Đăng nhập", value: user.provider ?? "LOCAL" },
              {
                label: "Ngày tạo",
                value: new Date(user.created_at).toLocaleDateString("vi-VN"),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/3 border border-white/5 rounded-xl px-3 py-2.5"
              >
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Task Stats */}
        <div className="px-6 py-5 border-b border-white/5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 size={14} /> Thống kê Tasks
          </h3>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle size={14} />
              Không thể tải dữ liệu tasks
            </div>
          ) : taskDetail ? (
            <>
              {/* Big stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  {
                    label: "Hoàn thành",
                    value: taskDetail.done,
                    icon: <CheckCircle2 size={14} />,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                  },
                  {
                    label: "Đang làm",
                    value: taskDetail.inProgress,
                    icon: <Clock size={14} />,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10 border-blue-500/20",
                  },
                  {
                    label: "Chưa làm",
                    value: taskDetail.todo,
                    icon: <CircleDot size={14} />,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10 border-amber-500/20",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`border rounded-xl px-3 py-3 text-center ${item.bg}`}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <p className={`text-xl font-black mt-1 ${item.color}`}>
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Completion rate */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Completion rate</span>
                  <span className="font-bold text-emerald-400">
                    {taskDetail.completionRate}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${taskDetail.completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                  {taskDetail.done}/{taskDetail.total} tasks hoàn thành
                </p>
              </div>

              {/* Bar chart */}
              {taskDetail.total > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Phân bổ theo trạng thái
                  </p>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 0, right: 0, left: -32, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="bg-[#12122a] border border-white/10 rounded-lg px-3 py-1.5 text-xs">
                              <span className="font-bold text-white">
                                {payload[0].value}
                              </span>
                            </div>
                          ) : null
                        }
                      />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      >
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Categories */}
              {taskDetail.categories.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-gray-500 mb-3">
                    Danh mục phổ biến
                  </p>
                  <div className="space-y-2">
                    {taskDetail.categories.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-gray-300 flex-1 truncate">
                          {cat.name}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Recent Tasks */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ListTodo size={14} /> Tasks gần đây
          </h3>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : fetchError ? null : taskDetail &&
            taskDetail.recentTasks.length > 0 ? (
            <ul className="space-y-2">
              {taskDetail.recentTasks.map((task, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white/3 border border-white/5 rounded-xl"
                >
                  <span className="text-sm">
                    {task.status === "done"
                      ? "✅"
                      : task.status === "in_progress"
                        ? "🔄"
                        : "📝"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      {task.title}
                    </p>
                    {task.due && (
                      <p className="text-xs text-gray-600 mt-0.5">{task.due}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-medium shrink-0 ${statusColor[task.status] ?? statusColor.todo}`}
                  >
                    {statusLabel[task.status] ?? task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">Không có tasks nào</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// User Detail Modal
// ─────────────────────────────────────────────────────────────
function UserDetailModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const rows: [string, string][] = [
    ["Email", user.email],
    ["Số điện thoại", user.phone ?? "—"],
    ["Vai trò", user.role?.name ?? "USER"],
    ["Đăng nhập qua", user.provider ?? "LOCAL"],
    ["Số tasks", String(user._count?.tasks ?? 0)],
    [
      "Ngày đăng ký",
      new Date(user.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#13132a] border border-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-24 bg-linear-to-r from-violet-600/20 to-cyan-600/20 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-white bg-black/20 rounded-lg p-1.5 transition"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div
              className={`w-20 h-20 rounded-2xl bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-2xl font-black text-white shadow-lg border-4 border-[#13132a]`}
            >
              {getInitials(user.full_name)}
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${user.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : user.status === "BANNED" ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-gray-500/15 text-gray-400 border-gray-500/20"}`}
            >
              {user.status}
            </span>
          </div>
          <h3 className="text-xl font-black text-white mb-0.5">
            {user.full_name ?? "—"}
          </h3>
          <p className="text-gray-500 text-sm mb-5">{user.email}</p>
          <div className="space-y-2.5">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-gray-500 text-sm">{label}</span>
                <span className="text-gray-100 text-sm font-semibold">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Ban Reason Modal
// ─────────────────────────────────────────────────────────────
function BanReasonModal({
  email,
  reason,
  onChange,
  onCancel,
  onConfirm,
}: {
  email: string;
  reason: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#13132a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10">
            <ShieldOff size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Lý do khoá tài khoản</h3>
            <p className="text-gray-500 text-xs mt-0.5">{email}</p>
          </div>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) onConfirm();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Nhập lý do khoá... (Ctrl+Enter để tiếp tục)"
          rows={3}
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition resize-none mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition"
          >
            Tiếp tục →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_INITIAL);
  const [banReason, setBanReason] = useState("");
  const [showBanInput, setShowBanInput] = useState(false);
  const [pendingBan, setPendingBan] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [taskDrawerUser, setTaskDrawerUser] = useState<AdminUser | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };
  const handleFilterChange = (value: FilterStatus) => {
    setFilterStatus(value);
    setPage(1);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await adminService.getUsers({
        search: debouncedSearch,
        status: filterStatus,
        page,
      });
      setUsers(res.users);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setError(true);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filterStatus, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const closeConfirm = () => {
    setConfirm(CONFIRM_INITIAL);
    setBanReason("");
    setShowBanInput(false);
    setPendingBan(null);
  };

  const initiateBan = (user: AdminUser) => {
    if (user.role?.name === "ADMIN") {
      toast.error("Không thể khoá tài khoản Admin");
      return;
    }
    setPendingBan(user);
    setShowBanInput(true);
  };

  const confirmBan = () => {
    if (!banReason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }
    setShowBanInput(false);
    setConfirm({
      open: true,
      title: "Xác nhận khoá tài khoản",
      description: `Khoá tài khoản ${pendingBan?.email}?\nLý do: ${banReason}`,
      confirmLabel: "Khoá tài khoản",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminService.updateUserStatus(
            pendingBan!.id,
            "BANNED",
            banReason,
          );
          toast.success(`Đã khoá ${pendingBan!.email}`);
          closeConfirm();
          void load();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err?.response?.data?.error ?? "Lỗi hệ thống");
          closeConfirm();
        }
      },
    });
  };

  const handleUnban = (user: AdminUser) => {
    setConfirm({
      open: true,
      title: "Mở khoá tài khoản",
      description: `Mở khoá tài khoản ${user.email}?`,
      confirmLabel: "Mở khoá",
      variant: "primary",
      onConfirm: async () => {
        try {
          await adminService.updateUserStatus(user.id, "ACTIVE");
          toast.success(`Đã mở khoá ${user.email}`);
          closeConfirm();
          void load();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err?.response?.data?.error ?? "Lỗi");
          closeConfirm();
        }
      },
    });
  };

  const handleResetPassword = (user: AdminUser) => {
    setConfirm({
      open: true,
      title: "Đặt lại mật khẩu",
      description: `Gửi email reset mật khẩu đến ${user.email}?`,
      confirmLabel: "Gửi email",
      variant: "warning",
      onConfirm: async () => {
        try {
          const res = await adminService.resetUserPassword(user.id);
          toast.success(res.message);
          closeConfirm();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err?.response?.data?.error ?? "Lỗi");
          closeConfirm();
        }
      },
    });
  };

  const handleDelete = (user: AdminUser) => {
    if (user.role?.name === "ADMIN") {
      toast.error("Không thể xoá Admin");
      return;
    }
    setConfirm({
      open: true,
      title: "Xoá tài khoản",
      description: `Xoá vĩnh viễn ${user.email}? Không thể hoàn tác.`,
      confirmLabel: "Xoá tài khoản",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminService.deleteUser(user.id);
          toast.success(`Đã xoá ${user.email}`);
          closeConfirm();
          void load();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err?.response?.data?.error ?? "Lỗi");
          closeConfirm();
        }
      },
    });
  };

  const handleExportUsers = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        users.map((u) => ({
          "Họ tên": u.full_name ?? "—",
          Email: u.email,
          SĐT: u.phone ?? "—",
          "Vai trò": u.role?.name ?? "USER",
          "Trạng thái": u.status,
          Tasks: u._count?.tasks ?? 0,
          "Đăng nhập qua": u.provider ?? "LOCAL",
          "Ngày tạo": new Date(u.created_at).toLocaleDateString("vi-VN"),
        })),
      ),
      "Users",
    );
    XLSX.writeFile(wb, `Users_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Xuất danh sách người dùng thành công");
  };

  return (
    <div className="p-6 md:p-8 text-white">
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        confirmVariant={confirm.variant}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
      {showBanInput && pendingBan && (
        <BanReasonModal
          email={pendingBan.email}
          reason={banReason}
          onChange={setBanReason}
          onCancel={closeConfirm}
          onConfirm={confirmBan}
        />
      )}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
        />
      )}
      {taskDrawerUser && (
        <UserTaskDrawer
          user={taskDrawerUser}
          onClose={() => setTaskDrawerUser(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Quản lý Người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading
              ? "Đang tải..."
              : `${total.toLocaleString("vi-VN")} tài khoản trong hệ thống`}
          </p>
        </div>
        <button
          onClick={handleExportUsers}
          disabled={isLoading || users.length === 0}
          className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-40"
        >
          <Download size={15} /> Xuất Excel
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { value: "ALL", label: "Tất cả" },
              { value: "ACTIVE", label: "Hoạt động" },
              { value: "BANNED", label: "Đã khóa" },
              { value: "PENDING", label: "Chờ xác nhận" },
            ] as { value: FilterStatus; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${filterStatus === opt.value ? "bg-violet-500/15 border-violet-500/40 text-violet-400" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/10"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 800 }}>
              <thead>
                <tr className="border-b border-white/8 text-gray-500 text-xs uppercase tracking-wider bg-white/2">
                  <th className="px-5 py-4 font-semibold">Người dùng</th>
                  <th className="px-5 py-4 font-semibold">Liên hệ</th>
                  <th className="px-5 py-4 font-semibold">Vai trò</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="px-5 py-4 font-semibold">Tasks</th>
                  <th className="px-5 py-4 font-semibold text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} cols={6} />
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Users}
                        title="Không có người dùng nào"
                        description="Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm"
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-xs font-black text-white shrink-0`}
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-100">
                              {user.full_name ?? "—"}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {new Date(user.created_at).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-300">{user.email}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {user.phone ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg ${user.role?.name === "ADMIN" ? "bg-violet-500/15 text-violet-400" : "bg-indigo-500/10 text-indigo-400"}`}
                        >
                          {user.role?.name ?? "USER"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : user.status === "BANNED" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-400" : user.status === "BANNED" ? "bg-red-400" : "bg-yellow-400"}`}
                          />
                          {user.status === "ACTIVE"
                            ? "Hoạt động"
                            : user.status === "BANNED"
                              ? "Đã khóa"
                              : "Chờ xác nhận"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setTaskDrawerUser(user)}
                          className="flex items-center gap-1.5 text-sm font-bold text-violet-400 hover:text-violet-300 transition group/task"
                          title="Xem chi tiết tasks"
                        >
                          <ListTodo
                            size={13}
                            className="opacity-60 group-hover/task:opacity-100"
                          />
                          {user._count?.tasks ?? 0}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailUser(user)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setTaskDrawerUser(user)}
                            title="Xem Tasks"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition"
                          >
                            <BarChart3 size={15} />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            disabled={user.provider !== "LOCAL"}
                            title={
                              user.provider !== "LOCAL"
                                ? "Tài khoản Google/Microsoft"
                                : "Reset mật khẩu"
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition"
                          >
                            <KeyRound size={15} />
                          </button>
                          {user.role?.name !== "ADMIN" && (
                            <>
                              <button
                                onClick={() =>
                                  user.status === "BANNED"
                                    ? handleUnban(user)
                                    : initiateBan(user)
                                }
                                title={
                                  user.status === "BANNED"
                                    ? "Mở khoá"
                                    : "Khoá tài khoản"
                                }
                                className={`p-1.5 rounded-lg transition ${user.status === "BANNED" ? "text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10" : "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10"}`}
                              >
                                {user.status === "BANNED" ? (
                                  <ShieldCheck size={15} />
                                ) : (
                                  <ShieldOff size={15} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                title="Xoá"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-5 py-4 border-t border-white/8 bg-black/10 flex justify-between items-center text-xs text-gray-500">
              <span>
                Trang {page}/{totalPages} · {total.toLocaleString("vi-VN")} bản
                ghi
              </span>
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1.5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
                >
                  «
                </button>
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-1.5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 border rounded-lg transition ${p === page ? "border-violet-500/50 bg-violet-500/10 text-violet-400" : "border-white/10 hover:bg-white/10"}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="p-1.5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="px-2 py-1.5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
