import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Images/Logo.png";

const PublicHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Logo"
            className="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;
