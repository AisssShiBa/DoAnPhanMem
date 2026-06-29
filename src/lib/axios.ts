/**
 * ============================================================
 * lib/axios.ts – Cấu hình Axios cho toàn bộ ứng dụng
 * ============================================================
 *
 * File này làm 3 việc chính:
 *  1. Tạo một instance Axios dùng chung (thay vì import axios gốc ở mọi nơi)
 *  2. Request Interceptor: Tự động gắn Access Token vào header trước khi gửi
 *  3. Response Interceptor: Tự động refresh token khi nhận lỗi 401 (Unauthorized)
 *
 * Tại sao cần file này?
 *  → Không cần gắn token thủ công ở từng component/service
 *  → Refresh token tự động, người dùng không bị đăng xuất bất ngờ
 *  → Xử lý lỗi xác thực ở một chỗ duy nhất (DRY principle)
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Đọc URL backend từ biến môi trường (.env), fallback về localhost khi dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Tạo một "instance" Axios riêng cho project.
 * Lý do không dùng axios gốc (import axios from 'axios'):
 *  → Instance này đã cấu hình sẵn baseURL và headers
 *  → Các interceptor sẽ chỉ áp dụng cho instance này, không ảnh hưởng axios gốc
 *  → withCredentials: true → cho phép gửi Cookie cùng request (cần cho refresh token)
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // QUAN TRỌNG: withCredentials = true mới gửi được HttpOnly Cookie (chứa refresh token)
  // Nếu false, cookie sẽ không được gửi → refresh token không hoạt động
  withCredentials: true,
});

// ============================================================
// CẤU TRÚC DỮ LIỆU HỖ TRỢ HÀNG ĐỢI (QUEUE)
// ============================================================

/**
 * Kiểu dữ liệu cho một request đang chờ refresh token.
 * Mỗi request thất bại (401) sẽ tạo một Promise và lưu cặp resolve/reject vào đây.
 * Khi refresh thành công → gọi resolve(token) để thử lại request.
 * Khi refresh thất bại → gọi reject(error) để báo lỗi.
 */
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

/**
 * Mở rộng kiểu config của Axios để thêm cờ _retry.
 * _retry = true nghĩa là request này đã được thử lại 1 lần rồi
 * → Tránh vòng lặp vô hạn: thử lại → 401 → thử lại → 401...
 */
type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

/**
 * Cờ kiểm soát: đang trong quá trình refresh token không?
 * Mục đích: Đảm bảo chỉ CÓ 1 lần gọi /auth/refresh dù có nhiều request cùng bị 401.
 *
 * Ví dụ không có cờ này:
 *   Request A → 401 → gọi /auth/refresh
 *   Request B → 401 → gọi /auth/refresh (cùng lúc → lỗi!)
 *   Request C → 401 → gọi /auth/refresh (cùng lúc → lỗi!)
 */
let isRefreshing = false;

/**
 * Hàng đợi (queue) chứa các request đang chờ refresh token hoàn thành.
 * Khi isRefreshing = true, các request bị 401 sẽ vào hàng đợi này thay vì tự gọi refresh.
 */
let failedQueue: FailedRequest[] = [];

/**
 * Xử lý toàn bộ hàng đợi sau khi refresh token kết thúc (thành công hoặc thất bại).
 *
 * @param error - null nếu refresh thành công, Error nếu thất bại
 * @param token - access token mới nếu thành công, null nếu thất bại
 *
 * Luồng:
 *  Refresh OK  → processQueue(null, "newToken123") → Tất cả request trong queue được thử lại
 *  Refresh lỗi → processQueue(err, null)           → Tất cả request trong queue bị reject
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = []; // Xóa hàng đợi sau khi xử lý xong
};

// ============================================================
// INTERCEPTOR 1: REQUEST – Gắn token trước khi gửi
// ============================================================

/**
 * Interceptor này chạy TRƯỚC KHI mỗi request được gửi đi.
 * Nhiệm vụ: Lấy token từ localStorage và gắn vào header Authorization.
 *
 * Tại sao đọc từ localStorage thay vì từ store Zustand?
 *  → Interceptor được khởi tạo 1 lần khi app load, nếu đọc từ store
 *    sẽ bị "đóng gói" giá trị tại thời điểm đó (closure problem)
 *  → localStorage luôn trả về giá trị MỚI NHẤT mỗi lần đọc
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Format chuẩn: "Bearer <token>"
    // Backend đọc: req.headers.authorization.split(" ")[1]
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// INTERCEPTOR 2: RESPONSE – Xử lý token mới & lỗi 401
// ============================================================

api.interceptors.response.use(
  /**
   * Handler cho response THÀNH CÔNG (status 2xx)
   * Kiểm tra xem backend có gửi token mới trong header không.
   *
   * Cơ chế "Silent Refresh" từ backend:
   *  Khi access token hết hạn nhưng refresh token còn hạn,
   *  backend tự tạo access token mới và gắn vào header "x-access-token".
   *  Frontend chỉ cần nhặt lên và lưu vào localStorage.
   *  → Người dùng KHÔNG BIẾT gì đã xảy ra, UX liền mạch
   */
  (response) => {
    const refreshedToken = response.headers["x-access-token"];
    if (typeof refreshedToken === "string") {
      // Backend vừa cấp token mới → cập nhật localStorage
      localStorage.setItem("token", refreshedToken);
    }
    return response;
  },

  /**
   * Handler cho response LỖI (status 4xx, 5xx)
   * Xử lý riêng trường hợp 401 (Unauthorized) → thử refresh token
   */
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    /**
     * Danh sách endpoint AUTH không được áp dụng logic refresh.
     * Tại sao?
     *  → /auth/signin: Đang đăng nhập, chưa có token → refresh vô nghĩa
     *  → /auth/signup: Đang tạo tài khoản, chưa có token
     *  → /auth/refresh: NẾU refresh gọi refresh → vòng lặp vô hạn!
     *  → /auth/logout: Đang đăng xuất, không cần refresh
     */
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/signin") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/logout");

    /**
     * Điều kiện để thử refresh token:
     *  1. Lỗi là 401 Unauthorized (token hết hạn hoặc không hợp lệ)
     *  2. Chưa thử lại lần nào (_retry chưa được set = true)
     *  3. Không phải endpoint auth (tránh vòng lặp)
     */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      /**
       * Trường hợp: Đang có request khác đang refresh token rồi.
       * → Không gọi refresh thêm nữa, vào hàng đợi chờ kết quả.
       * → Khi processQueue được gọi, Promise này sẽ được resolve/reject
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              // Gắn token mới vào request rồi gửi lại
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      // Đánh dấu request này đã được thử lại (tránh retry loop)
      originalRequest._retry = true;
      // Báo hiệu cho các request khác: đang refresh, vào hàng đợi đi
      isRefreshing = true;

      try {
        /**
         * Gọi endpoint refresh token.
         * Backend sẽ đọc refresh token từ HttpOnly Cookie (gửi tự động nhờ withCredentials: true)
         * và trả về access token mới.
         */
        const res = await api.post("/auth/refresh");
        const newToken = res.data.token;

        // Lưu token mới vào localStorage để request interceptor dùng
        localStorage.setItem("token", newToken);

        // Thông báo cho tất cả request đang chờ: có token mới rồi, thử lại đi
        processQueue(null, newToken);

        // Thử lại request BAN ĐẦU (request đã bị 401) với token mới
        originalRequest.headers.Authorization = "Bearer " + newToken;
        return api(originalRequest);

      } catch (err) {
        // Refresh token cũng hết hạn hoặc không hợp lệ → phải đăng xuất
        processQueue(err, null); // Báo lỗi cho tất cả request đang chờ

        // Xóa access token cũ khỏi localStorage
        localStorage.removeItem("token");

        /**
         * Phát ra sự kiện "auth:logout" để App.tsx biết cần đăng xuất.
         * Tại sao dùng CustomEvent thay vì gọi store trực tiếp?
         *  → Interceptor được khởi tạo ngoài React component tree
         *  → Không thể gọi hooks (useAuthStore) ở đây
         *  → CustomEvent là cách để "nói chuyện" với React từ ngoài vào
         *
         * App.tsx lắng nghe: window.addEventListener("auth:logout", handler)
         */
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(err);

      } finally {
        // Dù thành công hay thất bại, reset cờ để lần sau có thể refresh lại
        isRefreshing = false;
      }
    }

    // Lỗi khác không phải 401, hoặc đã retry rồi → trả lỗi về cho caller
    return Promise.reject(error);
  },
);

// Export instance để dùng trong toàn bộ app
// import api from "../lib/axios" thay vì import axios from "axios"
export default api;
