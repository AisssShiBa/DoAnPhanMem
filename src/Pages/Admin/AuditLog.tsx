import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService, type LogEntry } from "../../services/adminService";

// ── Badge loại hành động ──────────────────────────────────────
const ACTION_BADGE: Record<string, { label: string; className: string }> = {
  CREATE: {
    label: "THÊM",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  UPDATE: {
    label: "CẬP NHẬT",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  DELETE: {
    label: "XÓA",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  ALERT: {
    label: "CẢNH BÁO",
    className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  },
  SYSTEM: {
    label: "HỆ THỐNG",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
};

// Format datetime từ ISO string sang locale VN
const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function AuditLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Debounce search 400ms ────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page khi filter role thay đổi
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [filterRole]);

  // ── Fetch logs ───────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        search: debouncedSearch || undefined,
        role: filterRole,
        page,
      });
      setLogs(res.logs);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error("Lỗi tải nhật ký", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filterRole, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="p-6 md:p-8 text-white max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Nhật ký hệ thống (Audit Log)
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Giám sát toàn bộ hành động thay đổi dữ liệu của Quản trị viên và Người
          dùng.
          {total > 0 && (
            <span className="ml-2 text-indigo-400 font-medium">
              ({total.toLocaleString("vi-VN")} bản ghi)
            </span>
          )}
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors"
          />
          <input
            type="text"
            placeholder="Tìm theo email hoặc nội dung hành động..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter role */}
        <div className="w-full md:w-48 shrink-0">
          <select
            value={filterRole}
            onChange={(e) =>
              setFilterRole(e.target.value as "ALL" | "ADMIN" | "USER")
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
          >
            <option value="ALL" className="bg-[#0f0f1a]">
              Tất cả
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

      {/* ── Table ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-medium w-44">Thời gian</th>
                <th className="p-4 font-medium w-60">Người thực hiện</th>
                <th className="p-4 font-medium w-28">Loại</th>
                <th className="p-4 font-medium">Chi tiết hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-600 animate-pulse"
                  >
                    Đang quét nhật ký hệ thống...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-600">
                    Không tìm thấy bản ghi nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge =
                    ACTION_BADGE[log.action_type] ?? ACTION_BADGE.UPDATE;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* Thời gian — format đẹp */}
                      <td className="p-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                        {formatDate(log.created_at)}
                      </td>

                      {/* Người thực hiện */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              log.role === "ADMIN"
                                ? "bg-indigo-500"
                                : "bg-gray-600"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-200 text-sm">
                              {log.user_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {log.user_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Badge loại */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Nội dung hành động */}
                      <td className="p-4 text-gray-400 group-hover:text-gray-200 transition-colors">
                        {log.action ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs text-gray-500">
          <span>
            Trang {page}/{totalPages || 1} — {total.toLocaleString("vi-VN")} bản
            ghi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="p-1.5 border border-white/10 rounded-lg hover:bg-white/10 transition disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg tabular-nums">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 border border-white/10 rounded-lg hover:bg-white/10 transition disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
