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
// Student
import Dashboard from "./Pages/Student/Dashboard";
import TaskList from "./Pages/Student/TaskList";
import CalendarView from "./Pages/Student/CalendarView";
import Settings from "./Pages/Student/Settings";
// Admin
import AdminLayout from "./Pages/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserManagement from "./Pages/Admin/UserManagement";
import SystemBackup from "./Pages/Admin/SystemBackup";
import DefaultTagsManagement from "./Pages/Admin/DefaultTagsManagement";
import SystemNotifications from "./Pages/Admin/SystemNotification";
import AuditLog from "./Pages/Admin/AuditLog";

function App() {
  return (
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
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/tasks" element={<TaskList />} />
        <Route path="/student/calendar" element={<CalendarView />} />
        <Route path="/student/settings" element={<Settings />} />

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
  );
}

export default App;
