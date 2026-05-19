import { useEffect, useState } from "react";
import { sessionService } from "../services/sessionService";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type Session = {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
};

function parseDevice(ua: string): { label: string; icon: string } {
  if (!ua || ua === "unknown")
    return { label: "Thiết bị không xác định", icon: "💻" };

  // Detect OS
  let os = "";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.1/.test(ua)) os = "Windows 7";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    const ver = match ? match[1].replace(/_/g, ".") : "";
    os = ver ? `macOS ${ver}` : "macOS";
  } else if (/Linux/.test(ua)) os = "Linux";
  else if (/Android/.test(ua)) {
    const match = ua.match(/Android ([\d.]+)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/iPhone OS/.test(ua)) {
    const match = ua.match(/iPhone OS ([\d_]+)/);
    const ver = match ? match[1].replace(/_/g, ".") : "";
    os = ver ? `iOS ${ver}` : "iOS";
  }

  // Detect browser
  let browser = "";
  if (/Edg\//.test(ua)) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = match ? `Edge ${match[1].split(".")[0]}` : "Edge";
  } else if (/OPR\/|Opera\//.test(ua)) {
    const match = ua.match(/OPR\/([\d.]+)/);
    browser = match ? `Opera ${match[1].split(".")[0]}` : "Opera";
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = match ? `Chrome ${match[1].split(".")[0]}` : "Chrome";
  } else if (/Firefox\//.test(ua)) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = match ? `Firefox ${match[1].split(".")[0]}` : "Firefox";
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    browser = "Safari";
  }

  // Detect device type
  const isMobile = /iPhone|iPad|Android/.test(ua);
  const icon = isMobile ? "📱" : "💻";

  const parts = [browser, os].filter(Boolean);
  const label =
    parts.length > 0 ? parts.join(" · ") : "Trình duyệt không xác định";

  return { label, icon };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await sessionService.getSessions();
      setSessions(res.data.sessions);
    } catch {
      setError("Không thể tải danh sách phiên");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await sessionService.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Lỗi thu hồi phiên");
      }
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm("Đăng xuất tất cả thiết bị?")) return;
    try {
      await sessionService.logoutAll();
      logout();
      navigate("/login");
    } catch {
      setError("Lỗi đăng xuất");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header với nút back */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition"
          aria-label="Quay lại"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">Phiên đăng nhập</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý thiết bị đang truy cập tài khoản
          </p>
        </div>

        <button
          onClick={handleLogoutAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition"
        >
          Đăng xuất tất cả
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Không có phiên nào</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const { label, icon } = parseDevice(s.device_info ?? "");
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  s.is_current
                    ? "border-indigo-500/40 bg-indigo-500/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-2xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {label}
                    {s.is_current && (
                      <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                        Hiện tại
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.ip_address} · {timeAgo(s.created_at)}
                  </p>
                </div>
                {!s.is_current && (
                  <button
                    onClick={() => handleRevoke(s.id)}
                    className="text-xs text-gray-400 border border-white/10 px-3 py-1.5 rounded-lg hover:border-red-500/40 hover:text-red-400 transition"
                  >
                    Thu hồi
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
