import React from "react";

export default function Support() {
  return (
    <div className="min-h-screen text-white p-8 md:p-16 max-w-5xl mx-auto">
      {/* Tiêu đề chính */}
      <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        TRUNG TÂM HỖ TRỢ SOFTWHERE
      </h1>

      <div className="text-gray-300 space-y-10 mt-8 leading-relaxed">
        <p className="text-lg">
          Xin chào! Đội ngũ phát triển SoftWhere luôn sẵn sàng lắng nghe và hỗ
          trợ bạn để quá trình "Học smarter, không harder" diễn ra mượt mà nhất.
          Dưới đây là các kênh hỗ trợ và giải đáp thắc mắc.
        </p>

        {/* Phần 1: Câu hỏi thường gặp */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            1. CÂU HỎI THƯỜNG GẶP (FAQ)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Box FAQ 1 */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-indigo-400/50 transition">
              <h3 className="font-bold text-indigo-300 mb-2">
                Làm thế nào để dùng Pomodoro?
              </h3>
              <p className="text-sm text-gray-400">
                Truy cập vào Bảng điều khiển (Dashboard), thiết lập thời gian
                (mặc định 25 phút) và bấm "Bắt đầu". Hệ thống sẽ tự động đếm
                ngược và ghi nhận thời gian tập trung của bạn.
              </p>
            </div>

            {/* Box FAQ 2 */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-indigo-400/50 transition">
              <h3 className="font-bold text-indigo-300 mb-2">
                Tôi quên mật khẩu, phải làm sao?
              </h3>
              <p className="text-sm text-gray-400">
                Bạn có thể liên hệ trực tiếp với Quản trị viên (Admin) của hệ
                thống. Admin có quyền cấp lại hoặc reset mật khẩu cho tài khoản
                sinh viên của bạn một cách nhanh chóng.
              </p>
            </div>

            {/* Box FAQ 3 */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-indigo-400/50 transition">
              <h3 className="font-bold text-indigo-300 mb-2">
                Tôi có thể đổi giao diện Sáng/Tối ở đâu?
              </h3>
              <p className="text-sm text-gray-400">
                Bạn hãy vào mục Cài đặt (Settings) trên thanh menu. Tại đây bạn
                có thể tùy chỉnh giao diện Sáng/Tối cũng như cập nhật múi giờ và
                hồ sơ cá nhân.
              </p>
            </div>
          </div>
        </section>

        {/* Phần 2: Kênh liên hệ */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            2. KÊNH LIÊN HỆ TRỰC TIẾP
          </h2>
          <ul className="list-none space-y-4 mt-4">
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-white font-medium">Email Hỗ Trợ</p>
                <p className="text-indigo-400">support@softwhere.edu.vn</p>
              </div>
            </li>
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-white font-medium">
                  Hotline (8:00 - 17:00, T2-T6)
                </p>
                <p className="text-indigo-400">1900 9999</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Phần 3: Báo lỗi & Góp ý */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            3. BÁO CÁO LỖI & GÓP Ý
          </h2>
          <p className="mb-4">
            Nếu bạn phát hiện lỗi hệ thống hoặc có ý tưởng muốn thêm vào dự án
            SoftWhere, đừng ngần ngại gửi mail cho đội ngũ phát triển (Team Dev)
            qua địa chỉ{" "}
            <span className="text-indigo-400 font-bold">
              dev@softwhere.edu.vn
            </span>
            . Mọi đóng góp của bạn đều giúp nền tảng ngày một hoàn thiện hơn!
          </p>
        </section>
      </div>
    </div>
  );
}
