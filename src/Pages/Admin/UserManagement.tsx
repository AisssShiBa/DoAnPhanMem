export default function UserManagement() {
  return (
    <div>
      <h2>Quản lý Người dùng</h2>
      <table
        border={1}
        cellPadding={10}
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>Email Sinh viên</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sinhvien01@truong.edu.vn</td>
            <td style={{ color: "green" }}>Hoạt động</td>
            <td>
              <button>Khóa (Ban)</button>
              <button>Reset Mật khẩu</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
