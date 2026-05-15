import { useState, useEffect, useRef } from "react";

type Mode = "pomodoro" | "short" | "long";

const MODES: Record<Mode, { label: string; seconds: number; color: string }> = {
  pomodoro: { label: "Pomodoro", seconds: 25 * 60, color: "#3b82f6" },
  short: { label: "Short Break", seconds: 5 * 60, color: "#10b981" },
  long: { label: "Long Break", seconds: 15 * 60, color: "#8b5cf6" },
};

const ALARM_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [seconds, setSeconds] = useState(MODES.pomodoro.seconds);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [customTimes, setCustomTimes] = useState({
    pomodoro: 25,
    short: 5,
    long: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = customTimes[mode] * 60;
  const progress = (seconds / totalSeconds) * 100;
  const color = MODES[mode].color;

  // Đổi mode → reset timer
  function switchMode(m: Mode) {
    setRunning(false);
    setMode(m);
    setSeconds(customTimes[m] * 60);
  }

  // Đổi thời gian tùy chỉnh
  function applySettings() {
    setSeconds(customTimes[mode] * 60);
    setRunning(false);
    setShowSettings(false);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "pomodoro") setRounds((r) => r + 1);
            // Phát âm thanh
            audioRef.current = new Audio(ALARM_URL);
            audioRef.current.play().catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, mode]);

  function reset() {
    setRunning(false);
    setSeconds(customTimes[mode] * 60);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // SVG progress ring
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 py-4">
      {/* ── Mode tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === m
                ? "bg-white shadow text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* ── SVG Ring ── */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-800">
            {mm}:{ss}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
            {MODES[mode].label}
          </span>
        </div>
      </div>

      {/* ── Rounds ── */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ backgroundColor: i < rounds % 4 ? color : "#e5e7eb" }}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">{rounds} vòng</span>
      </div>

      {/* ── Buttons ── */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white transition shadow-sm"
          style={{ backgroundColor: color }}
        >
          {running ? "Dừng" : "Bắt đầu"}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
        >
          Đặt lại
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
          title="Cài đặt"
        >
          ⚙
        </button>
      </div>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-72 shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-4">
              Tùy chỉnh thời gian
            </h3>
            {(["pomodoro", "short", "long"] as Mode[]).map((m) => (
              <div key={m} className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{MODES[m].label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCustomTimes((p) => ({
                        ...p,
                        [m]: Math.max(1, p[m] - 1),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-800">
                    {customTimes[m]}
                  </span>
                  <button
                    onClick={() =>
                      setCustomTimes((p) => ({
                        ...p,
                        [m]: Math.min(60, p[m] + 1),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400">phút</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={applySettings}
                className="flex-1 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: color }}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;
