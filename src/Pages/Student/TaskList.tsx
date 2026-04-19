import { useState } from "react";
import TaskItem from "../../components/TaskItem";

export default function TaskList() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <h2>Quản lý Công việc (SV_BM1)</h2>

      {/* Tính năng Quick Add & Filter */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm công việc (SEARCH_QĐ1)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={{ marginLeft: "10px" }}>
          <option value="all">Lọc trạng thái (FILTER_QĐ1)</option>
          <option value="todo">Chưa hoàn thành</option>
          <option value="done">Đã hoàn thành</option>
        </select>
        <button style={{ marginLeft: "10px" }}>+ Thêm nhanh (Quick Add)</button>
      </div>

      <TaskItem
        title="Làm đồ án KTPM"
        description="Viết báo cáo và code giao diện React"
        deadline="2024-05-20"
        status="To-do"
        priority="Cao"
        onToggleStatus={() => {}}
      />
    </div>
  );
}
