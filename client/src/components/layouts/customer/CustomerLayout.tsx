import { Outlet } from "react-router-dom";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerFooter } from "./CustomerFooter";
import { MobileNav } from "./MobileNav";

// Wraps every storefront page: header + page + footer (+ mobile bottom nav).
export const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background text-on-background">
      <CustomerHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <CustomerFooter />
      <MobileNav />
    </div>
  );
};
