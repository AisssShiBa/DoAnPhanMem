import React from "react";

const AdminHeader: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-red-600">👨‍💼 Admin Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-indigo-100 rounded-lg">
          <p>User</p>
          <h3 className="text-xl font-bold">120</h3>
        </div>

        <div className="p-4 bg-green-100 rounded-lg">
          <p>Tasks</p>
          <h3 className="text-xl font-bold">560</h3>
        </div>

        <div className="p-4 bg-yellow-100 rounded-lg">
          <p>Hoạt động</p>
          <h3 className="text-xl font-bold">80%</h3>
        </div>

        <div className="p-4 bg-red-100 rounded-lg">
          <p>Lỗi hệ thống</p>
          <h3 className="text-xl font-bold">2</h3>
        </div>
      </div>

      {/* Quản lý user */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">👥 Người dùng</h3>

        <ul className="space-y-2">
          <li className="flex justify-between border p-2 rounded">
            user1@gmail.com
            <button className="text-red-500">Khoá</button>
          </li>

          <li className="flex justify-between border p-2 rounded">
            user2@gmail.com
            <button className="text-red-500">Khoá</button>
          </li>
        </ul>
      </div>

      {/* Thông báo */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <h3>📢 Thông báo hệ thống</h3>
        <p>Server đang hoạt động ổn định</p>
      </div>
    </div>
  );
};

export default AdminHeader;
