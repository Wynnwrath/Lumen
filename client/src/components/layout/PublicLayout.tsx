import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { MobileNav } from "./MobileNav";

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background text-on-background">
      <PublicHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <PublicFooter />
      <MobileNav />
    </div>
  );
};
