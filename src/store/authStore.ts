/**
 * ============================================================
 * store/authStore.ts – Kho lưu trạng thái xác thực (Auth State)
 * ============================================================
 *
 * File này dùng Zustand để quản lý trạng thái đăng nhập toàn ứng dụng.
 *
 * Tại sao dùng Zustand thay vì React Context hoặc Redux?
 *  → Context API: Mỗi khi state thay đổi, re-render TOÀN BỘ component bên trong Provider
 *    → Hiệu năng kém khi auth state dùng ở nhiều nơi trong app
 *  → Redux: Mạnh nhưng cần viết actions, reducers, selectors, store setup... (~200 dòng boilerplate)
 *  → Zustand: Đơn giản (103 dòng cho toàn bộ), chỉ re-render component dùng đúng phần state thay đổi
 *
 * Tại sao dùng middleware `persist`?
 *  → Khi user nhấn F5 (reload trang), toàn bộ React state bị reset về null
 *  → `persist` tự động lưu token + user vào localStorage khi state thay đổi
 *  → Khi app load lại, tự động đọc lại từ localStorage → User vẫn đăng nhập bình thường
 *
 * Luồng quan trọng:
 *  1. Đăng nhập → setAuth(token, user) → lưu vào store + localStorage
 *  2. Reload trang → persist đọc localStorage → khôi phục state
 *  3. Token hết hạn → tryRefreshSession() → gọi /auth/refresh → cập nhật state
 *  4. Đăng xuất → logout() → gọi /auth/logout → xóa state + localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type User } from "../services/authService";

/**
 * Định nghĩa kiểu dữ liệu cho Auth State.
 * TypeScript sẽ báo lỗi ngay nếu quên implement một trong các field/method này.
 */
interface AuthState {
  // ── State (dữ liệu) ──────────────────────────────────────
  user: User | null;       // Thông tin user đang đăng nhập (null nếu chưa đăng nhập)
  token: string | null;    // Access Token JWT (null nếu chưa đăng nhập)
  isLoading: boolean;      // Đang thực hiện thao tác async không? (hiển thị spinner)

  /**
   * Cờ báo hiệu Zustand đã đọc xong localStorage chưa.
   * Mục đích: ProtectedRoute phải chờ flag này = true trước khi kiểm tra token.
   *
   * Vấn đề nếu không có flag này:
   *  t=0ms: Component mount → token = null (Zustand chưa đọc xong localStorage)
   *  t=0ms: ProtectedRoute thấy token = null → redirect về /login ❌ SAI!
   *  t=5ms: Zustand đọc xong → token = "abc..." (thực ra người dùng đang đăng nhập)
   *
   * Giải pháp: ProtectedRoute render null (không làm gì) cho đến khi _hasHydrated = true
   */
  _hasHydrated: boolean;

  // ── Actions (hàm thay đổi state) ─────────────────────────
  setHasHydrated: (v: boolean) => void;

  /**
   * Lưu thông tin đăng nhập vào store.
   * Gọi sau khi: đăng nhập thành công, Google OAuth callback, refresh token thành công
   */
  setAuth: (token: string, user: User) => void;

  /**
   * Đăng xuất: xóa token khỏi localStorage, gọi API backend để xóa refresh token,
   * rồi reset state về null.
   */
  logout: () => Promise<void>;

  /**
   * Lấy thông tin user mới nhất từ server.
   * Dùng khi: User cập nhật profile, cần đồng bộ lại thông tin
   */
  fetchProfile: () => Promise<void>;

  /**
   * Thử làm mới phiên đăng nhập bằng refresh token (trong Cookie).
   * Dùng khi: Trang load lại, access token hết hạn, ProtectedRoute kiểm tra
   *
   * Trả về:
   *  true  → Refresh thành công, phiên đăng nhập được gia hạn
   *  false → Refresh thất bại (cookie hết hạn), cần đăng nhập lại
   *
   * Lưu ý: Dùng biến `refreshPromise` để tránh gọi refresh 2 lần cùng lúc
   */
  tryRefreshSession: () => Promise<boolean>;

  /**
   * Kiểm tra xem user hiện tại có đang đăng nhập hợp lệ không.
   * Kiểm tra: có token VÀ token chưa hết hạn (có buffer 30 giây)
   */
  isAuthenticated: () => boolean;
}

/**
 * Hàm kiểm tra JWT token đã hết hạn chưa.
 * Không cần gọi server để kiểm tra – giải mã thủ công payload của JWT.
 *
 * Cấu trúc JWT: header.payload.signature
 *  Ví dụ: eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwIjoxNzE5NDgwMDAwfQ.signature
 *
 * Cách đọc payload:
 *  1. Lấy phần giữa: token.split(".")[1]
 *  2. Decode base64: atob(...)
 *  3. Parse JSON: JSON.parse(...)
 *  4. Đọc field exp (Unix timestamp tính bằng giây)
 *
 * Buffer 30 giây: Tránh edge case token vừa expire ngay lúc request đang truyền
 * (request mất 200ms, token expire giữa chừng → thêm buffer 30s để refresh trước)
 *
 * @param token - JWT token cần kiểm tra
 * @returns true nếu đã hết hạn hoặc không hợp lệ, false nếu còn hạn
 */
const isTokenExpired = (token: string | null) => {
  if (!token) return true; // Không có token → coi như hết hạn
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (!payload.exp) return true; // JWT không có trường exp → không hợp lệ
    // payload.exp là giây, Date.now() là milliseconds → nhân 1000 để so sánh
    // Trừ thêm 30_000ms (30 giây) = buffer an toàn
    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true; // Lỗi khi decode → token không hợp lệ
  }
};

/**
 * Biến lưu Promise của lần refresh đang chạy.
 * Mục đích: Nếu tryRefreshSession được gọi 2 lần cùng lúc (vd: ProtectedRoute + axios interceptor),
 * chỉ thực hiện 1 lần refresh thật sự, lần thứ 2 sẽ chờ kết quả của lần thứ 1.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Tạo Zustand store với middleware `persist`.
 *
 * Cú pháp: create<Interface>()(persist(stateFactory, persistOptions))
 *
 * `persist` hoạt động như một lớp bọc (wrapper):
 *  - Sau mỗi lần set() → Tự động serialize state và lưu vào localStorage
 *  - Khi app khởi động → Tự động đọc từ localStorage và rehydrate state
 *  - partialize: Chỉ lưu token và user (không lưu isLoading, _hasHydrated)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ── Giá trị ban đầu ──────────────────────────────────
      user: null,
      token: null,
      isLoading: false,
      _hasHydrated: false, // Bắt đầu là false, chuyển true sau khi localStorage được đọc

      // ── Implementations ───────────────────────────────────

      // Cập nhật cờ hydration (gọi từ onRehydrateStorage callback)
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      /**
       * Lưu token + user vào store SAU KHI đăng nhập thành công.
       *
       * Tại sao phải gọi localStorage.setItem thủ công ở đây?
       *  → persist middleware lưu vào localStorage khi state thay đổi
       *  → Nhưng axios interceptor (request) đọc từ localStorage NGAY LẬP TỨC
       *  → Nếu chỉ dùng set(), có thể có khoảng trống nhỏ khi axios chưa đọc được token mới
       *  → setItem thủ công đảm bảo token CÓ NGAY trong localStorage
       */
      setAuth: (token, user) => {
        localStorage.setItem("token", token); // ← Đảm bảo axios đọc được ngay
        set({ token, user });
      },

      /**
       * Đăng xuất: Dọn sạch mọi thứ.
       * Thứ tự quan trọng: xóa localStorage TRƯỚC khi gọi API logout
       * → Tránh trường hợp gọi API logout fail nhưng token vẫn còn
       */
      logout: async () => {
        localStorage.removeItem("token"); // Xóa access token
        await authService.logout();       // Gọi backend để xóa refresh token khỏi DB
        set({ token: null, user: null }); // Reset state về null
      },

      /**
       * Thử refresh phiên đăng nhập.
       *
       * Logic:
       *  1. Nếu đang có refresh khác chạy → chờ kết quả của nó (tránh double-refresh)
       *  2. Gọi /auth/refresh → Backend đọc HttpOnly Cookie → tạo access token mới
       *  3. Lưu token mới vào localStorage và store
       *  4. Nếu fail → xóa state, trả về false → ProtectedRoute sẽ redirect về /login
       */
      tryRefreshSession: async () => {
        // Đang refresh rồi → chờ kết quả thay vì gọi thêm
        if (refreshPromise) return refreshPromise;

        set({ isLoading: true }); // Bật loading để ProtectedRoute hiển thị null (không redirect sớm)
        refreshPromise = (async () => {
          try {
            const { token, user } = await authService.refresh(); // Gọi /auth/refresh
            localStorage.setItem("token", token);
            set({ token, user });
            return true; // ✅ Phiên được gia hạn thành công
          } catch {
            // Refresh fail → phiên đã hết hạn thật sự
            localStorage.removeItem("token");
            set({ token: null, user: null });
            return false; // ❌ Cần đăng nhập lại
          } finally {
            set({ isLoading: false }); // Tắt loading dù thành công hay thất bại
            refreshPromise = null;     // Reset để lần sau có thể refresh lại
          }
        })();

        return refreshPromise;
      },

      /**
       * Lấy profile mới nhất từ server và cập nhật vào store.
       * Dùng sau khi user thay đổi thông tin trong trang Settings.
       */
      fetchProfile: async () => {
        const token = get().token;
        if (!token) return; // Chưa đăng nhập → không làm gì
        set({ isLoading: true });
        try {
          const { user } = await authService.getProfile();
          set({ user }); // Cập nhật thông tin user mới nhất
        } catch {
          // Không lấy được profile → có thể phiên đã hết hạn
          get().logout(); // Logout để xóa state cũ
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Kiểm tra xác thực nhanh: Có token VÀ token chưa hết hạn không?
       * Đây là kiểm tra client-side (không cần gọi server).
       * Dùng trong ProtectedRoute để quyết định cho vào trang hay redirect.
       */
      isAuthenticated: () => !!get().token && !isTokenExpired(get().token),
    }),

    // ── Cấu hình persist middleware ────────────────────────
    {
      // Tên key trong localStorage: "auth-storage"
      // Xem tại: F12 → Application → Local Storage → auth-storage
      name: "auth-storage",

      /**
       * Chỉ lưu token và user vào localStorage.
       * KHÔNG lưu isLoading, _hasHydrated vì đó là UI state tạm thời.
       * Nếu lưu _hasHydrated = true, lần sau load sẽ không chờ hydration đúng cách.
       */
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),

      /**
       * Callback khi Zustand hoàn tất việc đọc dữ liệu từ localStorage.
       * → Set _hasHydrated = true để báo cho ProtectedRoute biết "đọc xong rồi, OK kiểm tra đi"
       */
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
