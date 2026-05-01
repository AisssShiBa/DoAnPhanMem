import { BrowserRouter, Routes, Route } from "react-router-dom";
// Public
import PublicLayout from "./components/Public";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Policy from "./Pages/Policy";
import Terms from "./Pages/Terms";
import Support from "./Pages/Support";
import ForgotPassword from "./Pages/ForgotPassword";
// User
import Dashboard from "./Pages/User/Dashboard";
import TaskList from "./Pages/User/TaskList";
import CalendarView from "./Pages/User/CalendarView";
import Settings from "./Pages/User/Settings";
// Admin
import AdminLayout from "./Pages/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserManagement from "./Pages/Admin/UserManagement";
import SystemBackup from "./Pages/Admin/SystemBackup";
import DefaultTagsManagement from "./Pages/Admin/DefaultTagsManagement";
import SystemNotifications from "./Pages/Admin/SystemNotification";
import AuditLog from "./Pages/Admin/AuditLog";

import UserLayout from "./components/User";
import NotFound from "./Pages/NotFound";
import { ThemeProvider } from "./Context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          {/* Student Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/user/tasks" element={<TaskList />} />
            <Route path="/user/calendar" element={<CalendarView />} />
            <Route path="/user/settings" element={<Settings />} />
          </Route>
          <Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="backup" element={<SystemBackup />} />
            <Route path="tags" element={<DefaultTagsManagement />} />
            <Route path="notifications" element={<SystemNotifications />} />
            <Route path="logs" element={<AuditLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
