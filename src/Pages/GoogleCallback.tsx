import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleGoogleLogin = async () => {
      // 1. Lấy token từ URL (cái đoạn ?token=...)
      const token = searchParams.get("token");

      if (token) {
        try {
          // 2. Lưu tạm token vào localStorage để Axios có thể dùng để gọi API
          localStorage.setItem("token", token);

          // 3. Lấy thông tin User từ Backend
          const data = await authService.getProfile();

          // 4. Lưu vào Zustand Store chính thức
          setAuth(token, data.user);

          // 5. Thành công! Đẩy người dùng vào trang Dashboard
          navigate("/user");
        } catch (error) {
          console.error("Lỗi khi lấy thông tin Google:", error);
          navigate("/login");
        }
      } else {
        // Nếu không có token, quay về trang đăng nhập
        navigate("/login");
      }
    };

    handleGoogleLogin();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl animate-pulse font-semibold">
        Đang đồng bộ dữ liệu Google... ⏳
      </div>
    </div>
  );
}
