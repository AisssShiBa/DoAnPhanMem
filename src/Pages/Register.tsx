import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { authService } from "../services/authService";

export default function Register() {
  /* =========================
      STATES
    ========================= */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Trạng thái kiểm tra xem đã đăng ký thành công chưa
  const [isRegistered, setIsRegistered] = useState(false);

  /* =========================
      HANDLE REGISTER
    ========================= */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    /* CHECK PASSWORD */
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

      // Nếu thành công, chuyển trạng thái isRegistered thành true
      // Giao diện sẽ tự động đổi sang thông báo Check Email
      setIsRegistered(true);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{
        error?: string;
        details?: {
          message?: string;
        }[];
      }>;

      const errorMessage =
        axiosError.response?.data?.details?.[0]?.message ||
        axiosError.response?.data?.error ||
        "Đăng ký thất bại.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
      UI - MÀN HÌNH THÔNG BÁO XÁC MINH EMAIL
    ========================= */
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-900">
        {/* Glow backgrounds */}
        <div className="absolute -top-15 left-1/2 -translate-x-1/2 w-125 h-75 bg-purple-500 opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-pink-500 opacity-15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50 text-center">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Kiểm tra Email của bạn!
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Chúng tôi đã gửi một liên kết xác minh đến tài khoản <br />
              <strong className="text-white text-base">{email}</strong>. <br />
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

  /* =========================
      UI - FORM ĐĂNG KÝ (MẶC ĐỊNH)
    ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-900">
      {/* Glow backgrounds */}
      <div className="absolute -top-15 left-1/2 -translate-x-1/2 w-125 h-75 bg-purple-500 opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-75 h-75 bg-pink-500 opacity-15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
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

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-1">
            Tạo tài khoản
          </h2>
          <p className="text-gray-500 text-center text-sm mb-7">
            Tham gia cộng đồng sinh viên ngay hôm nay
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
              />
              <p className="text-gray-600 text-xs mt-1.5">Tối thiểu 8 ký tự</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-[0.98] transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản →"}
            </button>
          </form>

          {/* Terms */}
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

          {/* Login */}
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
