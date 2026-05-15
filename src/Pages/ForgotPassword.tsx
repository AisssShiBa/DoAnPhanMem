import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading || countdown > 0) return;

    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      setCountdown(60);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            "Gửi yêu cầu thất bại. Vui lòng thử lại!",
        );
      } else {
        setError("Đã xảy ra lỗi không xác định!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Quên mật khẩu?
        </h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Đừng lo lắng! Hãy nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng
          dẫn để đặt lại mật khẩu.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {success ? (
          /* ── Trạng thái thành công ── */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <svg
                className="w-8 h-8 text-green-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-400 text-sm font-medium">
                Email đã được gửi!
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Kiểm tra hộp thư của{" "}
                <span className="text-gray-300">{email}</span>
              </p>
            </div>

            {/* Nút gửi lại + đếm ngược */}
            <button
              onClick={() => handleSubmit()}
              disabled={countdown > 0 || isLoading}
              className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Đang gửi...
                </>
              ) : countdown > 0 ? (
                `Gửi lại sau ${countdown}s`
              ) : (
                "Gửi lại email"
              )}
            </button>
          </div>
        ) : (
          /* ── Form gửi yêu cầu ── */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email của bạn
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.edu.vn"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition hover:underline"
          >
            &larr; Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
