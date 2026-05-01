import { useMemo, useState } from "react";
import {
  Calendar,
  Save,
  X,
  Paperclip,
  ListChecks,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";

/* =====================================================
   TYPES
===================================================== */
type Priority = "Cao" | "Trung bình" | "Thấp";

interface Task {
  id: number;
  title: string;
  desc: string;
  priority: Priority;
  tag: string;
  deadline: string;
  done: boolean;
}

/* =====================================================
   UI HELPERS
===================================================== */
function priorityStyle(priority: Priority) {
  switch (priority) {
    case "Cao":
      return "bg-red-100 text-red-700";
    case "Trung bình":
      return "bg-yellow-100 text-yellow-700";
    case "Thấp":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* =====================================================
   MODAL
===================================================== */
interface TaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
}

function TaskModal({ onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("Cao");
  const [tag, setTag] = useState("");
  const [deadline, setDeadline] = useState("");

  function handleSubmit() {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề công việc");
      return;
    }

    onSave({
      id: Date.now(),
      title,
      desc,
      priority,
      tag,
      deadline,
      done: false,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Thêm công việc mới
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tạo task để quản lý tiến độ tốt hơn
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hoàn thành giao diện dashboard"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả chi tiết công việc..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:ring-2  focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Cao</option>
                <option>Trung bình</option>
                <option>Thấp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag
            </label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ví dụ: Frontend"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-white"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} />
            Lưu task
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   CARD
===================================================== */
interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
}

function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className="mt-1 text-blue-600 hover:scale-110 transition"
        >
          {task.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h3
                className={`text-lg font-semibold ${
                  task.done ? "line-through text-gray-400" : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>

              <p className="mt-1 text-sm text-gray-600">{task.desc}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${priorityStyle(
                  task.priority,
                )}`}
              >
                {task.priority}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                #{task.tag || "NoTag"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {task.deadline || "Chưa có deadline"}
            </div>

            <div className="flex items-center gap-1">
              <Paperclip size={14} />0 File
            </div>

            <div className="flex items-center gap-1">
              <ListChecks size={14} />
              Checklist trống
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */
export default function TaskList() {
  const [openModal, setOpenModal] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Hoàn thành đồ án phần mềm",
      desc: "Thiết kế giao diện trang quản lý task bằng React + Tailwind",
      priority: "Cao",
      tag: "DoAn",
      deadline: "2026-04-30",
      done: false,
    },
  ]);

  function addTask(task: Task) {
    setTasks((prev) => [task, ...prev]);
  }

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  const doneCount = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks],
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Danh sách công việc
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi công việc cá nhân mỗi ngày
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="px-5 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            Thêm task
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Tổng công việc</p>
            <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm text-green-700">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-green-900">{doneCount}</p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-sm text-orange-700">Chưa xong</p>
            <p className="text-2xl font-bold text-orange-900">
              {tasks.length - doneCount}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </div>

      {/* Modal */}
      {openModal && (
        <TaskModal onClose={() => setOpenModal(false)} onSave={addTask} />
      )}
    </div>
  );
}
