import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Student/Dashboard";
import TaskList from "./Pages/Student/TaskList";
import CalendarView from "./Pages/Student/CalendarView";
import Settings from "./Pages/Student/Settings";

import PublicLayout from "./components/Public";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";

import UserLayout from "./components/User";
import NotFound from "./Pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
