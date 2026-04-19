import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Student/Dashboard";
import TaskList from "./Pages/Student/TaskList";
import CalendarView from "./Pages/Student/CalendarView";
import Settings from "./Pages/Student/Settings";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserManagement from "./Pages/Admin/UserManagement";
import SystemBackup from "./Pages/Admin/SystemBackup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/tasks" element={<TaskList />} />
        <Route path="/student/calendar" element={<CalendarView />} />
        <Route path="/student/settings" element={<Settings />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/backup" element={<SystemBackup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
