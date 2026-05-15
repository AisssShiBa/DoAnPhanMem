import { BrowserRouter, Routes, Route } from "react-router-dom";

// Dành cho khách chưa đăng nhập (Public)
import PublicLayout from "./components/Public";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Policy from "./Pages/Policy";
import Terms from "./Pages/Terms";
import Support from "./Pages/Support";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyEmail from "./Pages/VerifyEmail";

// Dành cho người dùng đã đăng nhập (User)
import Dashboard from "./Pages/User/Dashboard";
import TaskList from "./Pages/User/TaskList";
import CalendarView from "./Pages/User/CalendarView";
import Settings from "./Pages/User/Settings";
import UserLayout from "./components/User";

// Dành cho Quản trị viên (Admin)
import AdminLayout from "./Pages/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserManagement from "./Pages/Admin/UserManagement";
import DefaultTagsManagement from "./Pages/Admin/DefaultTagsManagement";
import SystemNotifications from "./Pages/Admin/SystemNotification";
import AuditLog from "./Pages/Admin/AuditLog";
import GoogleCallback from "./Pages/GoogleCallback";
import NotFound from "./Pages/NotFound";
import { ThemeProvider } from "./Context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import ResetPassword from "./Pages/ResetPassword";
import Sessions from "./Pages/Sessions";
import TrashPage from "./Pages/trashPage";
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================
                PUBLIC ROUTES (Ai cũng vào được)
            ========================= */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="policy" element={<Policy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="support" element={<Support />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="auth/callback" element={<GoogleCallback />} />
          </Route>

          {/* =========================
                USER ROUTES (Phải có Token mới vào được)
            ========================= */}
          {/* ProtectedRoute sẽ kiểm tra xem trong máy có Token chưa. Nếu chưa nó đá văng ra trang /login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TaskList />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="settings" element={<Settings />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="/user/sessions" element={<Sessions />} />
            </Route>
          </Route>

          {/* =========================
                ADMIN ROUTES
            ========================= */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="tags" element={<DefaultTagsManagement />} />
              <Route path="notifications" element={<SystemNotifications />} />
              <Route path="logs" element={<AuditLog />} />
            </Route>
          </Route>
          {/* =========================
                404 (Gõ sai link thì ra trang này)
            ========================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
