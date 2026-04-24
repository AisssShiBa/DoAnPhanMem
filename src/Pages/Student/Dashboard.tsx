import { CheckCircle, Clock, ListTodo, TrendingUp, Target } from "lucide-react";

// PomodoroTimer stub nếu chưa có component thật
function PomodoroTimer() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-28 h-28 rounded-full border-8 border-blue-500 flex items-center justify-center shadow-inner">
        <span className="text-2xl font-bold text-gray-800">25:00</span>
      </div>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
        Pomodoro
      </p>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          Bắt đầu
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
          Đặt lại
        </button>
      </div>
    </div>
  );
}

const DAYS = ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"];
const BAR_DATA = [40, 70, 45, 90, 65, 30, 80];

const RECENT_TASKS = [
  {
    title: "Nộp báo cáo Đồ án KTPM",
    priority: "Cao",
    status: "To-do",
    deadline: "20/05 - 23:59",
  },
  {
    title: "Học nhóm Hệ điều hành",
    priority: "Trung bình",
    status: "To-do",
    deadline: "22/05 - 14:00",
  },
  {
    title: "Mua giáo trình tiếng Anh",
    priority: "Thấp",
    status: "Done",
    deadline: "15/05",
  },
];

const priorityColor: Record<string, string> = {
  Cao: "bg-red-100 text-red-600",
  "Trung bình": "bg-yellow-100 text-yellow-700",
  Thấp: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const total = 24;
  const done = 18;
  const inProgress = 6;
  const progress = Math.round((done / total) * 100);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Title */}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: ListTodo,
            label: "Tổng công việc",
            value: total,
            color: "blue",
            extra: "",
          },
          {
            icon: CheckCircle,
            label: "Đã hoàn thành",
            value: done,
            color: "green",
            extra: `${progress}%`,
          },
          {
            icon: Clock,
            label: "Đang thực hiện",
            value: inProgress,
            color: "orange",
            extra: "",
          },
        ].map(({ icon: Icon, label, value, color, extra }) => (
          <div
            key={label}
            className={`bg-white p-5 rounded-2xl shadow-sm border border-${color}-100 flex items-center gap-4`}
          >
            <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-xl`}>
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{label}</p>
              <div className="flex items-end gap-2">
                <p
                  className={`text-2xl font-bold text-${color === "blue" ? "gray-800" : `${color}-600`}`}
                >
                  {value}
                </p>
                {extra && (
                  <span
                    className={`text-sm font-semibold text-${color}-500 mb-0.5`}
                  >
                    {extra}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar tổng thể */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-700">Tiến độ tổng thể</h3>
          <span className="ml-auto text-sm font-bold text-blue-600">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-linear-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {done} / {total} công việc hoàn thành
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ hiệu suất */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-700">
                Hiệu suất học tập (Tuần này)
              </h3>
            </div>
            <div className="h-48 flex items-end gap-3 justify-around border-b border-gray-100 pb-2">
              {BAR_DATA.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <span className="text-[10px] text-gray-400">{h}%</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-400 transition-all cursor-pointer"
                    style={{ height: `${h}%` }}
                    title={`${DAYS[i]}: ${h}%`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-around mt-2 text-xs text-gray-400">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {/* Công việc gần đây */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">
              Công việc gần đây
            </h3>
            <div className="space-y-2">
              {RECENT_TASKS.map((t) => (
                <div
                  key={t.title}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityColor[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                  <p
                    className={`flex-1 text-sm font-medium ${t.status === "Done" ? "line-through text-gray-400" : "text-gray-700"}`}
                  >
                    {t.title}
                  </p>
                  <span className="text-xs text-gray-400">{t.deadline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pomodoro */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 min-h-70">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}
