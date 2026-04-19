import PomodoroTimer from "../../components/PomodoroTimer";

export default function Dashboard() {
  return (
    <div>
      <h1>Bảng điều khiển Sinh viên</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ border: "1px solid #ccc", padding: "20px", flex: 1 }}>
          <h3>Thống kê tuần này</h3>
          <p>
            Đã hoàn thành: <strong>12</strong> công việc
          </p>
          <p>
            Chưa hoàn thành: <strong>3</strong> công việc
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}
