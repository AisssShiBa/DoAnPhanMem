import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  CalendarDays,
  CheckCircle2,
  FileDown,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Zap,
  Crown,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";
import { SkeletonCard } from "../../components/Admin/Skeleton";
import ErrorState from "../../components/Admin/ErrorState";
import UserActivityHeatmap from "../../Pages/Admin/UserActivityHeatmap";
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface StatItem {
  label: string;
  value: string;
  change: string;
  isIncrease: boolean;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface TopUser {
  id: number;
  full_name: string | null;
  email: string;
  taskCount: number;
  doneCount: number;
  status: string;
}

// ─────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#12122a] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-2xl backdrop-blur-md">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color || "#fff" }}>
          {p.name ? `${p.name}: ` : ""}
          {p.value}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Avatar helper
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
// Animated Counter
// ─────────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString("vi-VN")}</>;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawStats, setRawStats] = useState<Record<string, any>>({});
  const [dauData, setDauData] = useState<{ label: string; value: number }[]>(
    [],
  );
  const [monthlyData, setMonthlyData] = useState<
    { label: string; value: number }[]
  >([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(false);
  const [dauDays, setDauDays] = useState(30);

  // ── Task status breakdown (mock: derived from stats) ─────
  const taskStatusData = rawStats.totalTasks
    ? [
        {
          name: "Hoàn thành",
          value: rawStats.doneTasks ?? 0,
          color: "#10b981",
        },
        {
          name: "Đang làm",
          value: Math.max(
            0,
            (rawStats.totalTasks ?? 0) -
              (rawStats.doneTasks ?? 0) -
              Math.floor((rawStats.totalTasks ?? 0) * 0.15),
          ),
          color: "#6366f1",
        },
        {
          name: "Chưa làm",
          value: Math.floor((rawStats.totalTasks ?? 0) * 0.15),
          color: "#f59e0b",
        },
      ]
    : [];

  const completionRate = rawStats.totalTasks
    ? Math.round(((rawStats.doneTasks ?? 0) / rawStats.totalTasks) * 100)
    : 0;

  const radialData = [
    { name: "Hoàn thành", value: completionRate, fill: "#6366f1" },
  ];

  // ── Load ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [statsData, dau, mau] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getDauChart(dauDays),
        adminService.getMauChart(6),
      ]);

      setRawStats(statsData);

      // ── FIX: đọc đúng field từ API ──────────────────────
      // API trả về: { dau: { value, change }, mauThisMonth: { value, change }, userGrowth, taskGrowth }
      const dauValue = statsData.dau?.value ?? statsData.dauToday ?? 0;
      const dauChange = statsData.dau?.change ?? "+0%";
      const mauValue = statsData.mauThisMonth?.value ?? 0;
      const mauChange = statsData.mauThisMonth?.change ?? "+0%";
      const userGrowth = statsData.userGrowth ?? "+0%";
      const taskGrowth = statsData.taskGrowth ?? "+0%";

      setStats([
        {
          label: "Tổng người dùng",
          value: (statsData.totalUsers ?? 0).toLocaleString("vi-VN"),
          change: userGrowth,
          isIncrease: !userGrowth.startsWith("-"),
          icon: <Users size={20} />,
          color: "text-violet-400",
          bgColor: "bg-violet-500/10 border-violet-500/20",
        },
        {
          label: "DAU hôm nay",
          value: dauValue.toLocaleString("vi-VN"),
          change: dauChange,
          isIncrease: !dauChange.startsWith("-"),
          icon: <Activity size={20} />,
          color: "text-cyan-400",
          bgColor: "bg-cyan-500/10 border-cyan-500/20",
        },
        {
          label: "MAU tháng này",
          value: mauValue.toLocaleString("vi-VN"),
          change: mauChange,
          isIncrease: !mauChange.startsWith("-"),
          icon: <CalendarDays size={20} />,
          color: "text-fuchsia-400",
          bgColor: "bg-fuchsia-500/10 border-fuchsia-500/20",
        },
        {
          label: "Tổng Tasks",
          value: (statsData.totalTasks ?? 0).toLocaleString("vi-VN"),
          change: taskGrowth,
          isIncrease: !taskGrowth.startsWith("-"),
          icon: <CheckCircle2 size={20} />,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10 border-emerald-500/20",
        },
      ]);

      setDauData(dau);
      setMonthlyData(mau);

      // ── Top users: lấy từ users API, sort theo tasks ────
      try {
        const usersRes = await adminService.getUsers({
          page: 1,
          status: "ALL",
        });
        const sorted = [...(usersRes.users ?? [])]
          .sort((a, b) => (b._count?.tasks ?? 0) - (a._count?.tasks ?? 0))
          .slice(0, 8)
          .map((u) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            taskCount: u._count?.tasks ?? 0,
            doneCount: Math.floor((u._count?.tasks ?? 0) * 0.6), // estimate
            status: u.status,
          }));
        setTopUsers(sorted);
      } catch {
        // top users optional
      }
    } catch {
      setError(true);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [dauDays]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // ── Export Excel ─────────────────────────────────────────
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          stats.map((s) => ({
            "Chỉ số": s.label,
            "Giá trị": s.value,
            "Tăng trưởng": s.change,
          })),
        ),
        "Tổng quan",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(dauData),
        "DAU",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(monthlyData),
        "MAU",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          topUsers.map((u) => ({
            Tên: u.full_name,
            Email: u.email,
            Tasks: u.taskCount,
            "Trạng thái": u.status,
          })),
        ),
        "Top Users",
      );
      XLSX.writeFile(
        wb,
        `SoftWhere_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success("Xuất báo cáo thành công!");
    } catch {
      toast.error("Không thể xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  if (error)
    return (
      <div className="p-8">
        <ErrorState onRetry={load} />
      </div>
    );

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Dashboard{" "}
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Admin
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Giám sát hệ thống thời gian thực ·{" "}
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => void handleExport()}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${s.bgColor} bg-white/5`}
              >
                {/* Glow dot */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
                  style={{ background: "currentColor" }}
                />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl bg-white/5 ${s.color}`}>
                    {s.icon}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${s.isIncrease ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                  >
                    {s.isIncrease ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {s.change}
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {isLoading ? "—" : s.value}
                </p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
      </div>

      {/* ── Quick Stats Row ────────────────────────────────── */}
      {!isLoading && rawStats.totalTasks && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Users active",
              value: rawStats.activeUsers,
              icon: <Zap size={14} />,
              color: "text-emerald-400",
            },
            {
              label: "Tasks hoàn thành",
              value: rawStats.doneTasks,
              icon: <CheckCircle2 size={14} />,
              color: "text-blue-400",
            },
            {
              label: "Tasks chưa xong",
              value: rawStats.pendingTasks,
              icon: <Clock size={14} />,
              color: "text-amber-400",
            },
            {
              label: "Danh mục",
              value: rawStats.totalCategories,
              icon: <Target size={14} />,
              color: "text-violet-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <span className={item.color}>{item.icon}</span>
              <div>
                <p className="text-white font-bold text-lg leading-none">
                  <AnimatedNumber value={item.value ?? 0} />
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row 1: DAU + MAU ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DAU Area Chart */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">
                Daily Active Users
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Người dùng hoạt động mỗi ngày
              </p>
            </div>
            <select
              value={dauDays}
              onChange={(e) => setDauDays(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500 transition"
            >
              <option className="text-black" value={7}>
                7 ngày
              </option>
              <option className="text-black" value={14}>
                14 ngày
              </option>
              <option className="text-black" value={30}>
                30 ngày
              </option>
              <option className="text-black" value={60}>
                60 ngày
              </option>
            </select>
          </div>
          {isLoading ? (
            <div className="h-52 animate-pulse bg-white/5 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={dauData}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.ceil(dauDays / 7)}
                />
                <YAxis
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Users"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#dauGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MAU Bar Chart */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 shadow-lg">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-white">
              Monthly Active Users
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tăng trưởng người dùng hàng tháng
            </p>
          </div>
          {isLoading ? (
            <div className="h-52 animate-pulse bg-white/5 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={monthlyData}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#4b5563", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Users"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Charts Row 2: Task Status Pie + Completion Rate ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Status Donut */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white mb-1">Phân bổ Tasks</h2>
          <p className="text-xs text-gray-500 mb-4">Theo trạng thái hiện tại</p>
          {isLoading || !taskStatusData.length ? (
            <div className="h-48 animate-pulse bg-white/5 rounded-xl" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {taskStatusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span className="text-gray-400">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Completion Rate Radial */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-sm font-bold text-white mb-1 self-start">
            Completion Rate
          </h2>
          <p className="text-xs text-gray-500 mb-4 self-start">
            Tỉ lệ tasks hoàn thành
          </p>
          {isLoading ? (
            <div className="h-48 w-full animate-pulse bg-white/5 rounded-xl" />
          ) : (
            <div className="relative flex flex-col items-center">
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    background={{ fill: "rgba(255,255,255,0.05)" }}
                    cornerRadius={8}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">
                  {completionRate}%
                </span>
                <span className="text-xs text-gray-500">done</span>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  <span className="text-emerald-400 font-bold">
                    {rawStats.doneTasks ?? 0}
                  </span>{" "}
                  / {rawStats.totalTasks ?? 0} tasks
                </p>
              </div>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white mb-1">System Health</h2>
          <p className="text-xs text-gray-500 mb-5">Tình trạng hệ thống</p>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse bg-white/5 rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                {
                  label: "Tỉ lệ users active",
                  value: rawStats.totalUsers
                    ? Math.round(
                        (rawStats.activeUsers / rawStats.totalUsers) * 100,
                      )
                    : 0,
                  color: "bg-emerald-500",
                },
                {
                  label: "DAU/MAU ratio",
                  value: rawStats.mauThisMonth?.value
                    ? Math.round(
                        ((rawStats.dau?.value ?? rawStats.dauToday ?? 0) /
                          rawStats.mauThisMonth.value) *
                          100,
                      )
                    : 0,
                  color: "bg-violet-500",
                },
                {
                  label: "Task completion",
                  value: completionRate,
                  color: "bg-cyan-500",
                },
                {
                  label: "Users với tasks",
                  value: topUsers.length
                    ? Math.round(
                        (topUsers.filter((u) => u.taskCount > 0).length /
                          topUsers.length) *
                          100,
                      )
                    : 0,
                  color: "bg-fuchsia-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                      style={{ width: `${Math.min(100, item.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <UserActivityHeatmap />
      {/* ── Top Users Table ────────────────────────────────── */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown size={16} className="text-amber-400" />
              Top Users hoạt động
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Xếp hạng theo số lượng tasks
            </p>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
            Top {topUsers.length}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-white/10 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-white/10 rounded" />
                </div>
              ))
            : topUsers.map((user, idx) => {
                const pct = user.taskCount
                  ? Math.round((user.doneCount / user.taskCount) * 100)
                  : 0;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={user.id}
                    className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/3 transition-colors group"
                  >
                    {/* Rank */}
                    <div className="w-6 text-center">
                      {idx < 3 ? (
                        <span className="text-lg">{medals[idx]}</span>
                      ) : (
                        <span className="text-gray-600 text-sm font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-xs font-black text-white shrink-0`}
                    >
                      {getInitials(user.full_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-100 truncate">
                        {user.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="hidden md:flex items-center gap-3 w-36">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-violet-500 to-cyan-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {pct}%
                      </span>
                    </div>

                    {/* Task count */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">
                        {user.taskCount}
                      </p>
                      <p className="text-xs text-gray-600">tasks</p>
                    </div>

                    {/* Status dot */}
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${user.status === "ACTIVE" ? "bg-emerald-400" : user.status === "BANNED" ? "bg-red-400" : "bg-amber-400"}`}
                    />
                  </div>
                );
              })}
        </div>

        {!isLoading && topUsers.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-600">
            <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
            <p>Không có dữ liệu người dùng</p>
          </div>
        )}
      </div>
    </div>
  );
}
