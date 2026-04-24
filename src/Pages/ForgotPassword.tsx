import React from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
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

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email của bạn
            </label>
            <input
              type="email"
              placeholder="name@student.edu.vn"
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            Gửi yêu cầu
          </button>
        </form>

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
