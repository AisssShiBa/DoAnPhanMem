export default function SystemBackup() {
  return (
    <div>
      <h2>Quản lý Sao lưu Dữ liệu (DATA_BM1 & DATA_BM2)</h2>
      <button style={{ marginBottom: "20px" }}>
        Tạo bản sao lưu mới (Thủ công)
      </button>

      <table
        border={1}
        cellPadding={8}
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>Mã backup</th>
            <th>Thời gian</th>
            <th>Phạm vi dữ liệu</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>BKP_20240501</td>
            <td>01/05/2024 02:00</td>
            <td>Toàn bộ DB</td>
            <td style={{ color: "green" }}>Thành công</td>
            <td>
              <button>Phục hồi (DATA_BM2)</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
