import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import HeaderUser from "./Header";

const UserLayout = () => {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === "logout") {
      console.log("logout");
      return;
    }
    navigate(`/user/${page}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f1a] text-white relative overflow-x-hidden">
      {/* Background blobs — pointer-events none, không ảnh hưởng layout */}
      <div className="fixed -top-20 -left-20 w-72 sm:w-100 h-72 sm:h-100 bg-indigo-600 opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-60 sm:w-75 h-60 sm:h-75 bg-purple-600 opacity-15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <HeaderUser onNavigate={handleNavigate} />

        {/* Padding nhỏ hơn trên mobile */}
        <main className="flex-1 w-full py-6 px-4 sm:py-10 sm:px-6 max-w-7xl mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default UserLayout;
