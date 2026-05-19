import { useState, useEffect } from "react";
import {
  Calendar,
  History,
  Eye,
  PenLine,
  Megaphone,
  Loader2,
  ChevronDown,
  Send,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminService,
  type NotifHistoryItem,
} from "../../services/adminService";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";

// ── Types ──────────────────────────────────────────────────────
interface NotifDisplay {
  id: number;
  title: string;
  type: "INFO" | "WARNING" | "MAINTENANCE";
  sent_at: string;
  reach_count: number;
  sender: string;
}

const parseLogToDisplay = (item: NotifHistoryItem): NotifDisplay => {
  const action = item.action ?? "";

  // Format: BROADCAST "Tiêu đề" → 9 users
  const titleMatch = action.match(/BROADCAST\s+"(.+?)"\s+→/);
  const countMatch = action.match(/→\s+(\d+)\s+users/);

  // Type không có trong action string → mặc định INFO
  // Nếu backend sau này thêm type thì parse ở đây
  const typeMatch = action.match(/\[(INFO|WARNING|MAINTENANCE)\]/);

  return {
    id: item.id,
    title: titleMatch?.[1] ?? "(Không có tiêu đề)",
    type: (typeMatch?.[1] as NotifDisplay["type"]) ?? "INFO",
    sent_at: new Date(item.created_at).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    reach_count: Number(countMatch?.[1] ?? 0),
    sender: item.user_name ?? item.user_email ?? "Admin", // ← dùng user_name thay vì item.user
  };
};

// ── Badge config ───────────────────────────────────────────────
const TYPE_CONFIG = {
  INFO: {
    label: "THÔNG TIN",
    className: "bg-blue-500/20 text-blue-400 border border-blue-500/20",
    selectClassName: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    icon: "ℹ️",
    description: "Thông báo thông thường",
  },
  WARNING: {
    label: "CẢNH BÁO",
    className: "bg-orange-500/20 text-orange-400 border border-orange-500/20",
    selectClassName: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    icon: "⚠️",
    description: "Cảnh báo quan trọng",
  },
  MAINTENANCE: {
    label: "BẢO TRÌ",
    className: "bg-red-500/20 text-red-400 border border-red-500/20",
    selectClassName: "bg-red-500/20 text-red-400 border-red-500/40",
    icon: "🔧",
    description: "Bảo trì hệ thống",
  },
} as const;

// ── Skeleton ───────────────────────────────────────────────────
function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-black/20 border border-white/5 rounded-xl p-4 animate-pulse"
        >
          <div className="flex justify-between gap-3 mb-3">
            <div className="h-4 bg-white/10 rounded w-2/3" />
            <div className="h-4 bg-white/10 rounded w-16" />
          </div>
          <div className="h-3 bg-white/5 rounded w-1/2 mt-3" />
        </div>
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function SystemNotification() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"INFO" | "WARNING" | "MAINTENANCE">("INFO");
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [history, setHistory] = useState<NotifDisplay[]>([]);
  const [histPage, setHistPage] = useState(1);
  const [histTotalPages, setHistTotalPages] = useState(1);
  const [isLoadingHist, setIsLoadingHist] = useState(true);

  const charCount = content.length;
  const MAX_CONTENT = 1000;

  // ── Load history ───────────────────────────────────────────
  const loadHistory = async (page: number, append = false) => {
    setIsLoadingHist(true);
    try {
      const res = await adminService.getNotificationHistory(page);
      const parsed = res.history.map(parseLogToDisplay);
      setHistory((prev) => (append ? [...prev, ...parsed] : parsed));
      setHistTotalPages(res.pagination.totalPages);
      setHistPage(page);
    } catch {
      toast.error("Không thể tải lịch sử thông báo");
    } finally {
      setIsLoadingHist(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory(1);
  }, []);

  // ── Send ───────────────────────────────────────────────────
  const handleSendBroadcast = async () => {
    setIsSending(true);
    try {
      const res = await adminService.broadcastNotification({
        title: title.trim(),
        content: content.trim(),
        type,
      });
      toast.success(
        `Đã gửi thành công đến ${res.reachCount.toLocaleString("vi-VN")} người dùng`,
      );
      setTitle("");
      setContent("");
      setType("INFO");
      await loadHistory(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg ?? "Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setIsSending(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="p-6 md:p-8 text-white max-w-6xl mx-auto">
      {/* Confirm dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Xác nhận phát thanh"
        description={`Gửi thông báo [${TYPE_CONFIG[type].label}] với tiêu đề "${title}" đến toàn bộ sinh viên đang hoạt động?`}
        confirmLabel="Phát thanh ngay"
        confirmVariant="primary"
        onConfirm={handleSendBroadcast}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Phát thanh Thông báo</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gửi thông báo hệ thống đồng loạt đến toàn bộ sinh viên đang hoạt động
          trên nền tảng.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* ── Form ── */}
        <div className="xl:col-span-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg sticky top-6 space-y-5">
            <h2 className="text-base font-bold text-indigo-400 flex items-center gap-2">
              <PenLine size={18} /> Soạn thông báo mới
            </h2>

            {/* Loại */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Phân loại
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["INFO", "WARNING", "MAINTENANCE"] as const).map((t) => {
                  const c = TYPE_CONFIG[t];
                  const isActive = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      title={c.description}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        isActive
                          ? c.selectClassName
                          : "bg-black/20 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      <span className="block text-base mb-0.5">{c.icon}</span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cập nhật tính năng mới..."
                maxLength={255}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* Nội dung */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Nội dung <span className="text-red-400">*</span>
                </label>
                <span
                  className={`text-xs ${charCount > MAX_CONTENT * 0.9 ? "text-orange-400" : "text-gray-600"}`}
                >
                  {charCount}/{MAX_CONTENT}
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                maxLength={MAX_CONTENT}
                placeholder="Nhập nội dung thông báo hiển thị trên màn hình sinh viên..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition resize-none"
              />
            </div>

            {/* Preview */}
            {(title || content) && (
              <div
                className={`rounded-xl border p-3 text-xs ${TYPE_CONFIG[type].className}`}
              >
                <p className="font-bold mb-1">
                  {TYPE_CONFIG[type].icon} {title || "Tiêu đề..."}
                </p>
                <p className="opacity-80 line-clamp-2">
                  {content || "Nội dung..."}
                </p>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertCircle
                size={14}
                className="text-yellow-400 mt-0.5 shrink-0"
              />
              <p className="text-xs text-yellow-300/80">
                Thông báo sẽ được gửi đến{" "}
                <strong className="text-yellow-300">
                  tất cả sinh viên ACTIVE
                </strong>
                . Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isSending || !title.trim() || !content.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isSending ? "Đang gửi..." : "Phát thanh ngay"}
            </button>
          </div>
        </div>

        {/* ── History ── */}
        <div className="xl:col-span-7">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-base font-bold mb-6 text-gray-200 flex items-center gap-2">
              <History size={18} /> Lịch sử phát thanh
            </h2>

            {isLoadingHist && history.length === 0 ? (
              <HistorySkeleton />
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-gray-600">
                <Megaphone size={36} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">Chưa có thông báo nào được gửi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const cfg = TYPE_CONFIG[item.type];
                  return (
                    <div
                      key={item.id}
                      className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <h3 className="font-bold text-white text-sm leading-snug flex-1">
                          {cfg.icon} {item.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-lg font-bold whitespace-nowrap shrink-0 border ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={11} />
                          {item.sent_at} · {item.sender}
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-400/70 font-medium">
                          <Eye size={11} />
                          {item.reach_count.toLocaleString("vi-VN")} người nhận
                        </span>
                      </div>
                    </div>
                  );
                })}

                {histPage < histTotalPages && (
                  <button
                    onClick={() => loadHistory(histPage + 1, true)}
                    disabled={isLoadingHist}
                    className="w-full py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoadingHist ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    {isLoadingHist ? "Đang tải..." : "Xem thêm"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
