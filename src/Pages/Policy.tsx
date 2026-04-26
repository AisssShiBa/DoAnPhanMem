export default function Policy() {
  return (
    <div className="min-h-screen text-white p-8 md:p-16 max-w-5xl mx-auto">
      {/* Tiêu đề chính */}
      <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
        CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ QUYỀN RIÊNG TƯ
      </h1>

      <div className="text-gray-300 space-y-8 leading-relaxed">
        <div>
          <p className="italic text-sm text-gray-500">
            Cập nhật lần cuối: Ngày 23 tháng 04 năm 2026
          </p>
          <p className="mt-4">
            Chào mừng Quý người dùng đến với Nền tảng Quản lý Học tập SoftWhere
            ("Nền tảng"). Ban Quản trị SoftWhere hiểu rằng quyền riêng tư và bảo
            mật dữ liệu cá nhân là vô cùng quan trọng. Chính sách Bảo mật này
            được lập ra nhằm minh bạch hóa cách thức chúng tôi thu thập, sử
            dụng, lưu trữ và bảo vệ thông tin của Người dùng trong quá trình vận
            hành Nền tảng.
          </p>
          <p className="mt-2">
            Bằng việc đăng ký tài khoản và tiếp tục sử dụng các dịch vụ của Nền
            tảng, Người dùng xác nhận đã đọc, hiểu và đồng ý toàn bộ với các
            điều khoản được quy định dưới đây.
          </p>
        </div>

        {/* Điều 1 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 1. PHẠM VI VÀ LOẠI HÌNH DỮ LIỆU THU THẬP
          </h2>
          <p className="mb-3">
            Trong quá trình cung cấp dịch vụ quản lý học tập, SoftWhere sẽ tiến
            hành thu thập các hạng mục dữ liệu sau từ phía Người dùng:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-indigo-300">
                Dữ liệu Định danh và Tài khoản:
              </strong>{" "}
              Thông tin đăng nhập, hồ sơ cá nhân, và các cài đặt cá nhân hóa.
            </li>
            <li>
              <strong className="text-indigo-300">
                Dữ liệu Học tập và Lịch trình:
              </strong>{" "}
              Toàn bộ thông tin được Người dùng khởi tạo bao gồm Lịch học, các
              đầu việc (TaskList), và dữ liệu tập trung Pomodoro.
            </li>
            <li>
              <strong className="text-indigo-300">Dữ liệu Hệ thống:</strong>{" "}
              Quản trị viên thu thập dữ liệu ẩn danh liên quan đến lưu lượng
              truy cập (DAU, MAU) và hiệu suất máy chủ.
            </li>
          </ul>
        </section>

        {/* Điều 2 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 2. MỤC ĐÍCH SỬ DỤNG DỮ LIỆU
          </h2>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong className="text-white">
                Cá nhân hóa trải nghiệm (Dành cho Sinh viên):
              </strong>{" "}
              Hệ thống sử dụng dữ liệu để hiển thị trực quan các thống kê tiến
              độ trên Dashboard cá nhân.
            </li>
            <li>
              <strong className="text-white">
                Đảm bảo chất lượng dịch vụ (Dành cho Quản trị viên):
              </strong>{" "}
              Theo dõi sức khỏe máy chủ (CPU, RAM, Disk) để đảm bảo hệ thống vận
              hành ổn định.
            </li>
          </ol>
        </section>

        {/* Điều 3 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 3. CAM KẾT BẢO MẬT VÀ LƯU TRỮ
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong className="text-indigo-300">Hệ thống sao lưu:</strong>{" "}
              Toàn bộ dữ liệu được quản lý thông qua phân hệ System Backup, thực
              hiện tự động và thủ công để đảm bảo an toàn tuyệt đối.
            </li>
            <li>
              <strong className="text-indigo-300">
                Nguyên tắc không chia sẻ:
              </strong>{" "}
              SoftWhere cam kết tuyệt đối không mua bán hoặc cung cấp dữ liệu cá
              nhân của Người dùng cho bất kỳ bên thứ ba nào vì mục đích thương
              mại.
            </li>
          </ul>
        </section>

        {/* Điều 4 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 4. QUYỀN VÀ TRÁCH NHIỆM CỦA NGƯỜI DÙNG
          </h2>
          <div className="space-y-4">
            <p>
              Người dùng có toàn quyền truy cập, chỉnh sửa thông tin cá nhân
              trong phần <span className="text-indigo-400">Cài đặt</span>. Tuy
              nhiên, Người dùng có nghĩa vụ tự bảo mật mật khẩu. SoftWhere không
              chịu trách nhiệm cho các tổn thất phát sinh do lỗi bảo mật từ phía
              Người dùng.
            </p>
          </div>
        </section>

        {/* Điều 5 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 5. LIÊN HỆ
          </h2>
          <p>
            Mọi thắc mắc hoặc khiếu nại liên quan đến Chính sách Bảo mật, Quý
            người dùng vui lòng liên hệ trực tiếp với Ban Quản trị thông qua
            kênh hỗ trợ chính thức của SoftWhere.
          </p>
        </section>
      </div>
    </div>
  );
}
