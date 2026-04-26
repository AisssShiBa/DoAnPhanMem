import { useState } from "react";
import { Moon, Globe, Languages, Bell } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifyRemind, setNotifyRemind] = useState(true);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt ứng dụng</h2>

        <p className="text-sm text-gray-500 mt-1">
          Tùy chỉnh hồ sơ và hệ thống của bạn
        </p>
      </div>

      <div className="max-w-auto space-y-6">
        {/* ================= SYSTEM ================= */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {/* Title */}
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Moon size={18} className="text-purple-600" />
            </div>

            <h3 className="font-bold text-gray-800">Giao diện & Hệ thống</h3>
          </div>

          <div className="space-y-5">
            {/* ================= DARK MODE ================= */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-gray-800 block">
                  Chế độ tối (Dark Mode)
                </span>

                <span className="text-xs text-gray-500">
                  Giảm mỏi mắt khi sử dụng ban đêm
                </span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-7 rounded-full relative transition duration-300 ${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition duration-300 ${
                    darkMode ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* ================= THÔNG BÁO ================= */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-gray-400" />

                <div>
                  <span className="text-sm font-medium text-gray-700 block">
                    Nhắc nhở công việc
                  </span>

                  <span className="text-xs text-gray-500">
                    Bật / tắt thông báo deadline
                  </span>
                </div>
              </div>

              <button
                onClick={() => setNotifyRemind(!notifyRemind)}
                className={`w-14 h-7 rounded-full relative transition duration-300 ${
                  notifyRemind ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition duration-300 ${
                    notifyRemind ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* ================= NGÔN NGỮ ================= */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Languages size={18} className="text-gray-400" />

                <span className="text-sm font-medium text-gray-700">
                  Ngôn ngữ
                </span>
              </div>

              <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-b outline-none focus:border-blue-500 bg-gray-50">
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>
            </div>

            {/* ================= MÚI GIỜ ================= */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-gray-400" />

                <span className="text-sm font-medium text-gray-700">
                  Múi giờ
                </span>
              </div>

              <select className="px-4 py-2 border border-gray-200 text-black rounded-xl text-sm outline-none focus:border-blue-500 bg-gray-50">
                <option>Asia/Ho_Chi_Minh (GMT+7)</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
