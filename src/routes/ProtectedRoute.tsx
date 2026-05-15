import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface Props {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;
  if (!token) return <Navigate to="/login" replace />;

  // ✅ Kiểm tra role nếu có yêu cầu
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
}
