import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Bell,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Priority = "Cao" | "Trung bình" | "Thấp";
type Status = "To-do" | "Done";

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string; // ISO datetime string  "YYYY-MM-DDTHH:mm"
  status: Status;
  priority: Priority;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const priorityColor: Record<Priority, string> = {
  Cao: "bg-red-100 text-red-600 border border-red-200",
  "Trung bình": "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Thấp: "bg-green-100 text-green-700 border border-green-200",
};

function isNearDeadline(deadline: string): boolean {
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 24 * 60 * 60 * 1000; // < 1 ngày
}

function isPastDeadline(deadline: string): boolean {
  return new Date(deadline).getTime() < Date.now();
}

function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED: Task[] = [
  {
    id: 1,
    title: "Nộp báo cáo Đồ án KTPM",
    description: "Hoàn thiện chương 3 và chương 4 kèm sơ đồ UML.",
    deadline: "2024-05-20T23:59",
    status: "To-do",
    priority: "Cao",
  },
  {
    id: 2,
    title: "Học nhóm môn Hệ điều hành",
    description: "Ôn tập phần định thời CPU tại thư viện.",
    deadline: "2024-05-22T14:00",
    status: "To-do",
    priority: "Trung bình",
  },
  {
    id: 3,
    title: "Mua giáo trình tiếng Anh",
    description: "Mua tại nhà sách ABC.",
    deadline: "2024-05-15T00:00",
    status: "Done",
    priority: "Thấp",
  },
];

// ── Modal: Add / Edit Task ────────────────────────────────────────────────────
interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  onSave: (task: Omit<Task, "id">) => void;
}

function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState<Omit<Task, "id">>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    deadline: task?.deadline ?? "",
    status: task?.status ?? "To-do",
    priority: task?.priority ?? "Trung bình",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return alert("Vui lòng nhập tiêu đề công việc!");
    if (!form.deadline) return alert("Vui lòng chọn deadline!");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-5">
          {task ? "✏️ Cập nhật công việc" : "➕ Thêm công việc mới"}
        </h3>

        <div className="space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề công việc..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả nội dung công việc..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mức độ ưu tiên */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Mức ưu tiên
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option>Cao</option>
                <option>Trung bình</option>
                <option>Thấp</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option>To-do</option>
                <option>Done</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            <Save size={15} className="mr-1.5" />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const past = isPastDeadline(task.deadline) && task.status !== "Done";
  const near = isNearDeadline(task.deadline) && task.status !== "Done";
  const done = task.status === "Done";

  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${
        done
          ? "bg-gray-50 border-gray-100 opacity-70"
          : past
            ? "bg-red-50 border-red-200"
            : near
              ? "bg-orange-50 border-orange-200"
              : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      {/* Toggle checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 shrink-0 text-gray-300 hover:text-blue-500 transition"
      >
        {done ? (
          <CheckCircle2 size={22} className="text-green-500" />
        ) : (
          <Circle size={22} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p
            className={`font-semibold text-gray-800 leading-snug ${
              done ? "line-through text-gray-400" : ""
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColor[task.priority]}`}
            >
              {task.priority}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                done
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {done ? "Hoàn thành" : "To-do"}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          {/* Deadline badge — REMIND_QD1 */}
          {near && <Bell size={13} className="text-orange-500" />}
          {past && <AlertTriangle size={13} className="text-red-500" />}
          <span
            className={`text-xs font-medium ${
              past ? "text-red-500" : near ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {past ? "⚠ Quá hạn: " : near ? "⏰ Sắp hết hạn: " : "📅 Deadline: "}
            {formatDeadline(task.deadline)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 hover:bg-blue-100 text-gray-400 hover:text-blue-600 rounded-lg transition"
          title="Cập nhật (TASK_QD2)"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition"
          title="Xóa (TASK_QD3)"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [searchTerm, setSearchTerm] = useState(""); // SEARCH_QD1
  const [filterStatus, setFilterStatus] = useState("Tất cả"); // FILTER_QD1
  const [filterPriority, setFilterPriority] = useState("Tất cả");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [nextId, setNextId] = useState(100);

  // REMIND_QD1 — nhắc nhở task sắp hết hạn (1 ngày trước)
  const reminders = tasks.filter(
    (t) => t.status !== "Done" && isNearDeadline(t.deadline),
  );

  // TASK_QD1 — Tạo công việc
  const handleCreate = (data: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...data, id: nextId }]);
    setNextId((n) => n + 1);
    setModalOpen(false);
  };

  // TASK_QD2 — Cập nhật công việc
  const handleUpdate = (data: Omit<Task, "id">) => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? { ...data, id: t.id } : t)),
    );
    setEditingTask(null);
  };

  // TASK_QD3 — Xóa công việc
  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa công việc này?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // TASK_QD4 — Đánh dấu hoàn thành
  const handleToggle = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Done" ? "To-do" : "Done" }
          : t,
      ),
    );
  };

  // SEARCH_QD1 + FILTER_QD1 — Tìm kiếm & Lọc
  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "Tất cả" ||
      (filterStatus === "Hoàn thành" && t.status === "Done") ||
      (filterStatus === "Chưa hoàn thành" && t.status === "To-do");
    const matchPriority =
      filterPriority === "Tất cả" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const doneCount = tasks.filter((t) => t.status === "Done").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Danh sách công việc
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Mã SV: SV_BM1 &nbsp;·&nbsp;{doneCount}/{tasks.length} hoàn thành
          </p>
        </div>
        {/* TASK_QD1 */}
        <button
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Thêm công việc
        </button>
      </div>

      {/* REMIND_QD1 — Banner nhắc nhở */}
      {reminders.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
          <Bell size={18} className="text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-700">
              Nhắc nhở deadline (REMIND_QD1)
            </p>
            <ul className="mt-1 space-y-0.5">
              {reminders.map((t) => (
                <li key={t.id} className="text-xs text-orange-600">
                  • <strong>{t.title}</strong> — hết hạn lúc{" "}
                  {formatDeadline(t.deadline)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Toolbar: Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* SEARCH_QD1 */}
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên / mô tả... (SEARCH_QD1)"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER_QD1 — theo trạng thái */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Hoàn thành</option>
            <option>Chưa hoàn thành</option>
          </select>
        </div>

        {/* FILTER_QD1 — theo ưu tiên */}
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option>Tất cả mức ưu tiên</option>
          <option>Cao</option>
          <option>Trung bình</option>
          <option>Thấp</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">Không tìm thấy công việc nào.</p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditingTask(t);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
