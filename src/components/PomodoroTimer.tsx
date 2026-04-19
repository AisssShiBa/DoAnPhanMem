import { useState, useEffect } from "react";

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          alert("Hết thời gian tập trung!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div>
      <h2>Pomodoro Timer</h2>
      <h1>
        {minutes}:{seconds < 10 ? "0" : ""}
        {seconds}
      </h1>

      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? "Tạm dừng" : "Bắt đầu"}
      </button>

      <button
        onClick={() => {
          setIsActive(false);
          setTimeLeft(25 * 60);
        }}
      >
        Đặt lại
      </button>
    </div>
  );
}
