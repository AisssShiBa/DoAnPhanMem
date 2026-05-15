import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h3 className="text-white font-semibold mb-1">Không thể tải dữ liệu</h3>
      <p className="text-gray-500 text-sm mb-4">
        Đã xảy ra lỗi kết nối. Vui lòng thử lại.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition"
        >
          <RefreshCw size={14} /> Thử lại
        </button>
      )}
    </div>
  );
}
