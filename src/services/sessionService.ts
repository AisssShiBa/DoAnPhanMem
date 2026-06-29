/**
 * ============================================================
 * services/sessionService.ts – Giao tiếp với API Quản lý Phiên đăng nhập
 * ============================================================
 *
 * "Phiên đăng nhập" (Session) = Một lần đăng nhập từ một thiết bị.
 *
 * Mỗi lần user đăng nhập thành công → Backend tạo 1 record trong bảng refresh_tokens:
 *   {
 *     user_id: 1,
 *     token: "eyJ...",         ← Refresh Token JWT
 *     device_info: "Chrome 125 · Windows 10",  ← Parse từ User-Agent header
 *     ip_address: "192.168.1.100",
 *     created_at: "2026-06-27 08:00",
 *     expires_at: "2026-06-28 08:00"   ← hoặc +30 ngày nếu rememberMe
 *   }
 *
 * User có thể:
 *  - Xem danh sách tất cả thiết bị đang đăng nhập
 *  - Thu hồi (revoke) một phiên cụ thể (ví dụ: mất điện thoại)
 *  - Đăng xuất khỏi TẤT CẢ thiết bị cùng lúc
 *
 * Tại sao tính năng này quan trọng về bảo mật?
 *  → Giống tính năng "Phiên đăng nhập" của Gmail, Facebook
 *  → Phát hiện đăng nhập lạ từ IP/thiết bị không quen
 *  → Thu hồi ngay khi thiết bị bị mất hoặc tài khoản bị xâm nhập
 *
 * Tất cả request đều có Bearer token tự động (nhờ axios interceptor)
 * → Backend biết user nào đang gọi → chỉ trả sessions của user đó
 */

import api from "../lib/axios";

export const sessionService = {
  /**
   * LẤY DANH SÁCH tất cả phiên đăng nhập còn hiệu lực của user hiện tại.
   *
   * Backend xử lý:
   *  1. Lấy userId từ JWT token trong header (req.user.id)
   *  2. Query DB: Tất cả refresh_tokens của userId này có expires_at > now()
   *  3. So sánh mỗi token với cookie hiện tại → đánh dấu is_current
   *
   * Response: [{ id, device_info, ip_address, created_at, expires_at, is_current }]
   *  is_current = true → Phiên đang dùng ngay lúc này (không cho revoke phiên này)
   */
  getSessions: () => api.get("/auth/sessions"),

  /**
   * THU HỒI một phiên đăng nhập cụ thể (theo ID).
   *
   * Hệ quả: Refresh token bị xóa khỏi DB
   *  → Thiết bị đó không thể refresh → Access token hết hạn là logout luôn
   *  → User trên thiết bị đó sẽ thấy trang đăng nhập khi access token hết hạn (15 phút)
   *
   * Backend bảo vệ IDOR attack:
   *  → Kiểm tra: session.user_id === req.user.id trước khi xóa
   *  → Tránh user A xóa session của user B bằng cách đoán ID
   *
   * @param id - ID của phiên cần thu hồi (UUID string từ bảng refresh_tokens)
   */
  revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),

  /**
   * ĐĂNG XUẤT KHỎI TẤT CẢ thiết bị.
   *
   * Backend xử lý:
   *  1. Lấy userId từ token
   *  2. Xóa TẤT CẢ refresh_tokens của userId này trong DB
   *  3. Clear Cookie của request hiện tại
   *
   * Hệ quả: Toàn bộ thiết bị đang đăng nhập sẽ bị đăng xuất khi
   * access token hết hạn (tối đa 15 phút) vì không còn refresh token nào hoạt động.
   *
   * Dùng khi: Nghi ngờ tài khoản bị xâm nhập → "Đăng xuất tất cả rồi đổi mật khẩu"
   */
  logoutAll: () => api.post("/auth/logout-all"),
};
