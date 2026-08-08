import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CustomerLayout } from "./components/layouts/customer/CustomerLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";

// Public Pages
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";

// Admin Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage";
import { AdminCouponsPage } from "./pages/admin/AdminCouponsPage";

import { useAuthStore } from "./stores/auth.store";
import { ScrollToTop } from "./components/ui/ScrollToTop";

// Client-side guard for admin routes: redirects to /admin/login if not an admin.
// (Real security is the server's protect + authorize middleware.)
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

// The whole app's routing table.
export const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Standalone Login Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Customer Storefront Routes */}
          <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
        </Route>

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
