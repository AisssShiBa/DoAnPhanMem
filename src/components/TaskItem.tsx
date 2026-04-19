interface TaskProps {
  title: string;
  description?: string;
  deadline: string;
  status: "To-do" | "Done";
  priority: "Cao" | "Trung bình" | "Thấp";
  onToggleStatus: () => void;
}

export default function TaskItem({
  title,
  description,
  deadline,
  status,
  priority,
  onToggleStatus,
}: TaskProps) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px 0",
        borderRadius: "5px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>
          <input
            type="checkbox"
            checked={status === "Done"}
            onChange={onToggleStatus}
            style={{ marginRight: "10px" }}
          />
          {title}
        </h3>
        <span
          style={{
            color:
              priority === "Cao"
                ? "red"
                : priority === "Trung bình"
                  ? "orange"
                  : "green",
          }}
        >
          Ưu tiên: {priority}
        </span>
      </div>
      <p>{description}</p>
      <small>Deadline: {deadline}</small>
    </div>
  );
}
