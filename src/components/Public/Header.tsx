import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Images/Logo.png";

const PublicHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-1 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Logo"
            className="h-22 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Login button */}
      </div>
    </header>
  );
};

export default PublicHeader;
