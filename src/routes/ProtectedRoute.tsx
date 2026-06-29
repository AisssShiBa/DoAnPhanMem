/**
 * ============================================================
 * routes/ProtectedRoute.tsx – Bảo vệ route phía Frontend
 * ============================================================
 *
 * Component này đóng vai trò "người gác cổng" phía frontend.
 * Đặt ở giữa Router và các trang cần đăng nhập để kiểm soát truy cập.
 *
 * Cách dùng trong App.tsx:
 *   <Route element={<ProtectedRoute />}>           // Bảo vệ route USER
 *     <Route path="/user/dashboard" element={...} />
 *   </Route>
 *   <Route element={<ProtectedRoute requiredRole="ADMIN" />}> // Chỉ ADMIN
 *     <Route path="/admin" element={...} />
 *   </Route>
 *
 * Tại sao cần ProtectedRoute?
 *  → Không có nó, user có thể gõ thẳng URL "/user/dashboard" vào trình duyệt
 *    mà không cần đăng nhập
 *  → Backend cũng có middleware bảo vệ, nhưng ProtectedRoute giúp UX tốt hơn
 *    (redirect về /login thay vì hiện trang trắng hoặc lỗi 401)
 *
 * Luồng kiểm tra (theo thứ tự):
 *  1. Chờ Zustand đọc xong localStorage (_hasHydrated)
 *  2. Kiểm tra token: Không có hoặc hết hạn → tryRefreshSession()
 *  3. Nếu refresh OK → tiếp tục; Nếu fail → redirect /login
 *  4. Kiểm tra role (nếu requiredRole được truyền vào)
 *  5. Cho phép vào trang → <Outlet />
 */

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

/**
 * Props của ProtectedRoute.
 * requiredRole: Nếu được truyền, chỉ user có role đó mới được vào.
 *  Ví dụ: requiredRole="ADMIN" → chỉ admin vào được /admin/*
 */
interface Props {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: Props) {
  /**
   * State local: Đã hoàn tất việc kiểm tra/thử refresh chưa?
   * Ban đầu false → render null (không làm gì).
   * Sau khi kiểm tra xong → set true → mới quyết định cho vào hay redirect.
   *
   * Tại sao cần state này riêng, không dùng isLoading từ store?
   *  → isLoading chỉ báo đang có thao tác async (refresh, fetchProfile...)
   *  → checkedRefresh báo "đã kiểm tra xong, có thể ra quyết định rồi"
   *  → Hai khái niệm khác nhau, cần tách ra
   */
  const [checkedRefresh, setCheckedRefresh] = useState(false);

  // Đọc các giá trị cần thiết từ Zustand store
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);   // Đã đọc xong localStorage chưa?
  const isLoading = useAuthStore((s) => s.isLoading);         // Đang thực hiện async không?
  const tryRefreshSession = useAuthStore((s) => s.tryRefreshSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    /**
     * BƯỚC 1: Chờ Zustand hydration.
     * Nếu Zustand chưa đọc xong localStorage → dừng, không làm gì.
     * Effect sẽ chạy lại khi hasHydrated thay đổi thành true.
     */
    if (!hasHydrated) return;

    /**
     * BƯỚC 2: Kiểm tra cần refresh không?
     * Điều kiện cần refresh:
     *  - Không có token (chưa đăng nhập / token đã bị xóa)
     *  - HOẶC token đã hết hạn (isAuthenticated() = false khi token expired)
     *
     * isAuthenticated() decode JWT và kiểm tra trường `exp` (expiry time)
     * mà không cần gọi server → kiểm tra nhanh, không tốn network
     */
    const shouldRefresh = !token || !isAuthenticated();

    if (shouldRefresh) {
      /**
       * Thử refresh phiên đăng nhập.
       * tryRefreshSession() gọi /auth/refresh với Cookie trong request.
       * Khi xong (dù thành công hay thất bại) → setCheckedRefresh(true)
       *  → Trigger re-render → component sẽ quyết định redirect hay cho vào
       */
      void tryRefreshSession().finally(() => setCheckedRefresh(true));
      return;
    }

    /**
     * Đã có token hợp lệ, không cần refresh.
     * Set luôn checkedRefresh = true để tiếp tục render.
     */
    setCheckedRefresh(true);
  }, [hasHydrated, isAuthenticated, token, tryRefreshSession]);

  /**
   * RENDER GUARD: Hiển thị null trong các trường hợp chưa sẵn sàng.
   *
   * 1. !hasHydrated → Zustand chưa đọc xong localStorage, chưa có dữ liệu
   * 2. isLoading    → Đang thực hiện tryRefreshSession, chờ kết quả
   * 3. !checkedRefresh → Chưa hoàn tất bước kiểm tra, không ra quyết định vội
   *
   * Trả về null thay vì loading spinner để tránh flash of content
   * (trang load → thấy spinner → redirect về login → UX không tốt)
   */
  if (!hasHydrated || isLoading || !checkedRefresh) return null;

  /**
   * ĐÃ KIỂM TRA XONG. Ra quyết định:
   *
   * Trường hợp KHÔNG được vào:
   *  - Không có token: Chưa đăng nhập bao giờ
   *  - Token hết hạn VÀ refresh fail (vì nếu refresh OK, token đã được cập nhật)
   *
   * → Redirect về /login với replace: true
   *   (replace: true = không lưu route hiện tại vào history → nhấn Back không quay lại được)
   */
  if (!token || !isAuthenticated()) return <Navigate to="/login" replace />;

  /**
   * Kiểm tra ROLE (phân quyền).
   * Dùng cho Admin routes: <ProtectedRoute requiredRole="ADMIN" />
   *
   * Nếu user đăng nhập nhưng không phải ADMIN → redirect về dashboard user
   * thay vì trang 403 (UX tốt hơn)
   *
   * Role được lưu trong JWT payload và trong user store.
   * Backend CŨNG kiểm tra role trong authMiddleware → bảo vệ 2 lớp.
   */
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/user/dashboard" replace />;
  }

  /**
   * TẤT CẢ KIỂM TRA ĐÃ QUA.
   * <Outlet /> render component con của Route này.
   *
   * Ví dụ: Route tree là:
   *   <Route element={<ProtectedRoute />}>
   *     <Route path="/user/dashboard" element={<Dashboard />} />
   *   </Route>
   *
   * Khi URL = "/user/dashboard":
   *   ProtectedRoute render → return <Outlet />
   *   → Outlet render <Dashboard />
   */
  return <Outlet />;
}
