// ─── React hooks ───
import { useEffect, useState } from "react";

// ─── Icons từ lucide-react ───
import {
  CheckCircle, // icon tick xanh → "Đã hoàn thành"
  Clock, // icon đồng hồ → "Đang chờ"
  ListTodo, // icon danh sách → "Tổng công việc"
  TrendingUp, // icon mũi tên lên → header "Tiến độ theo danh mục"
  Target, // icon mục tiêu → header "Tiến độ tổng thể"
  AlertTriangle, // icon cảnh báo → hiển thị số task quá hạn
} from "lucide-react";

// ─── LucideIcon là type đại diện cho mọi icon trong lucide-react ───
// Dùng để type cho prop icon trong StatCard thay vì dùng "any"
import type { LucideIcon } from "lucide-react";

// ─── Component Pomodoro (đã có sẵn, không sửa) ───
import PomodoroTimer from "../../components/PomodoroTimer";

// ─── Import types và service ───
// Dùng "import type" vì verbatimModuleSyntax = true trong tsconfig
// → TypeScript bắt buộc phải phân biệt import value vs import type
import {
  dashboardService, // value: object chứa hàm getDashboard
  type DashboardData, // type: shape của toàn bộ response
  type CategoryStat, // type: dùng để annotate trong .map()
  type UpcomingTask, // type: dùng để annotate trong .map()
} from "../../services/dashboardService";

/* ==============================================
   COMPONENT: StatCard
   Hiển thị 1 ô thống kê (icon + label + số)
   Dùng 3 lần: Tổng / Hoàn thành / Đang chờ
============================================== */
function StatCard({
  icon: Icon, // Đổi tên prop "icon" → "Icon" để dùng như JSX component
  title,
  value,
  color,
}: {
  icon: LucideIcon; // Kiểu chính xác thay cho "any"
  title: string;
  value: string; // Luôn là string để hiện "--" khi loading
  color: string; // Tailwind class, ví dụ "bg-blue-100 text-blue-600"
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-600 flex items-center gap-4 transition">
      {/* Vùng icon với màu nền dynamic */}
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-800">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* ==============================================
   HELPER: priorityLabel
   Nhận priority (number | null) → trả label + CSS class
============================================== */
const priorityLabel = (p: number | null): { label: string; cls: string } => {
  if (p === 1) return { label: "Cao", cls: "bg-red-100 text-red-600" };
  if (p === 2) return { label: "TB", cls: "bg-yellow-100 text-yellow-600" };
  return { label: "Thấp", cls: "bg-gray-200 text-gray-500" };
  // null, 3, hoặc bất kỳ số nào khác → "Thấp"
};

/* ==============================================
   HELPER: formatDate
   Chuyển ISO string → "dd/MM" để hiển thị gọn
   Ví dụ: "2025-05-10T00:00:00.000Z" → "10/05"
============================================== */
const formatDate = (d: string | null): string => {
  if (!d) return "--"; // Không có due_date → hiện "--"
  const date = new Date(d);
  const day = date.getDate().toString().padStart(2, "0"); // "5" → "05"
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() trả 0-11
  return `${day}/${month}`;
};

/* ==============================================
   COMPONENT CHÍNH: Dashboard
============================================== */
export default function Dashboard() {
  // data: null khi chưa fetch xong, DashboardData khi đã có
  const [data, setData] = useState<DashboardData | null>(null);

  // loading: true trong khi đang gọi API, false khi xong (dù thành công hay lỗi)
  const [loading, setLoading] = useState(true);

  /* ── Fetch data khi component mount lần đầu ── */
  useEffect(() => {
    dashboardService
      .getDashboard() // Gọi GET /api/dashboard
      .then(setData) // Nếu thành công: lưu vào state
      .catch(console.error) // Nếu lỗi: in ra console (không crash UI)
      .finally(() => setLoading(false)); // Dù thành công hay lỗi: tắt loading
  }, []); // [] → chỉ chạy 1 lần khi mount, không re-fetch khi re-render

  /* ── Destructure để dùng cho gọn ── */
  const summary = data?.summary; // undefined nếu data = null
  const upcoming = data?.upcomingTasks ?? []; // fallback [] để .map() không crash
  const categories = data?.categoryStats ?? []; // fallback []

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ════════════════════════════════
          PHẦN 1: 3 ô thống kê nhanh
      ════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={ListTodo}
          title="Tổng công việc"
          // Khi loading hiện "--", khi có data hiện số thực
          value={loading ? "--" : String(summary?.totalTasks ?? 0)}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          icon={CheckCircle}
          title="Đã hoàn thành"
          value={loading ? "--" : String(summary?.doneTasks ?? 0)}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          icon={Clock}
          title="Đang chờ"
          value={loading ? "--" : String(summary?.pendingTasks ?? 0)}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* ════════════════════════════════
          PHẦN 2: Progress bar tổng thể
      ════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-800 p-5 mb-6">
        {/* Header: icon + tiêu đề + % bên phải */}
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-700">Tiến độ tổng thể</h3>
          <span className="ml-auto text-sm font-bold text-blue-600">
            {loading ? "--%" : `${summary?.completionRate ?? 0}%`}
          </span>
        </div>

        {/* Progress bar: width động theo completionRate (0-100) */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${summary?.completionRate ?? 0}%` }}
            // transition-all duration-500 → bar chạy mượt khi data load xong
          />
        </div>

        {/* Footer: "X / Y công việc" + badge quá hạn nếu có */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {summary?.doneTasks ?? 0} / {summary?.totalTasks ?? 0} công việc
            hoàn thành
          </span>

          {/* Chỉ hiện badge đỏ khi overdueCount > 0 */}
          {(summary?.overdueCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertTriangle size={12} />
              {summary?.overdueCount} quá hạn
            </span>
          )}
        </div>
      </div>

      {/* ════════════════════════════════
          PHẦN 3: Grid 2 cột (Chart + Pomodoro)
      ════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cột trái (chiếm 2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Block: Tiến độ theo danh mục ── */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-700">
                Tiến độ theo danh mục
              </h3>
            </div>

            {/* 3 trạng thái: loading / rỗng / có data */}
            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Đang tải...
              </div>
            ) : categories.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Chưa có danh mục
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat: CategoryStat) => {
                  // Tính % hoàn thành của từng category
                  const rate =
                    cat.total > 0
                      ? Math.round((cat.done / cat.total) * 100)
                      : 0; // Tránh chia 0

                  return (
                    <div key={cat.id}>
                      {/* Tên category + số done/total + % */}
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          {/* Chấm tròn màu của category */}
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{
                              backgroundColor: cat.color_code ?? "#94a3b8",
                            }}
                            // Fallback màu xám nếu chưa set color_code
                          />
                          <span className="text-gray-700 font-medium">
                            {cat.name}
                          </span>
                        </span>
                        <span className="text-gray-500 text-xs">
                          {cat.done}/{cat.total} · {rate}%
                        </span>
                      </div>

                      {/* Progress bar màu theo category */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${rate}%`,
                            backgroundColor: cat.color_code ?? "#3b82f6",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Block: Task sắp đến hạn 24h ── */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-800">
            <h3 className="font-semibold text-gray-700 mb-3">
              Sắp đến hạn (24h)
            </h3>

            <div className="space-y-2">
              {/* Skeleton loading: 3 thanh xám nhấp nháy */}
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse"
                  >
                    <div className="w-12 h-4 bg-gray-200 rounded-full" />
                    <div className="flex-1 h-4 bg-gray-200 rounded" />
                    <div className="w-8 h-4 bg-gray-200 rounded" />
                  </div>
                ))
              ) : upcoming.length === 0 ? (
                // Không có task nào sắp đến hạn → thông báo tích cực
                <p className="text-sm text-gray-400 text-center py-6">
                  Không có task nào sắp đến hạn 🎉
                </p>
              ) : (
                upcoming.map((task: UpcomingTask) => {
                  const { label, cls } = priorityLabel(task.priority);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      {/* Badge priority */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}
                      >
                        {label}
                      </span>

                      {/* Tên task — truncate nếu quá dài */}
                      <p className="flex-1 text-sm font-medium text-gray-700 truncate">
                        {task.title}
                      </p>

                      {/* Badge category (chỉ hiện nếu task có category) */}
                      {task.category && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            // Màu nền = màu category + "22" (opacity 13% dạng hex)
                            backgroundColor: task.category.color_code + "22",
                            color: task.category.color_code,
                          }}
                        >
                          {task.category.name}
                        </span>
                      )}

                      {/* Ngày đến hạn dạng "dd/MM" */}
                      <span className="text-xs text-gray-400">
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Cột phải (1/3): Pomodoro Timer ── */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-800 min-h-105">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}
