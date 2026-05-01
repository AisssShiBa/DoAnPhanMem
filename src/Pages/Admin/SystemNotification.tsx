import React, { useState } from "react";
import {
  Calendar,
  History,
  Eye,
  PenLine,
  Megaphone,
  Loader2,
} from "lucide-react";

// --- Kiểu dữ liệu ---
interface NotificationHistory {
  id: number;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "MAINTENANCE";
  sent_at: string;
  reach_count: number;
}

export default function SystemNotification() {
  // State cho Form soạn thảo
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"INFO" | "WARNING" | "MAINTENANCE">("INFO");
  const [isSending, setIsSending] = useState(false);

  // State Lịch sử (Mock data)
  const [history, setHistory] = useState<NotificationHistory[]>([
    {
      id: 1,
      title: "Cập nhật tính năng Pomodoro mới",
      content:
        "Hệ thống đã cập nhật âm thanh báo thức mới cho bộ đếm Pomodoro. Chúc các bạn học tập hiệu quả!",
      type: "INFO",
      sent_at: "2026-04-20 10:00",
      reach_count: 1245,
    },
    {
      id: 2,
      title: "Bảo trì máy chủ định kỳ",
      content:
        "Hệ thống sẽ tạm ngưng hoạt động từ 00:00 đến 02:00 sáng Chủ nhật tuần này để nâng cấp RAM.",
      type: "MAINTENANCE",
      sent_at: "2026-04-15 15:30",
      reach_count: 1230,
    },
  ]);

  // Xử lý gửi thông báo
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (
      window.confirm(
        `Bạn chuẩn bị gửi thông báo này đến TẤT CẢ sinh viên. Tiếp tục?`,
      )
    ) {
      setIsSending(true);

      // Giả lập API delay
      setTimeout(() => {
        const newNotif: NotificationHistory = {
          id: Date.now(),
          title,
          content,
          type,
          sent_at: new Date().toISOString().slice(0, 16).replace("T", " "),
          reach_count: 1250, // Giả sử hiện có 1250 users
        };

        setHistory([newNotif, ...history]); // Đẩy lên đầu danh sách
        setTitle("");
        setContent("");
        setIsSending(false);
        alert("Đã gửi thông báo thành công!");
      }, 1500);
    }
  };

  // Helper render màu cho Badge dựa trên Type
  const getTypeBadge = (notifType: string) => {
    switch (notifType) {
      case "WARNING":
        return (
          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/20">
            CẢNH BÁO
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
            BẢO TRÌ
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
            THÔNG TIN
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 text-white max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Phát thanh Thông báo (Broadcast)
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gửi thông báo hệ thống đồng loạt đến toàn bộ sinh viên trên nền tảng.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* CỘT TRÁI: KHU VỰC SOẠN THẢOb*/}
        <div className="xl:col-span-5">
          <form
            onSubmit={handleSendBroadcast}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg sticky top-6"
          >
            <h2 className="text-lg font-bold mb-6 text-indigo-400 flex items-center gap-2">
              <PenLine size={20} /> Soạn thông báo mới
            </h2>

            {/* Loại thông báo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phân loại
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["INFO", "WARNING", "MAINTENANCE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      type === t
                        ? t === "INFO"
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : t === "WARNING"
                            ? "bg-orange-500/20 border-orange-500 text-orange-400"
                            : "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-black/20 border-white/10 text-gray-500 hover:border-white/30"
                    }`}
                  >
                    {t === "INFO"
                      ? "THÔNG TIN"
                      : t === "WARNING"
                        ? "CẢNH BÁO"
                        : "BẢO TRÌ"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiêu đề */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Cập nhật tính năng mới..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Nội dung */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nội dung chi tiết
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Nhập nội dung thông báo sẽ hiển thị trên màn hình của sinh viên..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !title || !content}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Megaphone size={20} />
              )}
              {isSending ? "Đang phát thanh..." : "Phát thanh ngay"}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Thông báo sẽ được gửi đến{" "}
              <strong className="text-gray-300">toàn bộ sinh viên</strong> đang
              hoạt động.
            </p>
          </form>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ ĐÃ GỬI */}
        <div className="xl:col-span-7">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-6 text-gray-200 flex items-center gap-2">
              <History size={20} /> Lịch sử phát thanh
            </h2>

            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">
                      {item.title}
                    </h3>
                    {getTypeBadge(item.type)}
                  </div>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Đã gửi: {item.sent_at}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400/70">
                      <Eye size={14} /> Tiếp cận:{" "}
                      {item.reach_count.toLocaleString()} người
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
