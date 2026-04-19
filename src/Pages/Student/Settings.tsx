export default function Settings() {
  return (
    <div>
      <h2>Cài đặt Ứng dụng & Hồ sơ</h2>
      <form>
        <label>Đổi Tên hiển thị:</label>
        <input type="text" placeholder="Nguyễn Văn A" />
        <br />

        <label>Chế độ giao diện:</label>
        <select>
          <option value="light">Sáng (Light Mode)</option>
          <option value="dark">Tối (Dark Mode)</option>
        </select>
        <br />

        <label>Múi giờ:</label>
        <select>
          <option value="GMT+7">Asia/Ho_Chi_Minh (GMT+7)</option>
        </select>
        <br />

        <button type="button">Lưu cài đặt</button>
      </form>
    </div>
  );
}
