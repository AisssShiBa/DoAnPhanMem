// HeaderUser.tsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Images/Logo.png";
import { Settings } from "lucide-react";

interface Props {
  name: string;
  onNavigate: (page: string) => void;
}

const HeaderUser: React.FC<Props> = ({ name, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-1 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          {/* Logo */}
          <Link to="/user">
            <img
              src={logo}
              alt="Logo"
              className="h-22 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
        <div className="flex items-center gap-10">
          <span className="cursor-pointer">Xin chào, {name}</span>

          <button
            className="cursor-pointer"
            onClick={() => onNavigate("tasks")}
          >
            Task
          </button>
          <button
            className="cursor-pointer"
            onClick={() => onNavigate("calendar")}
          >
            Lịch
          </button>

          <button
            onClick={() => onNavigate("logout")}
            className="bg-red-500 px-3 py-1 rounded cursor-pointer hover:bg-red-200 transition-colors"
          >
            Logout
          </button>
          <button
            className="cursor-pointer hover:bg-white/50 p-2 rounded-2xl"
            onClick={() => onNavigate("settings")}
          >
            <Settings />
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderUser;
