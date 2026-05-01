import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="relative w-full max-w-2xl text-center">
        <div className="pointer-events-none absolute inset-x-0 -top-18 select-none text-center text-[8rem] font-black leading-none tracking-tight text-slate-200 sm:text-[11rem]">
          404
        </div>

        <div className="relative z-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
            <SearchX className="h-10 w-10" />
          </div>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
            Ối! Lạc đường rồi phải không?
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
            Đường dẫn có thể đã bị thay đổi hoặc không bao giờ tồn tại. Đừng lo,
            hãy để chúng tôi đưa bạn về nhà.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <Home className="h-4 w-4" />
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
