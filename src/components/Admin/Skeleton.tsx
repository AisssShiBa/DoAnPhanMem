// Dùng lại ở nhiều nơi, export nhiều variant
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-white/5 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-lg" />
        <div className="w-12 h-5 bg-white/10 rounded-full" />
      </div>
      <div className="h-8 w-24 bg-white/10 rounded mb-2" />
      <div className="h-4 w-32 bg-white/5 rounded" />
    </div>
  );
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <div className={`bg-white/10 rounded animate-pulse ${className}`} />;
}
