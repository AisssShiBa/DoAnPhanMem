const HomePage = () => {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute -top-25 -left-25 w-100 h-100 rounded-full opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-87.5 h-87.5 rounded-full  opacity-20 blur-[100px] pointer-events-none" />

      {/* Badge */}
      <span className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
        Nền tảng học tập sinh viên
      </span>

      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-black text-center leading-tight tracking-tight mb-4">
        Học smarter,{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
          không harder
        </span>
      </h1>

      <p className="text-gray-400 text-center max-w-xl text-lg mb-10 leading-relaxed">
        Quản lý lịch học, tài liệu và kết nối với cộng đồng sinh viên — tất cả
        trong một nơi.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href="/register"
          className="px-7 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:opacity-90 transition"
        >
          Bắt đầu miễn phí →
        </a>
        <a
          href="/login"
          className="px-7 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-semibold text-sm hover:bg-white/10 transition"
        >
          Đăng nhập
        </a>
      </div>

      {/* Feature chips */}
      <div className="mt-16 flex flex-wrap gap-3 justify-center">
        {[
          "📚 Tài liệu chia sẻ",
          "🗓️ Lịch học thông minh",
          "💬 Cộng đồng",
          "🔔 Thông báo realtime",
        ].map((f) => (
          <span
            key={f}
            className="px-4 py-2 rounded-full border border-white/5 bg-white/5 text-gray-400 text-xs"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
