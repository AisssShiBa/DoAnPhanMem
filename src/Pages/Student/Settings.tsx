import { useState } from "react";
import {
  User,
  Moon,
  Globe,
  Bell,
  Save,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

export default function Settings() {
  const [name, setName] = useState("Nguyễn Văn A");
  const [darkMode, setDarkMode] = useState(false);
  const [timezone, setTimezone] = useState("(GMT+07:00) Asia/Ho_Chi_Minh");
  const [notifyRemind, setNotifyRemind] = useState(true); // REMIND_QD1
  const [remindBefore, setRemindBefore] = useState("1"); // số ngày
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Ở đây sẽ gọi API lưu cài đặt
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setName("Nguyễn Văn A");
    setDarkMode(false);
    setTimezone("(GMT+07:00) Asia/Ho_Chi_Minh");
    setNotifyRemind(true);
    setRemindBefore("1");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt ứng dụng</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tùy chỉnh hồ sơ và giao diện của bạn
        </p>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Hồ sơ cá nhân */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User size={16} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Hồ sơ cá nhân</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Email trường học
              </label>
              <input
                type="email"
                value="sv@truong.edu.vn"
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email do nhà trường cấp, không thể thay đổi.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Mã sinh viên
              </label>
              <input
                type="text"
                value="SV_BM1"
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Giao diện */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Moon size={16} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">
              Giao diện & Hệ thống
            </h3>
          </div>

          <div className="space-y-4">
            {/* Dark mode */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700 text-sm">
                  Chế độ tối (Dark Mode)
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chuyển đổi giao diện sáng / tối
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  darkMode ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    darkMode ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Timezone */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700 text-sm">
                  Múi giờ
                </span>
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>(GMT+07:00) Asia/Ho_Chi_Minh</option>
                <option>(GMT+00:00) London</option>
                <option>(GMT+08:00) Asia/Singapore</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cài đặt nhắc nhở — REMIND_QD1 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell size={16} className="text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-700">
              Nhắc nhở Deadline (REMIND_QD1)
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700 text-sm">
                  Bật thông báo nhắc nhở
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hệ thống sẽ cảnh báo khi deadline sắp đến
                </p>
              </div>
              <button
                onClick={() => setNotifyRemind(!notifyRemind)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  notifyRemind ? "bg-orange-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    notifyRemind ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {notifyRemind && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <span className="text-sm text-gray-700 font-medium">
                  Nhắc trước
                </span>
                <select
                  value={remindBefore}
                  onChange={(e) => setRemindBefore(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="1">1 ngày</option>
                  <option value="2">2 ngày</option>
                  <option value="3">3 ngày</option>
                  <option value="7">1 tuần</option>
                </select>
                <span className="text-sm text-gray-500">trước deadline</span>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="flex items-center px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            <RotateCcw size={15} className="mr-1.5" />
            Đặt lại
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
              saved
                ? "bg-green-500 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle size={15} className="mr-1.5" />
                Đã lưu!
              </>
            ) : (
              <>
                <Save size={15} className="mr-1.5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
