import React, { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu
interface User {
  id: string | number;
  full_name: string;
  email: string;
  phone: string;
  provider: "LOCAL" | "GOOGLE";
  status: "ACTIVE" | "BANNED" | "INACTIVE";
  created_at: string;
  role_id: "ADMIN" | "USER";
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // States phục vụ lọc dữ liệu
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Giả lập gọi API lấy danh sách user từ Backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Giả lập chờ mạng

        const mockUsers: User[] = [
          {
            id: 1,
            full_name: "Nguyễn Văn A",
            email: "nva.it@student.edu.vn",
            phone: "0901234567",
            provider: "LOCAL",
            status: "ACTIVE",
            created_at: "2026-04-20",
            role_id: "USER",
          },
          {
            id: 2,
            full_name: "Trần Thị B",
            email: "ttb.marketing@student.edu.vn",
            phone: "0987654321",
            provider: "GOOGLE",
            status: "BANNED",
            created_at: "2026-04-22",
            role_id: "USER",
          },
          {
            id: 3,
            full_name: "Admin Tổng",
            email: "admin.super@softwhere.edu.vn",
            phone: "0999999999",
            provider: "LOCAL",
            status: "ACTIVE",
            created_at: "2026-01-01",
            role_id: "ADMIN",
          },
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Xử lý Hành động Khóa / Mở khóa
  const handleToggleStatus = (targetUser: User) => {
    // Không cho phép khóa Admin khác
    if (targetUser.role_id === "ADMIN") {
      alert("Lỗi: Hệ thống không cho phép khóa tài khoản Admin khác!");
      return;
    }

    if (targetUser.status === "ACTIVE" || targetUser.status === "INACTIVE") {
      // Khóa tài khoản: Yêu cầu nhập lý do
      const reason = window.prompt(
        `Nhập lý do khóa tài khoản ${targetUser.email}:`,
      );

      if (reason === null) return; // Người dùng ấn Cancel
      if (reason.trim() === "") {
        alert(
          "Thao tác thất bại: Bắt buộc phải nhập lý do khi khóa tài khoản!",
        );
        return;
      }

      if (
        window.confirm(`Xác nhận khóa tài khoản này với lý do: "${reason}"?`)
      ) {
        setUsers(
          users.map((u) =>
            u.id === targetUser.id ? { ...u, status: "BANNED" as any } : u,
          ),
        );
        // Sinh viên bị đăng xuất ngay lập tức
        alert(
          "Đã khóa tài khoản thành công! Sinh viên này đã bị cưỡng chế đăng xuất.",
        );
      }
    } else {
      // Mở khóa tài khoản
      if (window.confirm(`Bạn muốn mở khóa tài khoản ${targetUser.email}?`)) {
        setUsers(
          users.map((u) =>
            u.id === targetUser.id ? { ...u, status: "ACTIVE" as any } : u,
          ),
        );
        alert("Đã mở khóa tài khoản thành công.");
      }
    }
  };

  // Xử lý Hành động Reset Mật khẩu
  const handleResetPassword = (targetUser: User) => {
    if (
      window.confirm(
        `Xác nhận đặt lại mật khẩu cho sinh viên ${targetUser.full_name}?`,
      )
    ) {
      alert(
        `Hệ thống đang xử lý và sẽ gửi email reset đến ${targetUser.email}.`,
      );
    }
  };

  // Xem chi tiết tài khoản
  const handleViewDetails = (targetUser: User) => {
    alert(
      `CHI TIẾT TÀI KHOẢN:\n- Họ tên: ${targetUser.full_name}\n- Email: ${targetUser.email}\n- SĐT: ${targetUser.phone || "Trống"}\n- Vai trò: ${targetUser.role_id}\n- Trạng thái: ${targetUser.status}\n- Ngày tham gia: ${targetUser.created_at}`,
    );
  };

  // Lọc user theo từ khóa tìm kiếm và trạng thái
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "ALL" || user.status === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Người dùng</h1>
          <p className="text-gray-400 text-sm mt-1">
            Kiểm soát danh sách và quyền truy cập của hệ thống
          </p>
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="flex w-full md:w-auto gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="ALL" className="bg-gray-800">
              Tất cả trạng thái
            </option>
            <option value="ACTIVE" className="bg-gray-800">
              Đang hoạt động
            </option>
            <option value="BANNED" className="bg-gray-800">
              Đã khóa
            </option>
            <option value="INACTIVE" className="bg-gray-800">
              Chưa kích hoạt
            </option>
          </select>

          <input
            type="text"
            placeholder="Tìm theo email, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-300 text-sm border-b border-white/10">
              <th className="p-4 font-medium">Họ và Tên</th>
              <th className="p-4 font-medium">Email / SĐT</th>
              <th className="p-4 font-medium">Quyền / Đăng nhập</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  <span className="animate-pulse">Đang tải dữ liệu...</span>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Không tìm thấy tài khoản nào khớp với kết quả lọc.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500">
                      Tham gia: {user.created_at}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="text-gray-300">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-300">
                        {user.role_id}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          user.provider === "GOOGLE"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {user.provider}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : user.status === "BANNED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {user.status === "ACTIVE"
                        ? "Hoạt động"
                        : user.status === "BANNED"
                          ? "Đã khóa"
                          : "Chưa kích hoạt"}
                    </span>
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-xs bg-gray-500/10 text-gray-300 hover:bg-gray-500/20 px-3 py-1.5 rounded-lg transition"
                    >
                      Chi tiết
                    </button>

                    <button
                      onClick={() => handleResetPassword(user)}
                      className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={user.provider === "GOOGLE"}
                      title={
                        user.provider === "GOOGLE"
                          ? "Tài khoản Google không thể đổi mật khẩu"
                          : "Đặt lại mật khẩu"
                      }
                    >
                      Reset Pass
                    </button>

                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${
                        user.status === "BANNED"
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {user.status === "BANNED" ? "Mở khóa" : "Khóa"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
