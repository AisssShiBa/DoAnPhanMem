import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Map task data lên lịch — trong thực tế sẽ nhận từ props / context
const TASK_MAP: Record<string, { label: string; color: string }[]> = {
  "2024-5-20": [{ label: "Deadline Đồ án", color: "bg-red-100 text-red-600" }],
  "2024-5-22": [
    { label: "Học nhóm HĐH", color: "bg-green-100 text-green-700" },
  ],
  "2024-5-15": [
    { label: "Mua giáo trình", color: "bg-blue-100 text-blue-600" },
  ],
};

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 = CN
}

export default function CalendarView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed, 4 = Tháng 5

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else setCurrentMonth((m) => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                {MONTH_NAMES[currentMonth]}, {currentYear}
              </h2>
            </div>
            <div className="flex gap-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center bg-gray-50 border-b border-gray-100">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const key = `${currentYear}-${currentMonth + 1}-${day}`;
              const tasks = day ? (TASK_MAP[key] ?? []) : [];

              return (
                <div
                  key={i}
                  className={`min-h-20 border-r border-b border-gray-50 p-2 transition cursor-pointer ${
                    day ? "hover:bg-blue-50" : "bg-gray-50/50 cursor-default"
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${
                          isToday(day)
                            ? "bg-blue-600 text-white shadow"
                            : "text-gray-700 hover:bg-blue-100"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {tasks.map((t, ti) => (
                          <div
                            key={ti}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate leading-tight ${t.color}`}
                            title={t.label}
                          >
                            {t.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            Hôm nay
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-200 inline-block" />
            Deadline
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-200 inline-block" />
            Lịch học nhóm
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-200 inline-block" />
            Công việc khác
          </div>
        </div>
      </div>
    </div>
  );
}
