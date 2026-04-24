import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen text-white p-8 md:p-16 max-w-5xl mx-auto">
      {/* Tiêu đề chính */}
      <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        ĐIỀU KHOẢN DỊCH VỤ CỦA SOFTWHERE
      </h1>

      <div className="text-gray-300 space-y-8 leading-relaxed">
        <div>
          <p className="italic text-sm text-gray-500">
            Cập nhật lần cuối: Ngày 24 tháng 04 năm 2026
          </p>
          <p className="mt-4">
            Chào mừng bạn đến với SoftWhere - Nền tảng quản lý học tập thông
            minh. Các Điều khoản dịch vụ này ("Điều khoản") quy định các quy tắc
            và hướng dẫn về việc sử dụng nền tảng, ứng dụng và dịch vụ của chúng
            tôi ("Dịch vụ").
          </p>
          <p className="mt-2">
            Bằng việc truy cập, đăng ký hoặc sử dụng SoftWhere, bạn đồng ý tuân
            thủ và bị ràng buộc bởi các Điều khoản này. Nếu bạn không đồng ý với
            bất kỳ phần nào của Điều khoản, vui lòng ngừng sử dụng Dịch vụ của
            chúng tôi.
          </p>
        </div>

        {/* Điều 1 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 1. ĐIỀU KIỆN SỬ DỤNG VÀ TÀI KHOẢN
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-indigo-300">Đăng ký tài khoản:</strong> Để
              sử dụng các tính năng quản lý công việc (TaskList), Lịch học và
              Pomodoro, bạn cần tạo một tài khoản hợp lệ. Bạn cam kết cung cấp
              thông tin chính xác và chịu trách nhiệm cập nhật thông tin này.
            </li>
            <li>
              <strong className="text-indigo-300">Bảo mật tài khoản:</strong>{" "}
              Bạn hoàn toàn chịu trách nhiệm bảo mật thông tin đăng nhập của
              mình. SoftWhere sẽ không chịu trách nhiệm đối với bất kỳ tổn thất
              nào phát sinh từ việc tài khoản của bạn bị truy cập trái phép do
              sự sơ suất của bạn.
            </li>
            <li>
              <strong className="text-indigo-300">Quyền can thiệp:</strong> Quản
              trị viên (Admin) của SoftWhere có quyền đình chỉ, khóa tài khoản
              hoặc yêu cầu đặt lại mật khẩu nếu phát hiện hành vi vi phạm các
              điều khoản hoặc dấu hiệu bất thường đe dọa an toàn hệ thống.
            </li>
          </ul>
        </section>

        {/* Điều 2 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 2. QUY ĐỊNH VỀ HÀNH VI NGƯỜI DÙNG
          </h2>
          <p className="mb-3">
            Khi sử dụng SoftWhere để quản lý học tập, bạn đồng ý{" "}
            <strong className="text-red-400">KHÔNG</strong> thực hiện các hành
            vi sau:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Sử dụng nền tảng cho bất kỳ mục đích bất hợp pháp, gian lận hoặc
              trái với đạo đức xã hội.
            </li>
            <li>
              Can thiệp, phá hoại hoặc làm quá tải hệ thống máy chủ (CPU, RAM,
              Disk), ảnh hưởng đến trải nghiệm của người dùng khác.
            </li>
            <li>
              Cố gắng truy cập trái phép vào các phân hệ quản trị (Admin
              Dashboard) hoặc tài khoản của sinh viên khác.
            </li>
            <li>
              Tạo nội dung độc hại, chứa virus hoặc phần mềm mã độc trên hệ
              thống.
            </li>
          </ol>
        </section>

        {/* Điều 3 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 3. SỞ HỮU TRÍ TUỆ
          </h2>
          <p>
            Tất cả các tài sản trí tuệ liên quan đến SoftWhere, bao gồm nhưng
            không giới hạn ở mã nguồn, giao diện, logo, biểu tượng, thiết kế
            (bao gồm cả các thành phần UI bằng Tailwind CSS và React) đều thuộc
            quyền sở hữu của SoftWhere. Bạn không được phép sao chép, chỉnh sửa,
            phân phối hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý
            bằng văn bản từ chúng tôi.
          </p>
        </section>

        {/* Điều 4 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 4. GIỚI HẠN TRÁCH NHIỆM
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              SoftWhere cung cấp nền tảng với mục tiêu giúp sinh viên "Học
              smarter, không harder", tuy nhiên chúng tôi không đảm bảo tuyệt
              đối về kết quả học tập của bạn khi sử dụng nền tảng này.
            </li>
            <li>
              Mặc dù có hệ thống System Backup định kỳ, SoftWhere không chịu
              trách nhiệm pháp lý cho các tổn thất hoặc thiệt hại gián tiếp liên
              quan đến việc mất mát dữ liệu do các sự cố bất khả kháng (thiên
              tai, sự cố mạng diện rộng, v.v.).
            </li>
          </ul>
        </section>

        {/* Điều 5 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
            ĐIỀU 5. SỬA ĐỔI ĐIỀU KHOẢN
          </h2>
          <p>
            SoftWhere bảo lưu quyền cập nhật hoặc thay đổi các Điều khoản dịch
            vụ này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được
            đăng tải trên trang này. Việc bạn tiếp tục sử dụng Dịch vụ sau khi
            có thông báo về sự thay đổi đồng nghĩa với việc bạn chấp nhận các
            Điều khoản đã được chỉnh sửa.
          </p>
        </section>
      </div>
    </div>
  );
}
