export default function AdminDashboard() {
  return (
    <div>
      <h2>Bảng điều khiển Quản trị viên (Admin)</h2>

      {/* HT_BM1 */}
      <table
        border={1}
        cellPadding={10}
        style={{ width: "100%", textAlign: "left", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th>Thời gian thống kê</th>
            <th>Tổng User</th>
            <th>Tổng Task</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tháng 5/2024</td>
            <td>1,250</td>
            <td>15,400</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
