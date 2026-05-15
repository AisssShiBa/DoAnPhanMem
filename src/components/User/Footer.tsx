import React from "react";
import { Link } from "react-router";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/5 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <div className="text-gray-400">
          © 2026 <span className="text-white font-medium">SoftWhere</span>. All
          rights reserved.
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <Link to="/policy" className="hover:text-indigo-400 transition">
            Chính sách
          </Link>
          <Link to="/terms" className="hover:text-indigo-400 transition">
            Điều khoản
          </Link>
          <Link to="/support" className="hover:text-indigo-400 transition">
            Hỗ trợ
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
