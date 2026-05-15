/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutList,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  List,
  X,
  Tag,
} from "lucide-react";
import api from "../../lib/axios";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type ViewMode = "month" | "agenda";
type TaskStatus = "todo" | "in_progress" | "done";

interface CalendarTask {
  id: number | string;
  title: string;
  due_date: string | null;
  status: TaskStatus;
  priority?: "low" | "medium" | "high";
  category_id?: number | null;
  description?: string | null;
  // ✅ Đã thêm category để nhận mã màu từ API
  category?: {
    id: number;
    name: string;
    color_code: string | null;
  } | null;
}

interface EnrichedTask extends CalendarTask {
  isOverdue: boolean;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const _ref = new Date();
const TODAY_Y = _ref.getFullYear();
const TODAY_M = _ref.getMonth();
const TODAY_D = _ref.getDate();
const NOW = new Date();

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function toDateKey(dateStr: string): string {
  const part = dateStr.split("T")[0];
  const [y, m, d] = part.split("-").map(Number);
  return `${y}-${m}-${d}`;
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
async function fetchCalendarTasks(
  year: number,
  month: number,
): Promise<CalendarTask[]> {
  const from = new Date(year, month, 1).toISOString();
  const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const { data } = await api.get<{ tasks: CalendarTask[] }>(
    "/dashboard/calendar",
    { params: { from, to } },
  );
  return data.tasks;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function statusLabel(s: TaskStatus) {
  if (s === "done") return "Hoàn thành";
  if (s === "in_progress") return "Đang làm";
  return "Chưa làm";
}
function statusColor(s: TaskStatus) {
  if (s === "done") return "text-emerald-600 bg-emerald-50";
  if (s === "in_progress") return "text-blue-600 bg-blue-50";
  return "text-gray-500 bg-gray-100";
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
function TaskChip({
  task,
  isOverdue,
}: {
  task: CalendarTask;
  isOverdue: boolean;
}) {
  const done = task.status === "done";
  // ✅ Lấy màu từ category, nếu không có thì dùng màu xanh mặc định
  const dotColor = task.category?.color_code || "#3b82f6";

  return (
    <div
      className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate ${
        done
          ? "bg-emerald-50 text-emerald-600 line-through"
          : isOverdue
            ? "bg-red-50 text-red-500"
            : "bg-blue-50 text-blue-700"
      }`}
    >
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor }} // ✅ Áp dụng màu động
      />
      <span className="truncate">{task.title}</span>
    </div>
  );
}

// ── Inline panel — KHÔNG dùng fixed/overlay, hiện bên phải lịch ──
function DayDetailPanel({
  date,
  tasks,
  onClose,
}: {
  date: string;
  tasks: EnrichedTask[];
  onClose: () => void;
}) {
  const parts = date.split("-").map(Number);
  const [y, m, d] = [
    parts[0] ?? TODAY_Y,
    parts[1] ?? TODAY_M + 1,
    parts[2] ?? TODAY_D,
  ];
  const label = `${d} ${MONTH_NAMES[m - 1] ?? ""}, ${y}`;

  return (
    <div className="w-72 shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 flex flex-col animate-slide-in overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Chi tiết ngày
          </p>
          <h2 className="text-base font-black text-gray-900">{label}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400 cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-4 space-y-3 max-h-130">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <Calendar size={32} className="mb-2" />
            <p className="text-sm">Không có nhiệm vụ nào</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border p-3.5 ${
                task.isOverdue
                  ? "border-red-100 bg-red-50/60"
                  : task.status === "done"
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                    style={{
                      backgroundColor: task.category?.color_code || "#3b82f6",
                    }} // ✅ Chấm màu động
                  />
                  <p
                    className={`text-sm font-semibold truncate ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}
                  >
                    {task.title}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(task.status)}`}
                >
                  {statusLabel(task.status)}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gray-400 mt-1.5 ml-4 line-clamp-2">
                  {task.description}
                </p>
              )}
              {task.isOverdue && (
                <p className="text-[10px] text-red-400 font-semibold mt-1.5 ml-4">
                  ⚠ Quá hạn
                </p>
              )}
              {/* ✅ Hiển thị Tên Category và Màu */}
              {task.category && (
                <div className="flex items-center gap-1 mt-1.5 ml-4 text-[10px] text-gray-500 font-medium">
                  <Tag
                    size={10}
                    style={{ color: task.category.color_code || "#9ca3af" }}
                  />
                  <span>{task.category.name}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex gap-3">
        <span>{tasks.length} nhiệm vụ</span>
        <span>·</span>
        <span className="text-emerald-500">
          {tasks.filter((t) => t.status === "done").length} hoàn thành
        </span>
        <span>·</span>
        <span className="text-red-400">
          {tasks.filter((t) => t.isOverdue).length} quá hạn
        </span>
      </div>
    </div>
  );
}

function AgendaView({
  tasks,
  currentYear,
  currentMonth,
}: {
  tasks: EnrichedTask[];
  currentYear: number;
  currentMonth: number;
}) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const byDay = useMemo(() => {
    const map = new Map<number, EnrichedTask[]>();
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const d = new Date(t.due_date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(t);
      }
    });
    return map;
  }, [tasks, currentYear, currentMonth]);

  const activeDays = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1,
  ).filter((d) => byDay.has(d));

  if (activeDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <LayoutList size={40} className="mb-3" />
        <p className="text-sm">Không có nhiệm vụ trong tháng này</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {activeDays.map((day) => {
        const dayTasks = byDay.get(day) ?? [];
        const date = new Date(currentYear, currentMonth, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isTodayCell =
          day === TODAY_D &&
          currentMonth === TODAY_M &&
          currentYear === TODAY_Y;

        return (
          <div key={day} className="px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                  isTodayCell
                    ? "bg-blue-600 text-white"
                    : isWeekend
                      ? "bg-red-50 text-red-400"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {day}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  {WEEKDAYS[date.getDay()]}
                  {isTodayCell ? " · Hôm nay" : ""}
                </p>
                <p className="text-sm text-gray-400">
                  {dayTasks.length} nhiệm vụ
                </p>
              </div>
            </div>
            <div className="space-y-2 ml-12">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                    task.status === "done"
                      ? "bg-emerald-50 text-gray-400"
                      : task.isOverdue
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: task.category?.color_code || "#3b82f6",
                    }} // ✅ Áp dụng màu động
                  />
                  <span
                    className={`flex-1 font-medium truncate ${task.status === "done" ? "line-through" : ""}`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor(task.status)}`}
                  >
                    {statusLabel(task.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function CalendarView() {
  const [date, setDate] = useState({ year: TODAY_Y, month: TODAY_M });

  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // ─────────────────────────────────────────
  // LOAD DATA
  // ─────────────────────────────────────────
  const loadTasks = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCalendarTasks(year, month);
      setTasks(data);
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks(date.year, date.month);
  }, [date.year, date.month, loadTasks]);

  // ─────────────────────────────────────────
  // DERIVED DATA
  // ─────────────────────────────────────────
  const enrichedTasks = useMemo<EnrichedTask[]>(
    () =>
      tasks.map((t) => ({
        ...t,
        isOverdue:
          t.status !== "done" &&
          t.due_date != null &&
          new Date(t.due_date) < NOW,
      })),
    [tasks],
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const key = toDateKey(t.due_date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  const monthStats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== "done" && t.due_date != null && new Date(t.due_date) < NOW,
    ).length;
    return { total, done, overdue, pending: total - done - overdue };
  }, [tasks]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(date.year, date.month, 1).getDay();
    const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
    const daysInPrev = new Date(date.year, date.month, 0).getDate();
    const cells: { day: number; current: boolean }[] = [];

    const startOffset = (firstDay + 6) % 7;
    for (let i = startOffset - 1; i >= 0; i--)
      cells.push({ day: daysInPrev - i, current: false });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, current: true });

    const rem = 7 - (cells.length % 7);
    if (rem < 7)
      for (let d = 1; d <= rem; d++) cells.push({ day: d, current: false });

    return cells;
  }, [date.year, date.month]);

  // ─────────────────────────────────────────
  // NAVIGATION & HANDLERS
  // ─────────────────────────────────────────
  const prevMonth = useCallback(() => {
    setDate((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 },
    );
    setSelectedDate(null);
  }, []);

  const nextMonth = useCallback(() => {
    setDate((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 },
    );
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    setDate({ year: TODAY_Y, month: TODAY_M });
    setSelectedDate(null);
  }, []);

  const isToday = useCallback(
    (day: number) =>
      day === TODAY_D && date.month === TODAY_M && date.year === TODAY_Y,
    [date.month, date.year],
  );

  const tasksByDay = useCallback(
    (day: number) => taskMap.get(`${date.year}-${date.month + 1}-${day}`) ?? [],
    [taskMap, date.year, date.month],
  );

  const handleDayClick = useCallback(
    (day: number) => {
      const key = `${date.year}-${date.month + 1}-${day}`;
      setSelectedDate((prev) => (prev === key ? null : key));
    },
    [date.year, date.month],
  );

  const selectedDayTasks = useMemo<EnrichedTask[]>(() => {
    if (!selectedDate) return [];
    return enrichedTasks.filter(
      (t) => t.due_date != null && toDateKey(t.due_date) === selectedDate,
    );
  }, [selectedDate, enrichedTasks]);

  const panelOpen = !!selectedDate && viewMode === "month";

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-6">
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.22s cubic-bezier(.16,1,.3,1); }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>

      <div
        className={`mx-auto space-y-4 transition-all duration-300 ${panelOpen ? "max-w-6xl" : "max-w-4xl"}`}
      >
        {/* ── Header ── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
                <Calendar size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 leading-none">
                  {MONTH_NAMES[date.month]}, {date.year}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Lịch nhiệm vụ</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition text-gray-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2.5 rounded-full cursor-pointer hover:bg-gray-100 transition text-gray-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              >
                Hôm nay
              </button>
              <button
                onClick={() => loadTasks(date.year, date.month)}
                disabled={loading}
                className={`p-2 rounded-full cursor-pointer hover:bg-gray-100 transition text-gray-500 ${loading ? "animate-spin" : ""}`}
                title="Làm mới"
              >
                <RefreshCw size={18} />
              </button>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("month")}
                  className={`p-1.5 rounded-md cursor-pointer transition ${viewMode === "month" ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                  title="Tháng"
                >
                  <Calendar size={18} />
                </button>
                <button
                  onClick={() => setViewMode("agenda")}
                  className={`p-1.5 rounded-md cursor-pointer transition ${viewMode === "agenda" ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                  title="Danh sách"
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {(
              [
                {
                  icon: <List size={11} />,
                  label: "Tổng",
                  val: monthStats.total,
                  cls: "text-gray-600 bg-gray-100",
                },
                {
                  icon: <CheckCircle2 size={11} />,
                  label: "Hoàn thành",
                  val: monthStats.done,
                  cls: "text-emerald-600 bg-emerald-50",
                },
                {
                  icon: <Clock size={11} />,
                  label: "Chờ xử lý",
                  val: monthStats.pending,
                  cls: "text-blue-600 bg-blue-50",
                },
                {
                  icon: <AlertTriangle size={11} />,
                  label: "Quá hạn",
                  val: monthStats.overdue,
                  cls: "text-red-500 bg-red-50",
                },
              ] as const
            ).map(({ icon, label, val, cls }) => (
              <span
                key={label}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${cls}`}
              >
                {icon} {label}: {val}
              </span>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertTriangle size={16} />
            {error}
            <button
              onClick={() => loadTasks(date.year, date.month)}
              className="ml-auto text-xs cursor-pointer font-semibold underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* ── Month View + Inline Panel ── */}
        {viewMode === "month" && (
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden animate-fade-in">
              <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className={`py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${d === "CN" || d === "T7" ? "text-red-400" : "text-gray-400"}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-7">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 border-r border-b border-gray-50 bg-gray-50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7">
                  {calendarCells.map((cell, i) => {
                    const { day, current } = cell;
                    const dateKey = `${date.year}-${date.month + 1}-${day}`;
                    const dayTasks = current ? tasksByDay(day) : [];
                    const overflowCount =
                      dayTasks.length > 3 ? dayTasks.length - 2 : 0;
                    const visibleTasks =
                      overflowCount > 0 ? dayTasks.slice(0, 2) : dayTasks;
                    const isSelected = selectedDate === dateKey && current;
                    const todayCell = current && isToday(day);
                    const colIdx = i % 7;
                    const isWeekend = colIdx === 5 || colIdx === 6;

                    return (
                      <div
                        key={i}
                        onClick={() => current && handleDayClick(day)}
                        className={`min-h-28 border-r border-b border-gray-50 p-1.5 transition-colors ${
                          !current
                            ? "bg-gray-50/30 cursor-default"
                            : isSelected
                              ? "bg-blue-50 cursor-pointer"
                              : "hover:bg-slate-50 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              todayCell
                                ? "bg-blue-600 text-white"
                                : !current
                                  ? "text-gray-300"
                                  : isWeekend
                                    ? "text-red-400"
                                    : isSelected
                                      ? "text-blue-700"
                                      : "text-gray-700"
                            }`}
                          >
                            {day}
                          </span>
                        </div>
                        {current && (
                          <div className="space-y-0.5">
                            {visibleTasks.map((task) => (
                              <TaskChip
                                key={task.id}
                                task={task}
                                isOverdue={
                                  task.status !== "done" &&
                                  task.due_date != null &&
                                  new Date(task.due_date) < NOW
                                }
                              />
                            ))}
                            {overflowCount > 0 && (
                              <div className="text-[10px] text-blue-500 font-semibold px-1">
                                +{overflowCount} khác
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {panelOpen && (
              <DayDetailPanel
                date={selectedDate!}
                tasks={selectedDayTasks}
                onClose={() => setSelectedDate(null)}
              />
            )}
          </div>
        )}

        {/* ── Agenda View ── */}
        {viewMode === "agenda" && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden animate-fade-in">
            <AgendaView
              tasks={enrichedTasks}
              currentYear={date.year}
              currentMonth={date.month}
            />
          </div>
        )}
      </div>
    </div>
  );
}
