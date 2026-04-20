const dauData = [
  { day: "T2", dau: 420 },
  { day: "T3", dau: 380 },
  { day: "T4", dau: 510 },
  { day: "T5", dau: 490 },
  { day: "T6", dau: 620 },
  { day: "T7", dau: 310 },
  { day: "CN", dau: 270 },
];

const monthlyData = [
  { month: "T1", users: 850 },
  { month: "T2", users: 920 },
  { month: "T3", users: 1050 },
  { month: "T4", users: 1100 },
  { month: "T5", users: 1250 },
];

const stats = [
  {
    label: "Tổng người dùng",
    value: "1,250",
    change: "+12%",
    icon: "👥",
  },
  {
    label: "DAU hôm nay",
    value: "270",
    change: "+4%",
    icon: "📊",
  },
  {
    label: "MAU tháng này",
    value: "1,220",
    change: "+8%",
    icon: "📅",
  },
  {
    label: "Tasks",
    value: "15,400",
    change: "+18%",
    icon: "✅",
  },
];

export default function AdminDashboard() {
  const maxDau = Math.max(...dauData.map((d) => d.dau));
  const maxUsers = Math.max(...monthlyData.map((d) => d.users));

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white px-6 py-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-black">
          Dashboard{" "}
          <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Admin
          </span>
        </h1>
        <p className="text-gray-500 text-sm">Thống kê hệ thống</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <div className="flex justify-between mb-2">
              <span>{s.icon}</span>
              <span className="text-emerald-400 text-xs">{s.change}</span>
            </div>

            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LINE FAKE (bar style) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-bold mb-4">DAU tuần</h2>

          <div className="flex items-end justify-between h-40 gap-2">
            {dauData.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2">
                <div
                  className="w-6 rounded-lg bg-linear-to-t from-indigo-500 to-purple-500"
                  style={{
                    height: `${(d.dau / maxDau) * 100}%`,
                  }}
                />
                <span className="text-xs text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-bold mb-4">Users theo tháng</h2>

          <div className="space-y-3">
            {monthlyData.map((m) => (
              <div key={m.month}>
                <div className="flex justify-between text-xs mb-1 text-gray-400">
                  <span>{m.month}</span>
                  <span>{m.users}</span>
                </div>

                <div className="h-2 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{
                      width: `${(m.users / maxUsers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SYSTEM HEALTH */}
      <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-bold mb-4">System</h2>

        {[
          { label: "CPU", value: 38 },
          { label: "RAM", value: 61 },
          { label: "Disk", value: 47 },
        ].map((item) => (
          <div key={item.label} className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>

            <div className="h-2 bg-white/10 rounded-full">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
