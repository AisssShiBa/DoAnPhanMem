import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { authService } from "../services/authService";

type VerifyStatus = "loading" | "success" | "error";

const channel = new BroadcastChannel("verify_email_channel");

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const hasCalled = useRef(false);

  const [status, setStatus] = useState<VerifyStatus>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Đang xác thực email của bạn..."
      : "Không tìm thấy mã xác thực hợp lệ!",
  );
  const [oldTabFound, setOldTabFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (hasCalled.current) return;
    hasCalled.current = true;

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Email của bạn đã được xác thực thành công!");

        // Gửi signal sang tab cũ (Register/Login đang mở)
        channel.postMessage({ type: "VERIFY_SUCCESS" });
        setOldTabFound(true);
      } catch (err: unknown) {
        setStatus("error");
        if (axios.isAxiosError(err)) {
          setMessage(
            err.response?.data?.error || "Token hết hạn hoặc không hợp lệ",
          );
        } else {
          setMessage("Đã xảy ra lỗi không xác định");
        }
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-900">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-125 h-75 bg-purple-500 opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-75 h-75 bg-pink-500 opacity-15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 shadow-2xl shadow-black/50 text-center">
          {/* LOADING */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Đang xác thực...
                </h2>
                <p className="text-gray-400 text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Xác thực thành công!
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {oldTabFound ? (
                <div className="w-full py-4 px-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-green-400 text-sm font-semibold mb-1">
                    ✅ Tab đăng nhập đã được cập nhật!
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Quay lại tab trước để tiếp tục. Bạn có thể đóng tab này.
                  </p>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-[0.98] transition"
                >
                  Đăng nhập ngay →
                </Link>
              )}

              <button
                onClick={() => window.close()}
                className="text-xs text-gray-500 hover:text-gray-400 transition underline underline-offset-2"
              >
                Đóng tab này
              </button>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Xác thực thất bại
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="w-full py-3 px-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-left">
                <p className="text-yellow-400/80 text-xs font-semibold mb-1 uppercase tracking-wider">
                  Lưu ý
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Link xác thực chỉ có hiệu lực trong{" "}
                  <strong className="text-white">15 phút</strong>. Nếu hết hạn,
                  hãy đăng ký lại để nhận email mới.
                </p>
              </div>

              <Link
                to="/register"
                className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-[0.98] transition"
              >
                Đăng ký lại
              </Link>

              <Link
                to="/login"
                className="text-xs text-gray-500 hover:text-gray-400 transition underline underline-offset-2"
              >
                Quay về đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
