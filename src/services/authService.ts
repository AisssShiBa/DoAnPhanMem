/**
 * ============================================================
 * services/authService.ts – Lớp giao tiếp với Backend Auth API
 * ============================================================
 *
 * File này tập trung tất cả các hàm gọi API liên quan đến xác thực.
 *
 * Tại sao tách ra thành service riêng (thay vì gọi api.post trực tiếp trong component)?
 *  → Separation of Concerns: Component chỉ lo UI, service lo gọi API
 *  → Tái sử dụng: Nhiều component có thể dùng chung authService.signin()
 *  → Dễ test: Mock authService trong unit test thay vì mock Axios
 *  → Dễ thay đổi: Nếu đổi endpoint, chỉ sửa ở đây, không ảnh hưởng component
 *
 * Tất cả hàm đều dùng instance `api` từ lib/axios.ts (không phải axios gốc)
 * → Tự động có interceptor gắn token và xử lý 401
 */

import api from "../lib/axios";

/* ============================================================
   TYPES – Định nghĩa kiểu dữ liệu cho request và response
   ============================================================ */

/**
 * Thông tin User nhận từ server.
 * Chú ý: Không có password_hash (server không trả về thông tin nhạy cảm)
 */
export interface User {
  id: number;
  full_name: string;
  email: string;
  provider: string;  // "email" | "google" – biết user đăng ký bằng cách nào
  status: string;    // "ACTIVE" | "PENDING" | "BANNED"
  role: string;      // "USER" | "ADMIN" – dùng cho phân quyền
}

/** Dữ liệu form đăng ký gửi lên server */
export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string; // Server cũng validate khớp mật khẩu (không chỉ client)
}

/** Dữ liệu form đăng nhập */
export interface SigninData {
  email: string;
  password: string;
  rememberMe?: boolean; // true → Refresh token sống 30 ngày, false → 1 ngày
}

/* ============================================================
   AUTH SERVICE – Các hàm gọi API
   ============================================================ */

export const authService = {

  /**
   * ĐĂNG KÝ tài khoản mới.
   *
   * Luồng backend sau khi nhận request:
   *  1. Validate dữ liệu với Zod schema
   *  2. Kiểm tra email đã tồn tại chưa
   *  3. Hash mật khẩu với bcrypt (cost factor 10)
   *  4. Tạo JWT verify token (hết hạn sau 15 phút)
   *  5. Lưu user với status = "PENDING" (chưa kích hoạt)
   *  6. Gửi email xác minh qua Resend API
   *
   * Frontend xử lý sau khi thành công:
   *  → Hiện màn hình "Kiểm tra email", không navigate ngay
   *
   * @returns { message: string } – Thông báo thành công
   */
  signup: async (data: SignupData): Promise<{ message: string }> => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },

  /**
   * ĐĂNG NHẬP bằng email và mật khẩu.
   *
   * Luồng backend:
   *  1. Validate với Zod
   *  2. Tìm user theo email
   *  3. Kiểm tra: provider !== "google" (tránh đăng nhập sai phương thức)
   *  4. Kiểm tra: status === "ACTIVE" (phải verify email trước)
   *  5. bcrypt.compare(password, password_hash) để kiểm tra mật khẩu
   *  6. Tạo Access Token (15 phút) + Refresh Token (1 hoặc 30 ngày)
   *  7. Lưu Refresh Token vào DB (bảng refresh_tokens)
   *  8. Set Refresh Token vào HttpOnly Cookie
   *  9. Trả về Access Token + thông tin user trong body response
   *
   * @returns { token, user, message }
   *   token → Access Token (lưu vào localStorage)
   *   user  → Thông tin user (lưu vào Zustand store)
   */
  signin: async (
    data: SigninData,
  ): Promise<{
    token: string;
    user: User;
    message: string;
  }> => {
    const res = await api.post("/auth/signin", data);
    return res.data;
  },

  /**
   * LẤY THÔNG TIN USER từ token hiện tại.
   *
   * Dùng khi:
   *  - Google OAuth callback: Có token nhưng chưa có thông tin user đầy đủ
   *  - Sau khi refresh token: Cập nhật lại thông tin user
   *  - Khi muốn đồng bộ thông tin user với server
   *
   * Request này có Bearer token trong header (nhờ axios interceptor).
   * Backend decode token → lấy id → query DB → trả về user.
   *
   * @returns { user: User }
   */
  getProfile: async (): Promise<{
    user: User;
  }> => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  /**
   * LÀM MỚI ACCESS TOKEN bằng Refresh Token.
   *
   * Refresh Token nằm trong HttpOnly Cookie → browser tự gửi kèm request.
   * Frontend không cần (và không thể) đọc refresh token thủ công.
   *
   * Backend xử lý:
   *  1. Đọc refreshToken từ cookie
   *  2. Verify JWT với REFRESH_SECRET
   *  3. Kiểm tra token còn trong DB không (đảm bảo chưa bị revoke)
   *  4. Tạo access token mới
   *  5. Rotate refresh token (cập nhật token mới trong DB, giữ nguyên expires_at)
   *
   * Tại sao rotate refresh token?
   *  → Mỗi lần refresh → refresh token mới → token cũ vô hiệu
   *  → Nếu hacker copy refresh token cũ → không dùng được nữa
   *
   * @returns { token, user }
   */
  refresh: async (): Promise<{
    token: string;
    user: User;
  }> => {
    const res = await api.post("/auth/refresh");
    return res.data;
  },

  /**
   * XÁC MINH EMAIL bằng token trong link email.
   *
   * Token trong URL: /verify-email?token=eyJ...
   * Axios tự encode đúng khi truyền qua params (không bị lỗi ký tự đặc biệt)
   *
   * Backend xử lý:
   *  1. Decode token từ query param
   *  2. Tìm user có verify_token khớp trong DB
   *  3. Kiểm tra verify_expires (hết hạn sau 15 phút kể từ đăng ký)
   *  4. Cập nhật: status = "ACTIVE", verify_token = null, verify_expires = null
   *
   * @param token - Token từ URL (đã được encodeURIComponent bởi backend)
   * @returns { message: string }
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    // params: { token } → Axios tự build: /auth/verify-email?token=xxx
    // Axios tự encode đúng cách, không bị lỗi ký tự + hay /
    const res = await api.get("/auth/verify-email", { params: { token } });
    return res.data;
  },

  /**
   * ĐĂNG NHẬP BẰNG GOOGLE.
   *
   * Đây là redirect, không phải API call thông thường!
   *
   * Luồng OAuth 2.0:
   *  1. Frontend redirect browser đến /api/auth/google
   *  2. Backend dùng Passport.js redirect đến Google OAuth consent screen
   *  3. User đăng nhập Google → chọn tài khoản → cho phép
   *  4. Google redirect về /api/auth/google/callback với authorization code
   *  5. Backend exchange code → lấy profile → tìm/tạo user → tạo tokens
   *  6. Backend redirect về frontend: /auth/callback?token=<accessToken>
   *  7. GoogleCallback.tsx nhận token → lưu vào store → navigate dashboard
   *
   * Tại sao dùng window.location.href thay vì axios?
   *  → OAuth là flow dựa trên browser redirect, không phải JSON API
   *  → axios.get chỉ fetch nội dung, không thực hiện browser redirect
   *  → window.location.href thay đổi URL thật của browser → OAuth flow hoạt động
   */
  loginWithGoogle: () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    // Redirect toàn bộ trang đến endpoint Google OAuth của backend
    window.location.href = `${apiUrl}/auth/google`;
  },

  /**
   * ĐĂNG XUẤT.
   *
   * Luồng:
   *  1. Gọi /auth/logout → Backend xóa refresh token khỏi DB và clear Cookie
   *  2. Xóa access token khỏi localStorage
   *
   * Tại sao dùng try/catch trống?
   *  → Nếu mạng mất / server lỗi → vẫn phải logout phía client
   *  → Quan trọng là xóa localStorage, không quan trọng server có nhận được không
   *  → Worst case: Cookie còn trên browser nhưng không dùng được vì refresh token đã bị xóa DB
   */
  logout: async () => {
    try {
      await api.post("/auth/logout");
      // eslint-disable-next-line no-empty
    } catch {
      // Bỏ qua lỗi network khi logout – vẫn phải xóa token phía client
    }
    localStorage.removeItem("token");
  },
};
