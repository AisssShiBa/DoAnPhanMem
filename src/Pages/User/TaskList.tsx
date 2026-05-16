import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Circle,
  Calendar,
  ListChecks,
  AlertTriangle,
  Loader2,
  Search,
  Flag,
  FolderOpen,
  Clock,
  Target,
  Inbox,
  CheckCheck,
  ArrowUpDown,
  Bell,
  Tag,
  Paperclip,
  Download,
  GripVertical,
  FileText,
  Image,
  File,
  Shield,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../lib/axios";
import { Link } from "react-router-dom";
/* =====================================================
   TYPES
===================================================== */
interface Category {
  id: number;
  name: string;
  color_code?: string;
  display_order: number;
  taskCount?: number;
  doneCount?: number;
}

interface TagItem {
  id: number;
  name: string;
  color_code: string;
}

interface TaskTag {
  tag: { id: number; name: string; color_code: string };
}

interface SubTask {
  id: number;
  title: string;
  status: string;
}

interface Reminder {
  id: number;
  remind_time: string;
  status: string;
}

interface TaskAttachment {
  id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: number | null;
  status: string | null;
  due_date: string | null;
  start_date: string | null;
  category_id: number | null;
  category: Category | null;
  subtasks: SubTask[];
  task_tags: TaskTag[];
  attachments?: TaskAttachment[];
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

interface ApiError {
  response?: { data?: { error?: string } };
}

type SortField = "created_at" | "due_date" | "priority" | "title";
type FilterStatus = "all" | "todo" | "done" | "overdue";

/* =====================================================
   CONSTANTS
===================================================== */
const PRIORITY_MAP: Record<
  number,
  { label: string; cls: string; dot: string; icon: string }
> = {
  1: {
    label: "Thấp",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-400",
    icon: "↓",
  },
  2: {
    label: "Trung bình",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    icon: "→",
  },
  3: {
    label: "Cao",
    cls: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-400",
    icon: "↑",
  },
};

const CATEGORY_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#F97316",
  "#06B6D4",
  "#6366F1",
];

const REMINDER_PRESETS = [
  { label: "30 phút", minutes: 30 },
  { label: "1 giờ", minutes: 60 },
  { label: "3 giờ", minutes: 180 },
  { label: "1 ngày", minutes: 1440 },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* =====================================================
   CREATE NEW TAG FUNCTION
===================================================== */
async function createNewTag(name: string): Promise<TagItem | null> {
  try {
    const res = await api.post("/tags", { name });
    return res.data.tag;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/* =====================================================
   NEW TAG BUTTON COMPONENT
===================================================== */
function NewTagButton({ onCreated }: { onCreated: (tag: TagItem) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    const newTag = await createNewTag(name.trim());
    if (newTag) {
      onCreated(newTag);
      setName("");
      setIsOpen(false);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-xs font-medium border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 text-indigo-600 flex items-center gap-1 transition"
      >
        <Plus size={14} /> Tạo tag mới
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-200 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <h3 className="font-bold text-black text-lg mb-4">Tạo tag mới</h3>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Tên tag (ví dụ: urgent, homework...)"
              className="w-full px-4 py-3 text-black border border-gray-200 rounded-xl text-sm mb-4 focus:border-indigo-400 outline-none"
            />
            <div className="flex gap-2">
              {/* ✅ Fix: nút Hủy dùng style khác với nút Tạo tag */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Đang tạo..." : "Tạo tag"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function formatDate(d: string | null, short = false) {
  if (!d) return null;
  const date = new Date(d);
  if (short) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDatetime(d: string | null) {
  if (!d) return null;
  const date = new Date(d);
  const hours = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");
  return `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} ${hours}:${mins}`;
}

function isOverdue(d: string | null, status: string | null) {
  if (!d || status === "done") return false;
  return new Date(d) < new Date();
}

function isDueToday(d: string | null) {
  if (!d) return false;
  const now = new Date();
  const due = new Date(d);
  return due.toDateString() === now.toDateString();
}

function timeAgo(d: string | null) {
  if (!d) return "";
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <Image size={14} className="text-purple-500" />;
  if (mimeType === "application/pdf")
    return <FileText size={14} className="text-red-500" />;
  return <File size={14} className="text-blue-500" />;
}

/* =====================================================
   CONFIRM DIALOG
===================================================== */
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900">Xác nhận xóa</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 font-medium"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   CATEGORY MODAL
===================================================== */
function CategoryModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color_code || "#3B82F6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) {
      setError("Tên không được để trống");
      return;
    }
    setLoading(true);
    try {
      if (initial)
        await api.patch(`/categories/${initial.id}`, {
          name,
          color_code: color,
        });
      else await api.post("/categories", { name, color_code: color });
      onSaved();
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.response?.data?.error || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">
            {initial ? "Chỉnh sửa danh sách" : "Tạo danh sách mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tên danh sách
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="VD: Bài tập, Lịch thi, CLB..."
            className="w-full px-4 py-2.5 border text-gray-950 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Màu sắc
          </label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 scale-110" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2 disabled:opacity-60 font-medium"
            style={{ backgroundColor: color }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {initial ? "Lưu" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   TASK MODAL (Create/Edit)
===================================================== */
function TaskModal({
  categories,
  initial,
  onClose,
  onSaved,
}: {
  categories: Category[];
  initial?: Task;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState<number>(initial?.priority || 2);
  const [categoryId, setCategoryId] = useState<number | "">(
    initial?.category_id || "",
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    initial?.due_date ? new Date(initial.due_date) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pendingReminders, setPendingReminders] = useState<Date[]>([]);
  const pendingRemindersRef = useRef<Date[]>([]); // ✅ ref tránh stale closure
  const [reminderInput, setReminderInput] = useState<Date | null>(null);
  const [reminderError, setReminderError] = useState("");

  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initial?.task_tags?.map((tt) => tt.tag.id) || [],
  );
  const [showTagPicker, setShowTagPicker] = useState(false);

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Sync ref mỗi khi pendingReminders thay đổi
  useEffect(() => {
    pendingRemindersRef.current = pendingReminders;
  }, [pendingReminders]);

  useEffect(() => {
    if (!initial) return;
    api
      .get(`/tasks/${initial.id}/reminders`)
      .then((res) => {
        const pending: Date[] = (res.data.reminders as Reminder[])
          .filter((r) => r.status === "pending")
          .map((r) => new Date(r.remind_time));
        setPendingReminders(pending);
      })
      .catch(console.error);
  }, [initial]);

  useEffect(() => {
    api
      .get("/tags")
      .then((res) => setAllTags(res.data.tags))
      .catch(console.error);
  }, []);

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        setFileError(`"${f.name}" vượt quá 10MB`);
        continue;
      }
      if (pendingFiles.some((pf) => pf.name === f.name && pf.size === f.size))
        continue;
      valid.push(f);
    }
    setPendingFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function addReminderToList() {
    if (!reminderInput) return;
    // ✅ Bỏ validate "đã qua" ở client, để server quyết định (có buffer 60s)
    if (pendingReminders.some((r) => r.getTime() === reminderInput.getTime())) {
      setReminderError("Thời gian này đã có");
      return;
    }
    setPendingReminders((prev) =>
      [...prev, reminderInput].sort((a, b) => a.getTime() - b.getTime()),
    );
    setReminderInput(null);
    setReminderError("");
  }

  function removeReminderFromList(index: number) {
    setPendingReminders((prev) => prev.filter((_, i) => i !== index));
  }

  function applyPreset(minutes: number) {
    if (!dueDate) return;
    const t = new Date(dueDate.getTime() - minutes * 60 * 1000);
    setReminderInput(t);
    setReminderError("");
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }
    setLoading(true);

    // ✅ Đọc từ ref thay vì state để tránh stale closure
    const remindersToPost = pendingRemindersRef.current;

    try {
      const payload = {
        title: title.trim(),
        description: description || null,
        priority,
        category_id: categoryId || null,
        due_date: dueDate ? dueDate.toISOString() : null,
      };

      let taskId: number;
      if (initial) {
        await api.patch(`/tasks/${initial.id}`, payload);
        taskId = initial.id;

        // Xóa reminder pending cũ trước khi tạo mới
        try {
          const existingRes = await api.get(`/tasks/${taskId}/reminders`);
          const pendingOld = (existingRes.data.reminders as Reminder[]).filter(
            (r) => r.status === "pending",
          );
          await Promise.all(
            pendingOld.map((r) =>
              api.delete(`/tasks/${taskId}/reminders/${r.id}`).catch(() => {}),
            ),
          );
          // eslint-disable-next-line no-empty
        } catch {}
      } else {
        const res = await api.post("/tasks", payload);
        taskId = res.data.task.id;
      }

      // Tags
      if (selectedTagIds.length > 0) {
        await Promise.all(
          selectedTagIds.map((tagId) =>
            api.post(`/tasks/${taskId}/tags/${tagId}`).catch(() => {}),
          ),
        );
      }

      // ✅ Dùng remindersToPost (từ ref) thay vì pendingReminders (state)
      if (remindersToPost.length > 0) {
        await Promise.allSettled(
          remindersToPost.map((r) =>
            api
              .post(`/tasks/${taskId}/reminders`, {
                remind_time: r.toISOString(),
              })
              .catch((err) =>
                console.error(
                  "Reminder POST failed:",
                  err.response?.data,
                  r.toISOString(),
                ),
              ),
          ),
        );
      }

      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach((f) => formData.append("files", f));
        await api.post(`/tasks/${taskId}/attachments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.response?.data?.error || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg font-mono">
              Ctrl+N
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Tiêu đề *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSave()
              }
              placeholder="VD: Hoàn thành bài tập CTDL..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-800"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Ghi chú
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết, link tài liệu..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Deadline
              </label>
              <DatePicker
                selected={dueDate}
                onChange={(d: Date | null) => setDueDate(d)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Chọn deadline"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Ưu tiên
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition ${priority === p ? PRIORITY_MAP[p].cls + " border-current" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                  >
                    {PRIORITY_MAP[p].icon} {PRIORITY_MAP[p].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Danh sách
            </label>
            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Không có danh sách</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* TAGS SECTION */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={13} className="text-indigo-500 shrink-0" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tags / Nhãn dán
              </label>
              {selectedTagIds.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium shrink-0">
                  {selectedTagIds.length} đã chọn
                </span>
              )}
            </div>

            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {allTags
                  .filter((t) => selectedTagIds.includes(t.id))
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: tag.color_code + "22",
                        color: tag.color_code,
                      }}
                    >
                      #{tag.name}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="hover:opacity-70 transition ml-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition border border-dashed border-indigo-200 py-2 rounded-xl"
              >
                <Plus size={13} /> Chọn tag có sẵn
              </button>
              <NewTagButton
                onCreated={(newTag) => {
                  setAllTags((prev) => [...prev, newTag]);
                  toggleTag(newTag.id);
                }}
              />
            </div>

            {showTagPicker && (
              <div className="mt-3 border border-gray-200 rounded-xl bg-white p-1.5 max-h-52 overflow-y-auto">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? "bg-indigo-50 border border-indigo-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color_code }}
                      />
                      <span
                        style={{ color: tag.color_code }}
                        className="flex-1 text-left"
                      >
                        #{tag.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          size={13}
                          className="text-indigo-500 shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FILE ATTACHMENT SECTION */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip size={13} className="text-green-500 shrink-0" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                File đính kèm
              </label>
              <span className="ml-auto text-xs text-gray-400">
                Tối đa 10MB/file
              </span>
            </div>

            {pendingFiles.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {pendingFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200"
                  >
                    {getFileIcon(f.type)}
                    <span className="flex-1 text-xs text-gray-700 truncate font-medium">
                      {f.name}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatFileSize(f.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-gray-300 hover:text-red-400 transition shrink-0 ml-1"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fileError && (
              <p className="text-xs text-red-500 mb-2">{fileError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="task-file-input"
            />
            <label
              htmlFor="task-file-input"
              className="flex items-center gap-2 justify-center w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition cursor-pointer"
            >
              <Paperclip size={14} />
              Nhấp để chọn file hoặc kéo thả vào đây
            </label>
          </div>

          {/* REMINDER SECTION */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={13} className="text-blue-500 shrink-0" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nhắc nhở qua email
              </label>
              {pendingReminders.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium shrink-0">
                  {pendingReminders.length} nhắc
                </span>
              )}
            </div>

            {pendingReminders.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {pendingReminders.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="flex-1 text-xs text-blue-800 font-medium">
                      {r.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeReminderFromList(i)}
                      className="text-blue-300 hover:text-red-400 transition shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <DatePicker
                selected={reminderInput}
                onChange={(d: Date | null) => {
                  setReminderInput(d);
                  setReminderError("");
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Chọn thời gian nhắc..."
                minDate={new Date()}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
              />
              <button
                type="button"
                onClick={addReminderToList}
                disabled={!reminderInput}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
            {reminderError && (
              <p className="text-xs text-red-500 mt-1.5">{reminderError}</p>
            )}

            <div className="mt-2.5">
              {dueDate ? (
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-xs text-gray-400">Nhắc trước:</span>
                  {REMINDER_PRESETS.map(({ label, minutes }) => {
                    const t = new Date(dueDate.getTime() - minutes * 60 * 1000);
                    const valid = t > new Date();
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => applyPreset(minutes)}
                        disabled={!valid}
                        className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Đặt deadline để dùng phím tắt nhắc nhở nhanh
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-white font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60 font-medium"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {initial ? "Cập nhật" : "Thêm task"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SUBTASK ITEM
===================================================== */
function SubtaskItem({
  subtask,
  taskId,
  onUpdated,
}: {
  subtask: SubTask;
  taskId: number;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(subtask.title);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleToggle() {
    const newStatus = subtask.status === "done" ? "todo" : "done";
    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtask.id}`, {
        status: newStatus,
      });
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setEditing(false);
      setTitle(subtask.title);
      return;
    }
    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtask.id}`, {
        title: title.trim(),
      });
      onUpdated();
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/tasks/${taskId}/subtasks/${subtask.id}`);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex items-center gap-2 group py-1.5">
      <button
        onClick={handleToggle}
        className={`shrink-0 transition ${subtask.status === "done" ? "text-green-500" : "text-gray-300 hover:text-blue-400"}`}
      >
        {subtask.status === "done" ? (
          <CheckCircle2 size={16} />
        ) : (
          <Circle size={16} />
        )}
      </button>
      {editing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditing(false);
              setTitle(subtask.title);
            }
          }}
          className="flex-1 text-sm border-b border-blue-400 outline-none bg-transparent text-gray-800 pb-0.5"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className={`flex-1 text-sm cursor-text ${subtask.status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}
        >
          {subtask.title}
        </span>
      )}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* =====================================================
   TASK DETAIL PANEL INNER
===================================================== */
function TaskDetailPanelInner({
  task,
  categories,
  onClose,
  onUpdated,
  onDeleted,
}: {
  task: Task;
  categories: Category[];
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(false);
  const [description, setDescription] = useState(task.description || "");
  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [localTask, setLocalTask] = useState(task);
  const [savingField, setSavingField] = useState<string | null>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [addingReminder, setAddingReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState("");

  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  // ✅ Fix: thêm setter cho showTagPicker
  const [showTagPicker, setShowTagPicker] = useState(false);

  const [attachments, setAttachments] = useState<TaskAttachment[]>(
    task.attachments || [],
  );
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState("");
  const attachFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReminders();
    fetchTags();
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchReminders() {
    try {
      const res = await api.get(`/tasks/${task.id}/reminders`);
      setReminders(res.data.reminders);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchTags() {
    try {
      const res = await api.get("/tags");
      setAllTags(res.data.tags);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAttachments() {
    try {
      const res = await api.get(`/tasks/${task.id}/attachments`);
      setAttachments(res.data.attachments || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAttachFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        setFileError(`"${f.name}" vượt quá 10MB`);
        if (attachFileInputRef.current) attachFileInputRef.current.value = "";
        return;
      }
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      await api.post(`/tasks/${task.id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAttachments();
    } catch (err) {
      const apiErr = err as ApiError;
      setFileError(apiErr?.response?.data?.error || "Lỗi khi tải file");
    } finally {
      setUploadingFile(false);
      if (attachFileInputRef.current) attachFileInputRef.current.value = "";
    }
  }

  async function handleDeleteAttachment(attachmentId: number) {
    try {
      await api.delete(`/tasks/${task.id}/attachments/${attachmentId}`);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      console.error(err);
    }
  }

  async function addReminder() {
    if (!reminderDate) return;
    setReminderLoading(true);
    setReminderError("");
    try {
      await api.post(`/tasks/${task.id}/reminders`, {
        remind_time: reminderDate.toISOString(),
      });
      setReminderDate(null);
      setAddingReminder(false);
      fetchReminders();
    } catch (err: unknown) {
      const error = err as ApiError;
      setReminderError(error?.response?.data?.error || "Lỗi khi đặt nhắc nhở");
    } finally {
      setReminderLoading(false);
    }
  }

  function applyDetailPreset(minutes: number) {
    if (!localTask.due_date) return;
    const t = new Date(
      new Date(localTask.due_date).getTime() - minutes * 60 * 1000,
    );
    if (t > new Date()) {
      setReminderDate(t);
      setReminderError("");
    }
  }

  async function handleDeleteReminder(reminderId: number) {
    try {
      await api.delete(`/tasks/${task.id}/reminders/${reminderId}`);
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddTag(tagId: number) {
    setTagLoading(true);
    try {
      await api.post(`/tasks/${task.id}/tags/${tagId}`);
      const res = await api.get(`/tasks/${task.id}`);
      setLocalTask(res.data.task);
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setTagLoading(false);
    }
  }

  async function handleRemoveTag(tagId: number) {
    try {
      await api.delete(`/tasks/${task.id}/tags/${tagId}`);
      const res = await api.get(`/tasks/${task.id}`);
      setLocalTask(res.data.task);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function patchTask(data: Partial<Task>) {
    try {
      const res = await api.patch(`/tasks/${task.id}`, data);
      setLocalTask(res.data.task);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function saveTitle() {
    if (!title.trim() || title === localTask.title) {
      setEditTitle(false);
      setTitle(localTask.title);
      return;
    }
    setSavingField("title");
    await patchTask({ title: title.trim() });
    setEditTitle(false);
    setSavingField(null);
  }

  async function saveDesc() {
    setSavingField("desc");
    await patchTask({ description: description || null });
    setEditDesc(false);
    setSavingField(null);
  }

  async function addSubtask() {
    if (!newSubtask.trim()) return;
    try {
      await api.post(`/tasks/${task.id}/subtasks`, {
        title: newSubtask.trim(),
      });
      setNewSubtask("");
      onUpdated();
      const res = await api.get(`/tasks/${task.id}`);
      setLocalTask(res.data.task);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubtaskUpdated() {
    const res = await api.get(`/tasks/${task.id}`);
    setLocalTask(res.data.task);
    onUpdated();
  }

  const isDone = localTask.status === "done";
  const overdue = isOverdue(localTask.due_date, localTask.status);
  const prio = localTask.priority ? PRIORITY_MAP[localTask.priority] : null;
  const doneSubtasks = localTask.subtasks.filter(
    (s) => s.status === "done",
  ).length;
  const subtaskProgress =
    localTask.subtasks.length > 0
      ? (doneSubtasks / localTask.subtasks.length) * 100
      : 0;
  const pendingReminderCount = reminders.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 w-90 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => patchTask({ status: isDone ? "todo" : "done" })}
            className={`transition ${isDone ? "text-green-500 hover:text-gray-400" : "text-gray-300 hover:text-green-500"}`}
          >
            {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {isDone ? "Đã hoàn thành" : "Đang thực hiện"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {pendingReminderCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
              <Bell size={11} />
              {pendingReminderCount}
            </span>
          )}
          {attachments.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">
              <Paperclip size={11} />
              {attachments.length}
            </span>
          )}
          <button
            onClick={onDeleted}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-5 pt-5 pb-3">
          {editTitle ? (
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              rows={2}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveTitle();
                }
                if (e.key === "Escape") {
                  setEditTitle(false);
                  setTitle(localTask.title);
                }
              }}
              className="w-full text-lg font-bold text-gray-900 border-b-2 border-blue-400 outline-none resize-none bg-transparent leading-snug"
            />
          ) : (
            <h2
              onClick={() => setEditTitle(true)}
              className={`text-lg font-bold leading-snug cursor-text hover:text-blue-600 transition ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}
            >
              {localTask.title}
            </h2>
          )}
        </div>

        {/* Priority + Category + Task Tags badges */}
        <div className="px-5 pb-4 flex flex-wrap gap-1.5">
          {prio && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${prio.cls}`}
            >
              {prio.icon} {prio.label}
            </span>
          )}
          {localTask.category && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor:
                  (localTask.category.color_code || "#3B82F6") + "20",
                color: localTask.category.color_code || "#3B82F6",
              }}
            >
              {localTask.category.name}
            </span>
          )}
          {localTask.task_tags.map((tt) => (
            <span
              key={tt.tag.id}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tt.tag.color_code + "22",
                color: tt.tag.color_code,
              }}
            >
              #{tt.tag.name}
            </span>
          ))}
        </div>

        {/* Meta info */}
        <div className="px-5 space-y-1 pb-4">
          <div
            className={`flex items-center gap-3 py-2.5 rounded-xl px-3 ${overdue ? "bg-red-50" : "hover:bg-gray-50"} transition`}
          >
            <Calendar
              size={15}
              className={overdue ? "text-red-500" : "text-gray-400"}
            />
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">Deadline</p>
              <p
                className={`text-sm font-semibold ${overdue ? "text-red-600" : "text-gray-700"}`}
              >
                {localTask.due_date
                  ? formatDatetime(localTask.due_date)
                  : "Chưa đặt deadline"}
                {overdue && " · Quá hạn"}
                {isDueToday(localTask.due_date) && !overdue && " · Hôm nay"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2.5 rounded-xl px-3 hover:bg-gray-50 transition">
            <Flag size={15} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">Mức ưu tiên</p>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    onClick={() => patchTask({ priority: p })}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${localTask.priority === p ? PRIORITY_MAP[p].cls : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
                  >
                    {PRIORITY_MAP[p].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2.5 rounded-xl px-3 hover:bg-gray-50 transition">
            <FolderOpen size={15} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">Danh sách</p>
              <select
                value={localTask.category_id || ""}
                onChange={(e) =>
                  patchTask({
                    category_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="mt-0.5 text-sm font-semibold text-gray-700 bg-transparent outline-none cursor-pointer w-full"
              >
                <option value="">Không có</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {localTask.created_at && (
            <div className="flex items-center gap-3 py-2 px-3">
              <Clock size={15} className="text-gray-300" />
              <p className="text-xs text-gray-400">
                Tạo {timeAgo(localTask.created_at)}
              </p>
            </div>
          )}
        </div>

        {/* Ghi chú */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ghi chú
            </p>
          </div>
          {editDesc ? (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                autoFocus
                className="w-full px-3 py-2 border border-blue-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none text-gray-700"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveDesc}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium"
                >
                  {savingField === "desc" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Lưu"
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditDesc(false);
                    setDescription(localTask.description || "");
                  }}
                  className="px-3 py-1.5 text-gray-500 text-xs rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditDesc(true)}
              className="px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-text transition min-h-16"
            >
              {localTask.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {localTask.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Thêm ghi chú...</p>
              )}
            </div>
          )}
        </div>

        {/* TAGS */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Tag size={13} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tags
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* ✅ Fix: thêm nút toggle showTagPicker */}
              <button
                type="button"
                onClick={() => setShowTagPicker((v) => !v)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
              >
                {showTagPicker ? "Ẩn" : "+ Chọn tag"}
              </button>
              <NewTagButton
                onCreated={async (newTag) => {
                  setAllTags((prev) => [...prev, newTag]);
                  await handleAddTag(newTag.id);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {localTask.task_tags.length === 0 && !showTagPicker && (
              <p className="text-xs text-gray-400 italic px-1">
                Chưa có tag nào
              </p>
            )}
            {localTask.task_tags.map((tt) => (
              <span
                key={tt.tag.id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium group/tag cursor-default"
                style={{
                  backgroundColor: tt.tag.color_code + "22",
                  color: tt.tag.color_code,
                }}
              >
                #{tt.tag.name}
                <button
                  onClick={() => handleRemoveTag(tt.tag.id)}
                  className="opacity-0 group-hover/tag:opacity-100 hover:text-red-500 transition ml-0.5 shrink-0"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {showTagPicker && (
            <div className="border border-gray-100 rounded-xl bg-gray-50 p-2 space-y-0.5">
              {allTags.map((tag) => {
                const isAttached = localTask.task_tags.some(
                  (tt) => tt.tag.id === tag.id,
                );
                return (
                  <button
                    key={tag.id}
                    onClick={() =>
                      isAttached
                        ? handleRemoveTag(tag.id)
                        : handleAddTag(tag.id)
                    }
                    disabled={tagLoading}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                      isAttached
                        ? "bg-white border border-gray-200 shadow-xs"
                        : "hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color_code }}
                    />
                    <span
                      style={{ color: tag.color_code }}
                      className="flex-1 text-left"
                    >
                      #{tag.name}
                    </span>
                    {isAttached && (
                      <CheckCircle2
                        size={13}
                        className="text-green-500 shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FILE ATTACHMENTS */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Paperclip size={13} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                File đính kèm
              </p>
              {attachments.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                  {attachments.length}
                </span>
              )}
            </div>
            <div>
              <input
                ref={attachFileInputRef}
                type="file"
                multiple
                onChange={handleAttachFile}
                className="hidden"
                id="detail-file-input"
              />
              <label
                htmlFor="detail-file-input"
                className={`p-1 rounded-lg transition cursor-pointer ${uploadingFile ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50 text-green-500"}`}
              >
                {uploadingFile ? (
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                ) : (
                  <Plus size={14} />
                )}
              </label>
            </div>
          </div>

          {fileError && (
            <p className="text-xs text-red-500 mb-2">{fileError}</p>
          )}

          {attachments.length === 0 && (
            <label
              htmlFor="detail-file-input"
              className="flex items-center gap-2 justify-center w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition cursor-pointer"
            >
              <Paperclip size={13} />
              Đính kèm file (tối đa 10MB)
            </label>
          )}

          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 group"
                >
                  {getFileIcon(att.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {att.file_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(att.file_size)}
                    </p>
                  </div>
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={13} />
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Công việc phụ */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Công việc phụ{" "}
              {localTask.subtasks.length > 0 &&
                `(${doneSubtasks}/${localTask.subtasks.length})`}
            </p>
          </div>
          {localTask.subtasks.length > 0 && (
            <div className="mb-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full bg-green-400 transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
              <div className="space-y-0.5">
                {localTask.subtasks.map((s) => (
                  <SubtaskItem
                    key={s.id}
                    subtask={s}
                    taskId={task.id}
                    onUpdated={handleSubtaskUpdated}
                  />
                ))}
              </div>
            </div>
          )}
          {addingSubtask ? (
            <div className="flex gap-2 mt-2">
              <input
                ref={subtaskInputRef}
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubtask();
                  if (e.key === "Escape") {
                    setAddingSubtask(false);
                    setNewSubtask("");
                  }
                }}
                placeholder="Nhập công việc phụ..."
                autoFocus
                className="flex-1 px-3 py-2 border border-blue-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 text-gray-800"
              />
              <button
                onClick={addSubtask}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => {
                  setAddingSubtask(false);
                  setNewSubtask("");
                }}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubtask(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl w-full transition"
            >
              <Plus size={14} /> Thêm công việc phụ
            </button>
          )}
        </div>

        {/* NHẮC NHỞ QUA EMAIL */}
        <div className="px-5 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nhắc nhở qua email
            </p>
            {pendingReminderCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
                {pendingReminderCount} đang chờ
              </span>
            )}
          </div>

          {reminders.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 group"
                >
                  <div className="flex items-center gap-2">
                    <Bell
                      size={13}
                      className={
                        r.status === "sent" ? "text-green-400" : "text-blue-400"
                      }
                    />
                    <span className="text-xs text-gray-600">
                      {new Date(r.remind_time).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {r.status === "sent" ? (
                      <span className="text-xs text-green-500 font-medium">
                        · Đã gửi
                      </span>
                    ) : (
                      <span className="text-xs text-blue-500 font-medium">
                        · Đang chờ
                      </span>
                    )}
                  </div>
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleDeleteReminder(r.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition shrink-0"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {addingReminder ? (
            <div className="space-y-2">
              <DatePicker
                selected={reminderDate}
                onChange={(d: Date | null) => {
                  setReminderDate(d);
                  setReminderError("");
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Chọn thời gian nhắc"
                minDate={new Date()}
                className="w-full px-3 py-2 border border-blue-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 text-gray-800"
              />

              {localTask.due_date && (
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-xs text-gray-400">Nhắc trước:</span>
                  {REMINDER_PRESETS.map(({ label, minutes }) => {
                    const t = new Date(
                      new Date(localTask.due_date!).getTime() -
                        minutes * 60 * 1000,
                    );
                    const valid = t > new Date();
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => applyDetailPreset(minutes)}
                        disabled={!valid}
                        className="text-xs px-2 py-0.5 rounded-lg border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {reminderError && (
                <p className="text-xs text-red-500">{reminderError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={addReminder}
                  disabled={!reminderDate || reminderLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition"
                >
                  {reminderLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Bell size={13} />
                  )}
                  Đặt nhắc nhở
                </button>
                <button
                  onClick={() => {
                    setAddingReminder(false);
                    setReminderDate(null);
                    setReminderError("");
                  }}
                  className="px-3 py-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingReminder(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl w-full transition"
            >
              <Plus size={14} /> Thêm nhắc nhở
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskDetailPanel(props: {
  task: Task;
  categories: Category[];
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  return <TaskDetailPanelInner key={props.task.id} {...props} />;
}

/* =====================================================
   TASK CARD
===================================================== */
function TaskCard({
  task,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  isSelected,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isSelected: boolean;
}) {
  const isDone = task.status === "done";
  const overdue = isOverdue(task.due_date, task.status);
  const today = isDueToday(task.due_date) && !isDone;
  const prio = task.priority ? PRIORITY_MAP[task.priority] : null;
  const doneSubtasks = task.subtasks.filter((s) => s.status === "done").length;
  const subtaskProgress =
    task.subtasks.length > 0 ? (doneSubtasks / task.subtasks.length) * 100 : 0;

  return (
    <div
      onClick={() => onSelect(task)}
      className={`rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer group
        ${isSelected ? "border-blue-300 ring-2 ring-blue-100 shadow-md" : "border-gray-100"}
        ${overdue ? "border-l-4 border-l-red-400" : today ? "border-l-4 border-l-amber-400" : ""}
        ${isDone ? "opacity-60" : ""}`}
    >
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          className={`mt-0.5 shrink-0 transition ${isDone ? "text-green-500" : "text-gray-300 hover:text-blue-500"}`}
        >
          {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-sm leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}
            >
              {task.title}
            </h3>
            <div className="hidden group-hover:flex gap-0.5 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {task.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}
          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-100 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-green-400 transition-all"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {doneSubtasks}/{task.subtasks.length}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {prio && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${prio.cls}`}
              >
                {prio.icon} {prio.label}
              </span>
            )}
            {task.category && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor:
                    (task.category.color_code || "#3B82F6") + "18",
                  color: task.category.color_code || "#3B82F6",
                }}
              >
                {task.category.name}
              </span>
            )}
            {task.task_tags.map((tt) => (
              <span
                key={tt.tag.id}
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: tt.tag.color_code + "22",
                  color: tt.tag.color_code,
                }}
              >
                #{tt.tag.name}
              </span>
            ))}
            {(task.attachments?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400">
                <Paperclip size={10} />
                {task.attachments!.length}
              </span>
            )}
            {task.due_date && (
              <span
                className={`ml-auto flex items-center gap-1 text-xs font-medium shrink-0 ${overdue ? "text-red-500" : today ? "text-amber-600" : "text-gray-400"}`}
              >
                <Calendar size={11} />
                {overdue ? "Quá hạn · " : today ? "Hôm nay · " : ""}
                {formatDate(task.due_date, true)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   REQ-005: DRAGGABLE CATEGORY ITEM
===================================================== */
function DraggableCategoryItem({
  cat,
  index,
  tasks,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggingOver,
}: {
  cat: Category;
  index: number;
  tasks: Task[];
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDraggingOver: boolean;
}) {
  const count = tasks.filter((t) => t.category_id === cat.id).length;
  const done = tasks.filter(
    (t) => t.category_id === cat.id && t.status === "done",
  ).length;
  const pct = count > 0 ? (done / count) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group mb-0.5 transition-all duration-150 ${
        isDraggingOver ? "opacity-50 scale-[0.98]" : ""
      }`}
    >
      <div
        className={`flex items-center gap-1 rounded-xl transition ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
      >
        <div
          className="pl-1.5 cursor-grab active:cursor-grabbing text-gray-300 opacity-0 group-hover:opacity-100 transition shrink-0"
          title="Kéo để sắp xếp"
        >
          <GripVertical size={13} />
        </div>

        <button
          onClick={onSelect}
          className={`flex-1 text-left px-2 py-2 text-sm flex items-center gap-2 ${isActive ? "text-blue-700 font-semibold" : "text-gray-600"}`}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: cat.color_code || "#3B82F6" }}
          />
          <span className="truncate">{cat.name}</span>
          <span
            className={`ml-auto text-xs px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
          >
            {count}
          </span>
        </button>
        <div className="hidden group-hover:flex pr-1 gap-0.5">
          <button
            onClick={onEdit}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-blue-600"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {count > 0 && (
        <div className="mx-3 mb-1">
          <div className="w-full bg-gray-100 rounded-full h-0.5">
            <div
              className="h-0.5 rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: cat.color_code || "#3B82F6",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   MAIN PAGE
===================================================== */
export default function TaskList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | undefined>();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "category" | "task";
    id: number;
    message: string;
  } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const dragIndexRef = useRef<number | null>(null);
  const [draggingOverIndex, setDraggingOverIndex] = useState<number | null>(
    null,
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        if (!showTaskModal) {
          setEditTask(undefined);
          setShowTaskModal(true);
        }
      }
      if (e.key === "Escape" && showTaskModal) {
        setShowTaskModal(false);
      }
    },
    [showTaskModal],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function fetchAll() {
    try {
      const [catRes, taskRes] = await Promise.all([
        api.get("/categories"),
        api.get("/tasks"),
      ]);
      setCategories(catRes.data.categories);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchAll();
    })();
  }, []);

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDraggingOverIndex(index);
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    setDraggingOverIndex(null);
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    setCategories(reordered);
    dragIndexRef.current = null;

    try {
      await api.patch("/categories/reorder", {
        order: reordered.map((c, i) => ({ id: c.id, display_order: i + 1 })),
      });
    } catch (err) {
      console.error(err);
      fetchAll();
    }
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDraggingOverIndex(null);
  }

  async function handleToggle(task: Task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      );
      if (selectedTask?.id === task.id)
        setSelectedTask((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
    } catch (err) {
      console.error(err);
    }
  }

  function handleDeleteTask(task: Task) {
    setConfirmDelete({
      type: "task",
      id: task.id,
      message: `Xóa công việc "${task.title}"? Hành động này không thể hoàn tác.`,
    });
  }

  async function handleDeleteCategory(cat: Category) {
    const count = tasks.filter((t) => t.category_id === cat.id).length;
    setConfirmDelete({
      type: "category",
      id: cat.id,
      message:
        count > 0
          ? `Danh sách "${cat.name}" có ${count} công việc. Xóa danh sách sẽ không xóa task bên trong. Tiếp tục?`
          : `Xóa danh sách "${cat.name}"?`,
    });
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === "task") {
        await api.delete(`/tasks/${confirmDelete.id}`);
        setTasks((prev) => prev.filter((t) => t.id !== confirmDelete.id));
        if (selectedTask?.id === confirmDelete.id) setSelectedTask(null);
      } else {
        await api.delete(`/categories/${confirmDelete.id}`);
        setCategories((prev) => prev.filter((c) => c.id !== confirmDelete.id));
        if (selectedCategoryId === confirmDelete.id)
          setSelectedCategoryId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  }

  const filteredTasks = useMemo(() => {
    const result = tasks.filter((t) => {
      if (selectedCategoryId !== null && t.category_id !== selectedCategoryId)
        return false;
      if (filterStatus === "todo" && t.status === "done") return false;
      if (filterStatus === "done" && t.status !== "done") return false;
      if (filterStatus === "overdue" && !isOverdue(t.due_date, t.status))
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;
      if (sortField === "priority") {
        valA = a.priority ?? 0;
        valB = b.priority ?? 0;
      } else if (sortField === "due_date") {
        valA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        valB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      } else if (sortField === "title") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else {
        valA = a.created_at ?? "";
        valB = b.created_at ?? "";
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    tasks,
    selectedCategoryId,
    filterStatus,
    searchQuery,
    sortField,
    sortAsc,
  ]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => isOverdue(t.due_date, t.status)).length;
    const today = tasks.filter(
      (t) => isDueToday(t.due_date) && t.status !== "done",
    ).length;
    return {
      total,
      done,
      todo: total - done,
      overdue,
      today,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [tasks]);

  const SORT_OPTIONS: { field: SortField; label: string }[] = [
    { field: "created_at", label: "Ngày tạo" },
    { field: "due_date", label: "Deadline" },
    { field: "priority", label: "Ưu tiên" },
    { field: "title", label: "Tên A-Z" },
  ];

  const STATUS_FILTERS: { key: FilterStatus; label: string; count?: number }[] =
    [
      { key: "all", label: "Tất cả", count: tasks.length },
      { key: "todo", label: "Đang làm", count: stats.todo },
      { key: "done", label: "Hoàn thành", count: stats.done },
      { key: "overdue", label: "Quá hạn", count: stats.overdue },
    ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="text-sm font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">TaskFlow</h1>
            <p className="text-xs text-gray-400">Quản lý công việc cá nhân</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400">Tổng</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{stats.pct}%</p>
            <p className="text-xs text-gray-400">Hoàn thành</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-500">{stats.today}</p>
            <p className="text-xs text-gray-400">Hôm nay</p>
          </div>
          {stats.overdue > 0 && (
            <div className="text-center">
              <p className="text-xl font-bold text-red-500">{stats.overdue}</p>
              <p className="text-xs text-gray-400">Quá hạn</p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setEditTask(undefined);
            setShowTaskModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold shadow-sm transition group"
          title="Ctrl+N"
        >
          <Plus size={16} /> Thêm task
          <span className="text-blue-300 text-xs font-mono ml-1 group-hover:text-blue-100">
            Ctrl+N
          </span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
          <div className="p-4 flex-1">
            <div className="mb-5 p-3 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-blue-700">
                  Tiến độ hôm nay
                </p>
                <p className="text-sm font-bold text-blue-800">{stats.pct}%</p>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1.5">
                {stats.done}/{stats.total} hoàn thành
              </p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
                Xem nhanh
              </p>
              {[
                {
                  key: "all" as FilterStatus,
                  label: "Tất cả task",
                  icon: <Inbox size={15} />,
                  count: stats.total,
                },
                {
                  key: "todo" as FilterStatus,
                  label: "Đang làm",
                  icon: <Circle size={15} />,
                  count: stats.todo,
                },
                {
                  key: "done" as FilterStatus,
                  label: "Hoàn thành",
                  icon: <CheckCheck size={15} />,
                  count: stats.done,
                },
                {
                  key: "overdue" as FilterStatus,
                  label: "Quá hạn",
                  icon: <AlertTriangle size={15} />,
                  count: stats.overdue,
                },
              ].map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilterStatus(key);
                    setSelectedCategoryId(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition mb-0.5 ${filterStatus === key && selectedCategoryId === null ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2.5">
                    {icon}
                    {label}
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${key === "overdue" && count > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Danh sách
                </p>
                <button
                  onClick={() => {
                    setEditCategory(undefined);
                    setShowCategoryModal(true);
                  }}
                  className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                  title="Thêm danh sách"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div onDragEnd={handleDragEnd}>
                {categories.map((cat, index) => (
                  <DraggableCategoryItem
                    key={cat.id}
                    cat={cat}
                    index={index}
                    tasks={tasks}
                    isActive={selectedCategoryId === cat.id}
                    isDraggingOver={draggingOverIndex === index}
                    onSelect={() => {
                      setSelectedCategoryId(cat.id);
                      setFilterStatus("all");
                    }}
                    onEdit={() => {
                      setEditCategory(cat);
                      setShowCategoryModal(true);
                    }}
                    onDelete={() => handleDeleteCategory(cat)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </div>

              {categories.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4 px-2">
                  Chưa có danh sách nào.
                  <br />
                  Nhấn + để tạo mới
                </p>
              )}
              {categories.length > 1 && (
                <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <GripVertical size={11} /> Kéo để sắp xếp thứ tự
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-0.5">
                <Link
                  to="/user/sessions"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <Shield size={15} className="text-indigo-400" />
                  Phiên đăng nhập
                </Link>
                <Link
                  to="/user/trash"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 size={15} className="text-rose-400" />
                    Thùng rác
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm task..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 text-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1">
              {STATUS_FILTERS.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterStatus === key ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {label}
                  {count !== undefined && count > 0 && key === "overdue" && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-400 text-white rounded-full text-xs">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
              >
                <ArrowUpDown size={13} />
                {SORT_OPTIONS.find((s) => s.field === sortField)?.label}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-9 z-30 bg-white rounded-xl border border-gray-100 shadow-xl p-1.5 w-36">
                  {SORT_OPTIONS.map(({ field, label }) => (
                    <button
                      key={field}
                      onClick={() => {
                        if (sortField === field) setSortAsc(!sortAsc);
                        else {
                          setSortField(field);
                          setSortAsc(false);
                        }
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition ${sortField === field ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {label}
                      {sortField === field && (
                        <span className="text-blue-500">
                          {sortAsc ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 ml-auto font-medium">
              {filteredTasks.length} task
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="p-5 bg-gray-100 rounded-3xl mb-4">
                  <ListChecks size={36} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-700 mb-1">
                  {searchQuery
                    ? "Không tìm thấy task nào"
                    : "Chưa có công việc"}
                </h3>
                <p className="text-sm text-gray-400 mb-5 max-w-xs">
                  {searchQuery
                    ? `Không có kết quả cho "${searchQuery}"`
                    : "Bắt đầu thêm công việc để quản lý tiến độ tốt hơn"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => {
                      setEditTask(undefined);
                      setShowTaskModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 font-semibold flex items-center gap-2 transition"
                  >
                    <Plus size={15} /> Thêm task đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-w-2xl mx-auto">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTask?.id === task.id}
                    onToggle={handleToggle}
                    onSelect={(t) =>
                      setSelectedTask(selectedTask?.id === t.id ? null : t)
                    }
                    onEdit={(t) => {
                      setEditTask(t);
                      setShowTaskModal(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            categories={categories}
            onClose={() => setSelectedTask(null)}
            onUpdated={fetchAll}
            onDeleted={() => {
              handleDeleteTask(selectedTask);
              setSelectedTask(null);
            }}
          />
        )}
      </div>

      {showCategoryModal && (
        <CategoryModal
          initial={editCategory}
          onClose={() => setShowCategoryModal(false)}
          onSaved={fetchAll}
        />
      )}
      {showTaskModal && (
        <TaskModal
          categories={categories}
          initial={editTask}
          onClose={() => setShowTaskModal(false)}
          onSaved={async () => {
            await fetchAll();
            setShowTaskModal(false);
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={confirmDelete.message}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {showSortMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
}
