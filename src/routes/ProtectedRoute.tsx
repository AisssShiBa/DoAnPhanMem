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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hasHydrated) return;

    const shouldRefresh = !token || !isAuthenticated();
    if (shouldRefresh) {
      void tryRefreshSession().finally(() => setCheckedRefresh(true));
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheckedRefresh(true);
  }, [hasHydrated, isAuthenticated, token, tryRefreshSession]);

  if (!hasHydrated || isLoading || !checkedRefresh) return null;
  if (!token || !isAuthenticated()) return <Navigate to="/login" replace />;

  // ✅ Kiểm tra role nếu có yêu cầu
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
}
