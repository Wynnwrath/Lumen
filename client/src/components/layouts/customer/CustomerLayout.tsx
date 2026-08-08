import { Outlet, useLocation } from "react-router-dom";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerFooter } from "./CustomerFooter";
import { MobileNav } from "./MobileNav";

// Wraps every storefront page: header + page + footer (+ mobile bottom nav).
// Cart/checkout are focused transactional pages, so they pin to the viewport
// (fixed shell, content scrolls internally) just like the admin pages.
// Everything else scrolls naturally.
export const CustomerLayout = () => {
  const { pathname } = useLocation();

  const isFixedShell = pathname === "/checkout" || pathname === "/cart";
  // Checkout gets the full screen (its own sticky Place Order bar replaces the
  // mobile dock); cart keeps the dock since it's still a browsing/editing page.
  const hideMobileNav = pathname === "/checkout";

  return (
    <div
      className={`${
        isFixedShell ? "h-dvh overflow-hidden" : "min-h-screen"
      } ${
        hideMobileNav
          ? ""
          : "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
      } flex flex-col bg-background text-on-background`}
    >
      <CustomerHeader />
      <main className={`min-w-0 ${isFixedShell ? "flex-1 min-h-0 overflow-hidden" : "flex-grow"}`}>
        <Outlet />
      </main>
      {!isFixedShell && <CustomerFooter />}
      {!hideMobileNav && <MobileNav />}
    </div>
  );
};
