import { useEffect, useState } from "react";
import { Trash2, RotateCcw, X, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/axios";

/* =====================================================
   TYPES
===================================================== */
interface TrashedTask {
  id: number;
  title: string;
  status: string;
  priority: number | null;
  due_date: string | null;
  deleted_at: string | null;
  category: { id: number; name: string; color_code: string } | null;
}

/* =====================================================
   HELPERS
===================================================== */
function priorityLabel(p: number | null) {
  if (p === 3) return { text: "Cao", cls: "bg-red-100 text-red-600" };
  if (p === 2) return { text: "TB", cls: "bg-yellow-100 text-yellow-600" };
  return { text: "Thấp", cls: "bg-gray-100 text-gray-500" };
}

function formatDate(d: string | null) {
  if (!d) return "--";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* =====================================================
   COMPONENT
===================================================== */
export default function TrashPage() {
  const [tasks, setTasks] = useState<TrashedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTrash();
  }, []);

  async function fetchTrash() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tasks/trash");
      setTasks(res.data.tasks ?? []);
    } catch {
      setError("Không thể tải thùng rác. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(
      selected.size === tasks.length
        ? new Set()
        : new Set(tasks.map((t) => t.id)),
    );
  }

  async function restore(id: number) {
    setBusy(true);
    try {
      await api.patch(`/tasks/${id}/restore`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch {
      setError("Khôi phục thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function permanentDelete(id: number) {
    setBusy(true);
    try {
      await api.delete(`/tasks/${id}/permanent`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch {
      setError("Xóa thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function restoreSelected() {
    setBusy(true);
    try {
      await Promise.all(
        [...selected].map((id) => api.patch(`/tasks/${id}/restore`)),
      );
      setTasks((prev) => prev.filter((t) => !selected.has(t.id)));
      setSelected(new Set());
    } catch {
      setError("Khôi phục một số task thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function emptyTrash() {
    setBusy(true);
    try {
      await api.delete("/tasks/trash/empty");
      setTasks([]);
      setSelected(new Set());
      setConfirmEmpty(false);
    } catch {
      setError("Xóa thùng rác thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/user/tasks"
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition"
            title="Quay lại"
          >
            <ArrowLeft size={17} />
          </Link>
          <Trash2 size={20} className="text-gray-500" />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Thùng rác</h1>
            {tasks.length > 0 && (
              <p className="text-xs text-gray-400">
                {tasks.length} mục đang chờ xóa
              </p>
            )}
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={restoreSelected}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 transition disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Khôi phục ({selected.size})
              </button>
            )}
            <button
              onClick={() => setConfirmEmpty(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition"
            >
              <X size={14} />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertTriangle size={15} />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Confirm empty dialog */}
      {confirmEmpty && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">Xóa vĩnh viễn?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Tất cả <strong>{tasks.length}</strong> nhiệm vụ trong thùng rác sẽ
              bị xóa vĩnh viễn. Hành động này{" "}
              <strong>không thể hoàn tác</strong>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={emptyTrash}
                disabled={busy}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60"
              >
                {busy ? "Đang xóa..." : "Xóa tất cả"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 h-16 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="p-5 bg-gray-100 rounded-3xl inline-block mb-4">
            <Trash2 size={36} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Thùng rác trống 🎉</p>
          <p className="text-gray-400 text-sm mt-1">Không có task nào bị xóa</p>
          <Link
            to="/user"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <ArrowLeft size={14} /> Quay lại TaskFlow
          </Link>
        </div>
      ) : (
        <>
          {/* Select all bar */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <input
              type="checkbox"
              checked={selected.size === tasks.length && tasks.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-xs text-gray-400">
              {selected.size > 0
                ? `Đã chọn ${selected.size}/${tasks.length}`
                : "Chọn tất cả"}
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => {
              const { text, cls } = priorityLabel(task.priority);
              const isSelected = selected.has(task.id);

              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 bg-white rounded-xl p-4 border transition ${
                    isSelected
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(task.id)}
                    className="w-4 h-4 rounded accent-blue-500 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 line-through truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}
                      >
                        {text}
                      </span>
                      {task.category && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: task.category.color_code + "22",
                            color: task.category.color_code,
                          }}
                        >
                          {task.category.name}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        Xóa lúc {formatDate(task.deleted_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => restore(task.id)}
                      disabled={busy}
                      title="Khôi phục"
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      onClick={() => permanentDelete(task.id)}
                      disabled={busy}
                      title="Xóa vĩnh viễn"
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
