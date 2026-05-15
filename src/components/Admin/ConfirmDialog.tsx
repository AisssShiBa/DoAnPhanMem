import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus nút confirm khi mở, đóng khi nhấn Escape
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const variantClass = {
    danger: "bg-red-500 hover:bg-red-400",
    warning: "bg-orange-500 hover:bg-orange-400",
    primary: "bg-indigo-500 hover:bg-indigo-400",
  }[confirmVariant];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Panel — stopPropagation để click bên trong không đóng */}
      <div
        className="bg-[#16162a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${confirmVariant === "danger" ? "bg-red-500/10" : confirmVariant === "warning" ? "bg-orange-500/10" : "bg-indigo-500/10"}`}
            >
              <AlertTriangle
                size={20}
                className={
                  confirmVariant === "danger"
                    ? "text-red-400"
                    : confirmVariant === "warning"
                      ? "text-orange-400"
                      : "text-indigo-400"
                }
              />
            </div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6 pl-11">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
          >
            Huỷ
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition ${variantClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
