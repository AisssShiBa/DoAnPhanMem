import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

// --- Kiểu dữ liệu dựa trên bảng Activity_Logs ghép với Users ---
interface LogEntry {
  id: number;
  user_name: string;
  user_email: string;
  role: "ADMIN" | "USER";
  action: string;
  action_type: "CREATE" | "UPDATE" | "DELETE" | "SYSTEM" | "ALERT";
  created_at: string;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  // Giả lập lấy dữ liệu Nhật ký từ Backend
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Dữ liệu mẫu (Mock Data)
        setLogs([
          {
            id: 1005,
            user_name: "Hệ thống tự động",
            user_email: "system@softwhere.edu.vn",
            role: "ADMIN",
            action:
              "Thực hiện sao lưu toàn bộ cơ sở dữ liệu định kỳ (Auto Backup).",
            action_type: "SYSTEM",
            created_at: "2026-04-26 02:00:00",
          },
          {
            id: 1004,
            user_name: "Adminstrator (Kiệt)",
            user_email: "admin@softwhere.edu.vn",
            role: "ADMIN",
            action:
              "Đã KHÓA (Banned) tài khoản ttb.marketing@student.edu.vn do phát hiện spam.",
            action_type: "ALERT",
            created_at: "2026-04-25 15:45:12",
          },
          {
            id: 1003,
            user_name: "Nguyễn Văn A",
            user_email: "nva.it@student.edu.vn",
            role: "USER",
            action: "Hoàn thành task: 'Nộp báo cáo đồ án Web'.",
            action_type: "UPDATE",
            created_at: "2026-04-25 09:12:05",
          },
          {
            id: 1002,
            user_name: "Adminstrator (Kiệt)",
            user_email: "admin@softwhere.edu.vn",
            role: "ADMIN",
            action:
              "Gửi thông báo Broadcast: 'Cập nhật tính năng Pomodoro mới'.",
            action_type: "CREATE",
            created_at: "2026-04-24 10:00:00",
          },
          {
            id: 1001,
            user_name: "Lê Văn C",
            user_email: "lvc.design@student.edu.vn",
            role: "USER",
            action: "Xóa danh mục công việc: 'Câu lạc bộ'.",
            action_type: "DELETE",
            created_at: "2026-04-23 20:15:30",
          },
        ]);
      } catch (error) {
        console.error("Lỗi tải nhật ký", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Hàm tiện ích để render Badge màu sắc cho từng loại hành động
  const getActionBadge = (type: string) => {
    switch (type) {
      case "CREATE":
        return (
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">
            THÊM
          </span>
        );
      case "UPDATE":
        return (
          <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
            CẬP NHẬT
          </span>
        );
      case "DELETE":
        return (
          <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
            XÓA
          </span>
        );
      case "ALERT":
        return (
          <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/20">
            CẢNH BÁO
          </span>
        );
      case "SYSTEM":
        return (
          <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/20">
            HỆ THỐNG
          </span>
        );
      default:
        return (
          <span className="bg-gray-500/10 text-gray-400 px-2 py-1 rounded text-xs font-bold border border-gray-500/20">
            LOG
          </span>
        );
    }
  };

  // Logic lọc dữ liệu
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "ALL" || log.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 text-white max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Nhật ký hệ thống (Audit Log)
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Giám sát mọi hoạt động thay đổi dữ liệu của Quản trị viên và Người
          dùng.
        </p>
      </div>

      {/* Thanh công cụ: Tìm kiếm & Lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative group">
          {/* Icon kính lúp nằm bên trái */}
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors"
          />

          <input
            type="text"
            placeholder="Tìm theo email người dùng hoặc nội dung hành động..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="w-full md:w-48 flex-shrink-0">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
          >
            <option value="ALL" className="bg-[#0f0f1a]">
              Tất cả đối tượng
            </option>
            <option value="ADMIN" className="bg-[#0f0f1a]">
              Chỉ Admin
            </option>
            <option value="USER" className="bg-[#0f0f1a]">
              Chỉ Sinh viên
            </option>
          </select>
        </div>
      </div>

      {/* Bảng Nhật Ký */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-medium w-48">Thời gian</th>
                <th className="p-4 font-medium w-64">Người thực hiện</th>
                <th className="p-4 font-medium w-24">Loại</th>
                <th className="p-4 font-medium">Chi tiết hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 animate-pulse"
                  >
                    Đang quét nhật ký hệ thống...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Không tìm thấy bản ghi nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    {/* Thời gian */}
                    <td className="p-4 whitespace-nowrap text-gray-400 font-mono text-xs">
                      {log.created_at}
                    </td>

                    {/* Người thực hiện */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${log.role === "ADMIN" ? "bg-indigo-500" : "bg-gray-500"}`}
                        ></span>
                        <div>
                          <p className="font-medium text-gray-200">
                            {log.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.user_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Badge Loại */}
                    <td className="p-0">{getActionBadge(log.action_type)}</td>

                    {/* Chi tiết hành động */}
                    <td className="p-4 text-gray-300">
                      <span className="group-hover:text-white transition-colors">
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Table (Phân trang giả lập) */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs text-gray-500">
          <span>Hiển thị 5 / 12,450 bản ghi</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/10 transition disabled:opacity-50">
              Trước
            </button>
            <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/10 transition">
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
