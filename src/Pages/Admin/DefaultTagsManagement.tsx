import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Tags, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import ErrorState from "../../components/Admin/ErrorState";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TagDisplay {
  id: number;
  name: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TAG_COLORS = [
  {
    value: "red",
    label: "Đỏ",
    hex: "#ef4444",
    bg: "bg-red-500/20    text-red-400    border-red-500/40",
  },
  {
    value: "orange",
    label: "Cam",
    hex: "#f97316",
    bg: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  {
    value: "yellow",
    label: "Vàng",
    hex: "#eab308",
    bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  },
  {
    value: "green",
    label: "Xanh lá",
    hex: "#10b981",
    bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  {
    value: "blue",
    label: "Xanh",
    hex: "#3b82f6",
    bg: "bg-blue-500/20   text-blue-400   border-blue-500/40",
  },
  {
    value: "indigo",
    label: "Chàm",
    hex: "#6366f1",
    bg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
  },
  {
    value: "purple",
    label: "Tím",
    hex: "#a855f7",
    bg: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  },
  {
    value: "pink",
    label: "Hồng",
    hex: "#ec4899",
    bg: "bg-pink-500/20   text-pink-400   border-pink-500/40",
  },
];

const getColorBg = (v: string) =>
  TAG_COLORS.find((c) => c.value === v)?.bg ?? TAG_COLORS[4].bg;
const getColorHex = (v: string) =>
  TAG_COLORS.find((c) => c.value === v)?.hex ?? "#3b82f6";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TagSkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl animate-pulse"
        >
          <div className="h-7 w-28 bg-white/10 rounded-md" />
          <div className="h-7 w-7 bg-white/10 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

// ── Color Picker ──────────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          title={color.label}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            value === color.value
              ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              : "border-white/10 hover:scale-105 hover:border-white/30"
          }`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DefaultTagsManagement() {
  const [tags, setTags] = useState<TagDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit inline state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("blue");
  const [savingEditId, setSavingEditId] = useState<number | null>(null);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<TagDisplay | null>(null);

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = () => {
    setIsLoading(true);
    setError(false);
    adminService
      .getDefaultTags()
      .then((res) =>
        setTags(
          res.tags.map((t) => ({
            id: t.id,
            name: t.name ?? "",
            color: t.color_code ?? "blue",
          })),
        ),
      )
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAddTag = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTagName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await adminService.createDefaultTag({
        name: newTagName.trim(),
        color: selectedColor,
      });
      setTags((prev) => [
        ...prev,
        {
          id: res.tag.id,
          name: res.tag.name ?? newTagName.trim(),
          color: res.tag.color_code ?? selectedColor,
        },
      ]);
      setNewTagName("");
      toast.success(`Đã tạo nhãn "${res.tag.name}"`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg ?? "Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit inline ────────────────────────────────────────────────────────────
  const startEdit = (tag: TagDisplay) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (tag: TagDisplay) => {
    if (!editName.trim()) {
      cancelEdit();
      return;
    }
    if (editName.trim() === tag.name && editColor === tag.color) {
      cancelEdit();
      return;
    }
    setSavingEditId(tag.id);
    try {
      // adminService.updateDefaultTag chưa có → gọi thẳng nếu có,
      // hoặc delete + create nếu chưa có endpoint PATCH
      // Hiện tại adminService không có updateDefaultTag nên tạm dùng delete + create
      await adminService.deleteDefaultTag(tag.id);
      const res = await adminService.createDefaultTag({
        name: editName.trim(),
        color: editColor,
      });
      setTags((prev) =>
        prev.map((t) =>
          t.id === tag.id
            ? {
                id: res.tag.id,
                name: res.tag.name ?? editName.trim(),
                color: editColor,
              }
            : t,
        ),
      );
      toast.success("Đã cập nhật nhãn");
      cancelEdit();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg ?? "Lỗi hệ thống");
    } finally {
      setSavingEditId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await adminService.deleteDefaultTag(confirmDelete.id);
      setTags((prev) => prev.filter((t) => t.id !== confirmDelete.id));
      toast.success(`Đã xóa nhãn "${confirmDelete.name}"`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg ?? "Lỗi hệ thống");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 text-white max-w-5xl">
      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa nhãn mặc định"
        description={`Xóa nhãn "${confirmDelete?.name}"? Sinh viên mới sẽ không nhận được nhãn này nữa.`}
        confirmLabel="Xóa nhãn"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nhãn Mặc Định</h1>
        <p className="text-gray-400 text-sm mt-1">
          Thiết lập bộ nhãn mẫu — tự động khởi tạo cho sinh viên khi đăng ký tài
          khoản lần đầu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Form tạo nhãn ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleAddTag}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6"
          >
            <h2 className="text-base font-bold mb-5 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Tạo Nhãn Mới
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="VD: Câu lạc bộ, Bài tập..."
                maxLength={50}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Màu sắc
              </label>
              <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            </div>

            {/* Preview */}
            <div className="mb-5 p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 mb-2">Xem trước</p>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm border font-semibold ${getColorBg(selectedColor)}`}
              >
                # {newTagName || "Tên nhãn"}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newTagName.trim()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {isSubmitting ? "Đang tạo..." : "Thêm nhãn mặc định"}
            </button>
          </form>
        </div>

        {/* ── Danh sách ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            {/* List header */}
            <div className="px-5 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Danh sách nhãn hiện tại</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nhãn này sẽ được gán tự động khi sinh viên đăng ký mới
                </p>
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-semibold">
                {tags.length} nhãn
              </span>
            </div>

            {/* Content */}
            <div className="p-3">
              {isLoading ? (
                <TagSkeleton />
              ) : error ? (
                <div className="py-4">
                  <ErrorState onRetry={load} />
                </div>
              ) : tags.length === 0 ? (
                <div className="py-14 text-center text-gray-600">
                  <Tags size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Chưa có nhãn mặc định nào</p>
                  <p className="text-xs mt-1 text-gray-700">
                    Tạo nhãn đầu tiên ở form bên trái
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {tags.map((tag) => (
                    <li key={tag.id} className="group">
                      {editingId === tag.id ? (
                        /* ── Edit mode ── */
                        <div className="p-3 bg-white/5 border border-indigo-500/30 rounded-xl space-y-3">
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void saveEdit(tag);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            maxLength={50}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                          />
                          <ColorPicker
                            value={editColor}
                            onChange={setEditColor}
                          />
                          {/* Preview while editing */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs border font-semibold ${getColorBg(editColor)}`}
                            >
                              # {editName || "Tên nhãn"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                                title="Hủy"
                              >
                                <X size={15} />
                              </button>
                              <button
                                onClick={() => void saveEdit(tag)}
                                disabled={
                                  savingEditId === tag.id || !editName.trim()
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition"
                              >
                                {savingEditId === tag.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Check size={13} />
                                )}
                                Lưu
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ── View mode ── */
                        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            {/* Color dot */}
                            <div
                              className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white/10"
                              style={{
                                backgroundColor: getColorHex(tag.color),
                              }}
                            />
                            <span
                              className={`px-3 py-1.5 rounded-lg text-sm border font-semibold ${getColorBg(tag.color)}`}
                            >
                              # {tag.name}
                            </span>
                          </div>

                          {/* Actions — hiện khi hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(tag)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(tag)}
                              disabled={deletingId === tag.id}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                              title="Xóa nhãn"
                            >
                              {deletingId === tag.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer note */}
            {!isLoading && !error && tags.length > 0 && (
              <div className="px-5 py-3 border-t border-white/5 bg-black/10">
                <p className="text-xs text-gray-600">
                  💡 Hover vào nhãn để chỉnh sửa hoặc xóa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
