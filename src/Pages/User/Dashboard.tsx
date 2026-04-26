import { CheckCircle, Clock, ListTodo, TrendingUp, Target } from "lucide-react";
import PomodoroTimer from "../../components/PomodoroTimer";

/* =========================
   POMODORO UI
========================= */

/* =========================
   CARD THỐNG KÊ
========================= */
function StatCard({
  icon: Icon,
  title,
  value,
  color,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="
        bg-white
        p-5
        rounded-2xl
        shadow-sm
        border border-gray-600
        flex items-center gap-4
        transition

      "
    >
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
/* =========================
   MAIN PAGE
========================= */
export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen  ">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 ">
        <StatCard
          icon={ListTodo}
          title="Tổng công việc"
          value="--"
          color="bg-blue-100 text-blue-600 "
        />

        <StatCard
          icon={CheckCircle}
          title="Đã hoàn thành"
          value="--"
          color="bg-green-100 text-green-600"
        />

        <StatCard
          icon={Clock}
          title="Đang thực hiện"
          value="--"
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-800 p-5 mb-6 ">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-700">Tiến độ tổng thể</h3>
          <span className="ml-auto text-sm font-bold text-blue-600">--%</span>
        </div>

        <p className="text-xs text-gray-700 mt-1.5">
          0 / 0 công việc hoàn thành
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border  border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-700">Hiệu suất học tập</h3>
            </div>

            <div className="h-48 flex items-end gap-3 justify-around border-b  border-gray-800 pb-2">
              {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                <div
                  key={item}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <span className="text-[10px] text-gray-600">--%</span>

                  <div className="w-full bg-blue-100 rounded-t-lg h-10" />
                </div>
              ))}
            </div>

            <div className="flex justify-around mt-2 text-xs text-gray-400">
              <span>Th2</span>
              <span>Th3</span>
              <span>Th4</span>
              <span>Th5</span>
              <span>Th6</span>
              <span>Th7</span>
              <span>CN</span>
            </div>
          </div>

          {/* Recent tasks */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-800 ">
            <h3 className="font-semibold text-gray-700 mb-3 ">
              Công việc gần đây
            </h3>

            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-600">
                    --
                  </span>

                  <p className="flex-1 text-sm font-medium text-gray-500">
                    Tên công việc
                  </p>

                  <span className="text-xs text-gray-400">--/--</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-800 min-h-105">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}
