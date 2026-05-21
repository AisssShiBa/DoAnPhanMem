import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { authService } from "../services/authService";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

// Kiểm tra độ mạnh mật khẩu
function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Yếu", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Trung bình", color: "bg-yellow-500" };
  if (score <= 3) return { score, label: "Khá", color: "bg-blue-500" };
  return { score, label: "Mạnh", color: "bg-emerald-500" };
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsLoading(true);
    try {
      await authService.signup({
        fullName: name,
        email,
        password,
        confirmPassword,
      });
      setIsRegistered(true);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{
        error?: string;
        details?: { message?: string }[];
      }>;
      setError(
        axiosError.response?.data?.details?.[0]?.message ||
          axiosError.response?.data?.error ||
          "Đăng ký thất bại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Màn hình xác minh email ──────────────────────────────
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-900">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-125 h-75 bg-purple-500 opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-pink-500 opacity-15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50 text-center">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Kiểm tra Email của bạn!
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Chúng tôi đã gửi một liên kết xác minh đến
              <br />
              <strong className="text-white text-base">{email}</strong>.<br />
              <br />
              Vui lòng kiểm tra hộp thư (và cả thư mục Spam) để kích hoạt tài
              khoản trước khi đăng nhập.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-[0.98] transition"
            >
              Đi đến Đăng nhập →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form đăng ký ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-900">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-125 h-75 bg-purple-500 opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-75 h-75 bg-pink-500 opacity-15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-1">
            Tạo tài khoản
          </h2>
          <p className="text-gray-500 text-center text-sm mb-7">
            Tham gia cộng đồng sinh viên ngay hôm nay
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="example@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Thanh độ mạnh */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= i ? strength.color : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${
                      strength.score <= 1
                        ? "text-red-400"
                        : strength.score <= 2
                          ? "text-yellow-400"
                          : strength.score <= 3
                            ? "text-blue-400"
                            : "text-emerald-400"
                    }`}
                  >
                    Độ mạnh: {strength.label}
                  </p>
                </div>
              )}

              {/* Gợi ý mật khẩu — sát trái */}
              <div className="mt-2 space-y-1">
                {[
                  { check: password.length >= 8, text: "Ít nhất 8 ký tự" },
                  { check: /[A-Z]/.test(password), text: "Có chữ hoa (A-Z)" },
                  { check: /[0-9]/.test(password), text: "Có chữ số (0-9)" },
                  {
                    check: /[^A-Za-z0-9]/.test(password),
                    text: "Có ký tự đặc biệt (!@#...)",
                  },
                ].map(({ check, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <svg
                      className={`w-3 h-3 shrink-0 transition-colors ${check ? "text-emerald-400" : "text-gray-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {check ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      )}
                    </svg>
                    <span
                      className={`text-xs transition-colors ${check ? "text-emerald-400" : "text-gray-600"}`}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 bg-white/5 border rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 transition ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/50 focus:ring-red-500/40"
                      : confirmPassword && confirmPassword === password
                        ? "border-emerald-500/50 focus:ring-emerald-500/40"
                        : "border-white/10 focus:ring-purple-500/60 focus:border-purple-500/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition p-0.5"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {/* Feedback khớp/không khớp */}
              {confirmPassword && (
                <p
                  className={`text-xs mt-1.5 ${confirmPassword === password ? "text-emerald-400" : "text-red-400"}`}
                >
                  {confirmPassword === password
                    ? "✓ Mật khẩu khớp"
                    : "✗ Mật khẩu không khớp"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-[0.98] transition mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Tạo tài khoản →"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-4">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <Link
              to="/terms"
              className="text-gray-400 hover:text-gray-300 underline underline-offset-2 transition"
            >
              Điều khoản dịch vụ
            </Link>
          </p>

          <div className="my-5 h-px bg-white/10" />

          <p className="text-center text-xs text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
