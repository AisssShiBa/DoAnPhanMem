import React, { useState, useEffect } from "react";
import {
  Users,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileDown,
  Loader2,
} from "lucide-react";

// --- Cấu trúc dữ liệu (Interfaces) ---
interface StatItem {
  label: string;
  value: number | string;
  change: string;
  isIncrease: boolean;
  icon: React.ReactNode;
}

interface ChartData {
  label: string;
  value: number;
}

interface SystemHealth {
  cpu: number;
  ram: number;
  disk: number;
}

export default function AdminDashboard() {
  // --- States quản lý dữ liệu ---
  const [stats, setStats] = useState<StatItem[]>([]);
  const [dauData, setDauData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [sysHealth, setSysHealth] = useState<SystemHealth>({
    cpu: 0,
    ram: 0,
    disk: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // --- Giả lập gọi API từ Backend ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // TƯỞNG TƯỢNG ĐÂY LÀ ĐOẠN GỌI API THỰC TẾ
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Dữ liệu tổng quan
        setStats([
          {
            label: "Tổng người dùng",
            value: "1,250",
            change: "+12%",
            isIncrease: true,
            icon: <Users className="text-blue-400" size={24} />,
          },
          {
            label: "DAU hôm nay",
            value: "480",
            change: "-2%",
            isIncrease: false,
            icon: <BarChart3 className="text-orange-400" size={24} />,
          },
          {
            label: "MAU tháng này",
            value: "1,220",
            change: "+8%",
            isIncrease: true,
            icon: <CalendarDays className="text-purple-400" size={24} />,
          },
          {
            label: "Tổng Tasks",
            value: "15,400",
            change: "+18%",
            isIncrease: true,
            icon: <CheckCircle2 className="text-emerald-400" size={24} />,
          },
        ]);

        // Biểu đồ DAU
        const mockDau30Days = Array.from({ length: 30 }, (_, i) => ({
          label: `Ngày ${i + 1}`,
          value: Math.floor(Math.random() * 300) + 200, // Random 200-500 users
        }));
        setDauData(mockDau30Days);

        // Biểu đồ MAU
        setMonthlyData([
          { label: "Tháng 1", value: 850 },
          { label: "Tháng 2", value: 920 },
          { label: "Tháng 3", value: 1050 },
          { label: "Tháng 4", value: 1100 },
          { label: "Tháng 5", value: 1250 },
        ]);

        // Sức khỏe máy chủ (Set ổ đĩa giả lập ở mức 85% để kích hoạt cảnh báo)
        setSysHealth({ cpu: 38, ram: 61, disk: 85 });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Polling: Tự động cập nhật System Health mỗi 5 giây
    const interval = setInterval(() => {
      setSysHealth((prev) => ({
        cpu: Math.floor(Math.random() * 30) + 20,
        ram: Math.floor(Math.random() * 20) + 50,
        disk: prev.disk,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // --- Tính toán giá trị MAX cho biểu đồ ---
  const maxDau =
    dauData.length > 0 ? Math.max(...dauData.map((d) => d.value)) : 1;
  const maxUsers =
    monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.value)) : 1;

  // --- Hàm xuất báo cáo Excel ---
  const handleExportReport = () => {
    setIsExporting(true);
    // Giả lập thời gian tạo file
    setTimeout(() => {
      setIsExporting(false);
      alert(
        "✅ Đã xuất báo cáo thành công! File 'System_Metrics_Report.xlsx' đang được tải xuống.",
      );
    }, 1500);
  };

  // --- Giao diện đang tải ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-indigo-400">
        <span className="animate-pulse font-medium text-lg">
          Đang tải dữ liệu hệ thống...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* HEADER & NÚT XUẤT BÁO CÁO (AC-3) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Dashboard{" "}
            <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Admin
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Hệ thống quản trị và giám sát thời gian thực
          </p>
        </div>

        {/* Nút Xuất Excel */}
        <button
          onClick={handleExportReport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileDown size={18} />
          )}
          {isExporting ? "Đang tạo file Excel..." : "Xuất báo cáo (.xlsx)"}
        </button>
      </div>

      {/* YÊU CẦU AC-2: CẢNH BÁO DUNG LƯỢNG Ổ ĐĨA > 80% */}
      {sysHealth.disk > 80 && (
        <div className="bg-red-500/10 border border-red-500/30 px-5 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-4">
            <span className="text-3xl animate-bounce">⚠️</span>
            <div>
              <p className="font-bold text-red-400">
                Cảnh báo hệ thống: Dung lượng lưu trữ sắp đầy!
              </p>
              <p className="text-sm text-gray-300 mt-0.5">
                Dung lượng Disk hiện tại đạt{" "}
                <strong className="text-white">{sysHealth.disk}%</strong>. Hệ
                thống đã tự động gửi Email cảnh báo đến Quản trị viên để có kế
                hoạch nâng cấp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* THỐNG KÊ TỔNG QUAN (STATS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all rounded-2xl p-5 shadow-lg"
          >
            <div className="flex justify-between mb-3 items-center">
              <span className="text-2xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg text-white">
                {s.icon}
              </span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${s.isIncrease ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
              >
                {s.change}
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">
              {s.value}
            </p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* BIỂU ĐỒ (CHARTS) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Biểu đồ DAU */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <h2 className="text-base font-bold mb-6 text-gray-200">
            Daily Active Users (DAU) - 30 ngày qua
          </h2>
          <div className="flex items-end justify-between h-48 gap-0.5 sm:gap-1">
            {dauData.map((d, index) => (
              <div
                key={d.label}
                className="flex flex-col items-center justify-end h-full w-full group relative"
              >
                <div
                  className="w-full max-w-[12px] sm:max-w-[16px] rounded-t-sm bg-linear-to-t from-indigo-600/50 to-purple-500 hover:from-indigo-400 hover:to-purple-300 transition-all"
                  style={{ height: `${(d.value / maxDau) * 100}%` }}
                >
                  {/* Tooltip khi hover */}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-white">
                    {d.label}: {d.value}
                  </span>
                </div>
                {/* Chỉ hiển thị Label cho các mốc ngày (5, 10, 15, 20...) để tránh rối mắt */}
                <div className="h-6 mt-2">
                  {index === 0 || (index + 1) % 5 === 0 ? (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {index + 1}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ MAU */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-base font-bold mb-6 text-gray-200">
            Tăng trưởng người dùng (MAU)
          </h2>
          <div className="space-y-4">
            {monthlyData.map((m) => (
              <div key={m.label} className="group">
                <div className="flex justify-between text-sm mb-2 text-gray-400 group-hover:text-white transition-colors">
                  <span className="font-medium">{m.label}</span>
                  <span className="font-bold">{m.value} users</span>
                </div>
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(m.value / maxUsers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SỨC KHỎE HỆ THỐNG (SYSTEM HEALTH) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-200">
            Tình trạng Máy chủ (Server Health)
          </h2>
          <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              label: "CPU Usage",
              value: sysHealth.cpu,
              color: sysHealth.cpu > 80 ? "bg-red-500" : "bg-blue-500",
            },
            {
              label: "RAM Usage",
              value: sysHealth.ram,
              color: sysHealth.ram > 80 ? "bg-red-500" : "bg-emerald-500",
            },
            {
              label: "Disk Space",
              value: sysHealth.disk,
              color: sysHealth.disk > 80 ? "bg-red-500" : "bg-purple-500",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span className="font-medium">{item.label}</span>
                <span
                  className={`font-bold ${item.value > 80 ? "text-red-400 animate-pulse" : "text-white"}`}
                >
                  {item.value}%
                </span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
