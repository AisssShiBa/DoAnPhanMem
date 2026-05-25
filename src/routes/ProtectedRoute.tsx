import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

interface Props {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const [checkedRefresh, setCheckedRefresh] = useState(false);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const tryRefreshSession = useAuthStore((s) => s.tryRefreshSession);

  useEffect(() => {
    if (!hasHydrated) return;
    if (hasHydrated && !token) {
      void tryRefreshSession().finally(() => setCheckedRefresh(true));
      return;
    }
    setCheckedRefresh(true);
  }, [hasHydrated, token, tryRefreshSession]);

  if (!hasHydrated || isLoading || !checkedRefresh) return null;
  if (!token) return <Navigate to="/login" replace />;

  // ✅ Kiểm tra role nếu có yêu cầu
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
}
