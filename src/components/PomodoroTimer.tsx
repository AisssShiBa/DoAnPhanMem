function PomodoroTimer() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-28 h-28 rounded-full border-8 border-blue-500 flex items-center justify-center shadow-inner">
        <span className="text-2xl font-bold text-gray-800">25:00</span>
      </div>

      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
        Pomodoro
      </p>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          Bắt đầu
        </button>

        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
          Đặt lại
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
