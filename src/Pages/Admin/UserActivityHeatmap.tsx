import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

interface HeatCell {
  day: number;
  hour: number;
  count: number;
}

function interpolateColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "rgba(255,255,255,0.04)";
  const ratio = value / max;
  if (ratio < 0.25) return `rgba(99,102,241,${0.1 + ratio * 0.4})`;
  if (ratio < 0.5) return `rgba(99,102,241,${0.3 + ratio * 0.4})`;
  if (ratio < 0.75) return `rgba(139,92,246,${0.5 + ratio * 0.3})`;
  return `rgba(168,85,247,${0.7 + ratio * 0.3})`;
}

export default function UserActivityHeatmap() {
  const [data, setData] = useState<HeatCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // ← thêm để xử lý lỗi

  useEffect(() => {
    // ✅ Gọi API thật thay vì Math.random()
    adminService
      .getActivityHeatmap()
      .then((res) => {
        setData(res.cells);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const maxCount = Math.max(...data.map((c) => c.count), 1);
  const getCell = (day: number, hour: number) =>
    data.find((c) => c.day === day && c.hour === hour);

  const peakCell = data.reduce((best, c) => (c.count > best.count ? c : best), {
    day: 0,
    hour: 0,
    count: 0,
  });
  const peakHour = peakCell.hour;
  const peakDay = DAYS[peakCell.day];

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-white">Heatmap Hoạt động</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Phân bổ hoạt động users theo giờ & ngày — 4 tuần gần nhất
          </p>
        </div>
        {!loading && !error && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Đỉnh hoạt động</p>
            <p className="text-sm font-bold text-violet-400">
              {peakDay} {peakHour}:00
            </p>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && <div className="h-48 animate-pulse bg-white/5 rounded-xl" />}

      {/* Lỗi */}
      {!loading && error && (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
          Không thể tải dữ liệu
        </div>
      )}

      {/* Nội dung chính — giữ nguyên UI cũ */}
      {!loading && !error && (
        <>
          {/* Hour labels */}
          <div className="flex items-center mb-1 ml-8">
            {HOURS.filter((_, i) => i % 3 === 0).map((h) => (
              <div key={h} className="flex-1 text-center">
                <span className="text-[9px] text-gray-600">{h}h</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-1">
                <span className="text-[10px] text-gray-600 w-7 text-right shrink-0">
                  {day}
                </span>
                <div className="flex gap-0.5 flex-1">
                  {HOURS.map((h) => {
                    const cell = getCell(di, h);
                    const count = cell?.count ?? 0;
                    return (
                      <div
                        key={h}
                        className="flex-1 rounded-sm transition-all duration-200 hover:scale-110 cursor-default group relative"
                        style={{
                          height: 16,
                          background: interpolateColor(count, maxCount),
                        }}
                        title={`${day} ${h}:00 — ${count} hoạt động`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                          <div className="bg-[#12122a] border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap shadow-xl">
                            <p className="text-[10px] text-gray-400">
                              {day} {h}:00
                            </p>
                            <p className="text-xs font-bold text-white">
                              {count} hoạt động
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-gray-600">Ít</span>
            {[0.1, 0.3, 0.5, 0.7, 1].map((r) => (
              <div
                key={r}
                className="w-4 h-3 rounded-sm"
                style={{
                  background: interpolateColor(
                    Math.round(r * maxCount),
                    maxCount,
                  ),
                }}
              />
            ))}
            <span className="text-[10px] text-gray-600">Nhiều</span>
          </div>
        </>
      )}
    </div>
  );
}
