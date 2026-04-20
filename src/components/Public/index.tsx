import { Outlet } from "react-router-dom";
import PublicHeader from "./Header";
import Footer from "./Footer";

const PublicLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#0f0f1a] text-white relative overflow-hidden">
      {/* Background glow giống Home */}
      <div className="absolute -top-20 -left-20 w-100 h-100 bg-indigo-600 opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-75 h-75 bg-purple-600 opacity-15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <PublicHeader />

        <main className="flex-1 w-full py-10 px-6 max-w-7xl mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
