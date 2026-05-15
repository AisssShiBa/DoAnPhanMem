import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Save,
  CheckCircle,
  Monitor,
  Smartphone,
  Laptop,
  LogOut,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  Wifi,
  Eye,
  EyeOff,
  Lock,
  Settings as SettingsIcon,
  ChevronRight,
  Pencil,
} from "lucide-react";
import api from "../../lib/axios";

/* ==================================================
   TYPES
================================================== */
interface ProfileData {
  full_name: string;
  phone: string;
  school: string;
  major: string;
}
interface SettingsData {
  notification_enabled: boolean;
}
interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}
type SaveStatus = "idle" | "saving" | "saved" | "error";
type Tab = "profile" | "security" | "sessions";

/* ==================================================
   HELPERS
================================================== */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function parseDevice(ua: string): {
  label: string;
  os: string;
  icon: "desktop" | "mobile" | "laptop";
} {
  if (!ua || ua === "unknown")
    return {
      label: "Trình duyệt không rõ",
      os: "Thiết bị lạ",
      icon: "desktop",
    };
  const isMobile = /iPhone|Android(?!.*Tablet)|Mobile/.test(ua);
  const isTablet = /iPad|Android.*Tablet/.test(ua);
  let browser = "Trình duyệt khác";
  if (/Edg\//.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua))
    browser = "Google Chrome";
  else if (/Firefox\//.test(ua)) browser = "Mozilla Firefox";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  let os = "Hệ điều hành không rõ";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone/.test(ua)) os = "iPhone (iOS)";
  else if (/iPad/.test(ua)) os = "iPad (iPadOS)";
  else if (/Linux/.test(ua)) os = "Linux";
  return {
    label: browser,
    os,
    icon: isMobile ? "mobile" : isTablet ? "laptop" : "desktop",
  };
}

function expireLabel(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.floor(ms / 86400000);
  if (days > 1) return `Hết hạn sau ${days} ngày`;
  if (days === 1) return "Hết hạn ngày mai";
  const hrs = Math.floor(ms / 3600000);
  if (hrs > 0) return `Hết hạn sau ${hrs} giờ`;
  return "Sắp hết hạn";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/* ==================================================
   SUB-COMPONENTS
================================================== */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        checked ? "bg-indigo-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SaveBtn({ status, label }: { status: SaveStatus; label: string }) {
  const base =
    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed";
  const cls =
    status === "saved"
      ? `${base} bg-emerald-500 text-white`
      : status === "error"
        ? `${base} bg-red-500 text-white`
        : status === "saving"
          ? `${base} bg-indigo-400 text-white opacity-80`
          : `${base} bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white`;
  return (
    <button type="submit" disabled={status === "saving"} className={cls}>
      {status === "saving" ? (
        <>
          <RefreshCw size={14} className="animate-spin" />
          Đang lưu...
        </>
      ) : status === "saved" ? (
        <>
          <CheckCircle size={14} />
          Đã lưu!
        </>
      ) : status === "error" ? (
        <>
          <AlertTriangle size={14} />
          Thử lại
        </>
      ) : (
        <>
          <Save size={14} />
          {label}
        </>
      )}
    </button>
  );
}

function DeviceIcon({ type }: { type: "desktop" | "mobile" | "laptop" }) {
  if (type === "mobile") return <Smartphone size={16} />;
  if (type === "laptop") return <Laptop size={16} />;
  return <Monitor size={16} />;
}

/* ==================================================
   PROFILE TAB — display card + edit form
================================================== */
function ProfileTab({
  profile,
  setProfile,
  settings,
  setSettings,
}: {
  profile: ProfileData;
  setProfile: (p: ProfileData) => void;
  settings: SettingsData;
  setSettings: (s: SettingsData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [notifSaving, setNotifSaving] = useState(false);
  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!draft.full_name || draft.full_name.length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự");
      return;
    }
    setStatus("saving");
    try {
      await api.put("/profile", draft);
      setProfile(draft);
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
        setEditing(false);
      }, 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleSaveNotif = async () => {
    const next = {
      ...settings,
      notification_enabled: !settings.notification_enabled,
    };
    setSettings(next); // optimistic update
    setNotifSaving(true);
    try {
      await api.put("/profile/settings", next);
    } catch {
      setSettings(settings); // revert nếu lỗi
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Profile display card */}
      {!editing ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Hero strip */}
          <div className="h-20 bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border-2 border-white">
                <span className="text-xl font-bold text-indigo-600 tracking-tight">
                  {initials(profile.full_name) || "?"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-10 pb-5 px-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {profile.full_name || (
                    <span className="text-slate-300 font-normal italic">
                      Chưa đặt tên
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {profile.major || "Chưa có chuyên ngành"}
                </p>
              </div>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-indigo-200 text-indigo-500 hover:bg-indigo-50 transition font-medium"
              >
                <Pencil size={11} /> Chỉnh sửa
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  icon: <Phone size={13} />,
                  label: "SĐT",
                  value: profile.phone,
                },
                {
                  icon: <GraduationCap size={13} />,
                  label: "Trường",
                  value: profile.school,
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                    {icon} {label}
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {value || (
                      <span className="text-slate-300 font-normal">
                        Chưa điền
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Edit form */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <User size={15} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Chỉnh sửa hồ sơ
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cập nhật thông tin cá nhân
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "full_name" as const,
                  label: "Họ và tên",
                  icon: <User size={14} />,
                  placeholder: "Nguyễn Văn A",
                },
                {
                  key: "phone" as const,
                  label: "Số điện thoại",
                  icon: <Phone size={14} />,
                  placeholder: "0901 234 567",
                },
                {
                  key: "school" as const,
                  label: "Trường học",
                  icon: <GraduationCap size={14} />,
                  placeholder: "ĐH Bách Khoa TP.HCM",
                },
                {
                  key: "major" as const,
                  label: "Chuyên ngành",
                  icon: <BookOpen size={14} />,
                  placeholder: "Công nghệ thông tin",
                },
              ].map(({ key, label, icon, placeholder }) => (
                <div key={key} className="group">
                  <label className="block text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      {icon}
                    </span>
                    <input
                      type="text"
                      value={draft[key]}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.value })
                      }
                      placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
            {error && (
              <p className="mt-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertTriangle size={13} /> {error}
              </p>
            )}
            <div className="flex items-center justify-between pt-5 mt-1 border-t border-slate-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition font-medium"
              >
                Huỷ
              </button>
              <SaveBtn status={status} label="Lưu hồ sơ" />
            </div>
          </form>
        </div>
      )}

      {/* Notification preference */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell size={15} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Nhắc nhở deadline
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.notification_enabled
                  ? "Đang bật — sẽ nhận email khi sắp đến hạn"
                  : "Đã tắt — không nhận email nhắc nhở"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifSaving && (
              <RefreshCw size={12} className="animate-spin text-slate-400" />
            )}
            <Toggle
              checked={settings.notification_enabled}
              onChange={handleSaveNotif}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================
   SECURITY TAB — password change
================================================== */
function SecurityTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");

  const fields: {
    key: keyof typeof form;
    label: string;
    placeholder: string;
    show: boolean;
    toggle: () => void;
  }[] = [
    {
      key: "current",
      label: "Mật khẩu hiện tại",
      placeholder: "••••••••",
      show: showCurrent,
      toggle: () => setShowCurrent((v) => !v),
    },
    {
      key: "next",
      label: "Mật khẩu mới",
      placeholder: "Ít nhất 8 ký tự",
      show: showNext,
      toggle: () => setShowNext((v) => !v),
    },
    {
      key: "confirm",
      label: "Xác nhận mật khẩu mới",
      placeholder: "Nhập lại mật khẩu mới",
      show: showNext,
      toggle: () => setShowNext((v) => !v),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.next.length < 8) {
      setError("Mật khẩu mới phải ít nhất 8 ký tự");
      return;
    }
    if (form.next !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setStatus("saving");
    try {
      await api.put("/profile/password", {
        current_password: form.current,
        new_password: form.next,
      });
      setStatus("saved");
      setForm({ current: "", next: "", confirm: "" });
      setShowCurrent(false);
      setShowNext(false);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.error ?? "Đổi mật khẩu thất bại");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <Lock size={15} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Đổi mật khẩu</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Khuyến nghị đổi định kỳ mỗi 3 tháng
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {fields.map(({ key, label, placeholder, show, toggle }) => (
          <div key={key}>
            <label className="block text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              {label}
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={show ? "text" : "password"}
                value={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border text-black border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {(key === "current" || key === "next") && (
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {error && (
          <p className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertTriangle size={13} /> {error}
          </p>
        )}
        <div className="flex justify-end pt-1">
          <SaveBtn status={status} label="Đổi mật khẩu" />
        </div>
      </form>
    </div>
  );
}

/* ==================================================
   SESSIONS TAB
================================================== */
function SessionsTab({
  sessions,
  setSessions,
  loading,
  onRefresh,
}: {
  sessions: Session[];
  setSessions: (s: Session[]) => void;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setRevoking(null);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await api.post("/auth/logout-all");
      setSessions([]);
      setConfirmLogoutAll(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLogoutAllLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <ShieldCheck size={15} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Phiên đăng nhập
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {sessions.length} thiết bị đang hoạt động
            </p>
          </div>
        </div>
        {confirmLogoutAll ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Đăng xuất tất cả?</span>
            <button
              onClick={handleLogoutAll}
              disabled={logoutAllLoading}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60 min-w-15 text-center"
            >
              {logoutAllLoading ? (
                <RefreshCw size={12} className="animate-spin mx-auto" />
              ) : (
                "Xác nhận"
              )}
            </button>
            <button
              onClick={() => setConfirmLogoutAll(false)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            >
              Huỷ
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogoutAll(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition font-medium"
          >
            <LogOut size={12} /> Đăng xuất tất cả
          </button>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-10 text-center">
            <Wifi size={28} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">
              Không có phiên nào đang hoạt động
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Hãy đăng nhập lại để thấy thiết bị của bạn
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const { label, os, icon } = parseDevice(s.device_info ?? "");
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
                    s.is_current
                      ? "border-indigo-200 bg-indigo-50/60"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/80"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      s.is_current
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <DeviceIcon type={icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {label}
                      </span>
                      {s.is_current && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold shrink-0">
                          Thiết bị này
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Monitor size={10} /> {os}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin size={10} /> {s.ip_address}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={10} /> {timeAgo(s.created_at)}
                      </span>
                      <span className="text-[11px] text-slate-300">
                        {expireLabel(s.expires_at)}
                      </span>
                    </div>
                  </div>
                  {!s.is_current && (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      disabled={revoking === s.id}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {revoking === s.id ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <>
                          <LogOut size={11} /> Thu hồi
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!loading && sessions.length > 0 && (
          <button
            onClick={onRefresh}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-indigo-500 transition rounded-xl hover:bg-indigo-50"
          >
            <RefreshCw size={11} /> Làm mới danh sách
          </button>
        )}
      </div>
    </div>
  );
}

/* ==================================================
   MAIN
================================================== */
const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] =
  [
    {
      id: "profile",
      label: "Hồ sơ",
      icon: <User size={15} />,
      desc: "Thông tin cá nhân & thông báo",
    },
    {
      id: "security",
      label: "Bảo mật",
      icon: <Lock size={15} />,
      desc: "Đổi mật khẩu",
    },
    {
      id: "sessions",
      label: "Phiên đăng nhập",
      icon: <ShieldCheck size={15} />,
      desc: "Quản lý thiết bị",
    },
  ];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    school: "",
    major: "",
  });
  const [settings, setSettings] = useState<SettingsData>({
    notification_enabled: true,
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profile");
        const { user } = res.data;
        setProfile({
          full_name: user.full_name || "",
          phone: user.phone || "",
          school: user.school || "",
          major: user.major || "",
        });
        if (user.settings)
          setSettings({
            notification_enabled: user.settings.notification_enabled ?? true,
          });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get("/auth/sessions");
      setSessions(res.data.sessions ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, [fetchSessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin text-indigo-400" />
          <span className="text-sm font-medium">Đang tải cài đặt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <SettingsIcon size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Cài đặt
            </h1>
            <p className="text-xs text-slate-400">
              Quản lý tài khoản và bảo mật
            </p>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar tabs */}
          <div className="w-48 shrink-0 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  activeTab === t.id
                    ? "bg-white border border-slate-200 shadow-sm text-indigo-600"
                    : "text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm hover:border hover:border-slate-100"
                }`}
              >
                <span
                  className={`shrink-0 ${activeTab === t.id ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-500"}`}
                >
                  {t.icon}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${activeTab === t.id ? "text-indigo-700" : ""}`}
                  >
                    {t.label}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                    {t.desc}
                  </p>
                </div>
                {activeTab === t.id && (
                  <ChevronRight
                    size={12}
                    className="ml-auto text-indigo-400 shrink-0"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <ProfileTab
                profile={profile}
                setProfile={setProfile}
                settings={settings}
                setSettings={setSettings}
              />
            )}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "sessions" && (
              <SessionsTab
                sessions={sessions}
                setSessions={setSessions}
                loading={sessionsLoading}
                onRefresh={fetchSessions}
              />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6 pb-4">
          Dữ liệu tài khoản được bảo mật và mã hóa. Nếu bạn thấy thiết bị lạ,
          hãy thu hồi ngay.
        </p>
      </div>
    </div>
  );
}
