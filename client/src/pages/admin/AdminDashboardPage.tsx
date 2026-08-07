import { useState, useEffect, useMemo } from "react";
import { updateOrderStatus } from "../../api/orders";
import { updateProduct } from "../../api/products";
import { getDashboardCharts } from "../../api/dashboard";
import type { Order, OrderStatus, Product } from "../../types";
import { KpiCard } from "../../components/common/KpiCard";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../components/common/ToastProvider";
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { useCustomers } from "../../hooks/useCustomers";
import { formatDate } from "../../utils/format";
import { RevenueBarChart } from "./dashboard/RevenueBarChart";
import { OrdersByStatusList } from "./dashboard/OrdersByStatusList";
import { TopProductsChart } from "./dashboard/TopProductsChart";
import { RecentOrdersSection } from "./dashboard/RecentOrdersSection";
import { LowStockPanel } from "./dashboard/LowStockPanel";
import { RestockModal } from "./dashboard/RestockModal";

// Admin overview: KPI cards, revenue/status charts, recent orders, low-stock alerts.
export const AdminDashboardPage = () => {
  const { orders, refresh: refreshOrders } = useOrders();
  const { products, refresh: refreshProducts } = useProducts();
  const { customers } = useCustomers();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const { showToast } = useToast();
  const [charts, setCharts] = useState<{ revenueByDay: { date: string; label: string; total: number }[]; ordersByStatus: { status: string; count: number }[] }>({
    revenueByDay: [],
    ordersByStatus: [],
  });

  useEffect(() => {
    getDashboardCharts()
      .then(setCharts)
      .catch(() => {});
  }, []);

  const refreshData = () => {
    refreshOrders();
    refreshProducts();
  };

  // Calculated Metrics
  const totalSales = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    [orders]
  );

  const totalOrdersCount = useMemo(() => orders.length, [orders]);
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing").length,
    [orders]
  );
  const completedOrdersCount = useMemo(() => orders.filter((o) => o.status === "Completed").length, [orders]);
  const avgOrderValue = useMemo(() => (totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0), [totalSales, totalOrdersCount]);

  // Low stock products (< 5)
  const lowStockProducts = useMemo(() => products.filter((p) => p.stock < 5), [products]);

  // Top selling products: aggregate units sold per product name, excluding cancelled orders.
  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    orders
      .filter((o) => o.status !== "Cancelled")
      .forEach((o) =>
        o.items.forEach((item) => counts.set(item.name, (counts.get(item.name) || 0) + item.quantity))
      );
    return [...counts.entries()]
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [orders]);

  const handleUpdateStatus = async (orderNumber: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderNumber, newStatus);
      await refreshData();
      if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      showToast(`Order ${orderNumber} status updated to ${newStatus}`, "success");
    } catch (error) {
      showToast("Failed to update order status", "error");
    }
  };

  const handleRestock = async (product: Product, newStock: number) => {
    try {
      await updateProduct(product._id, { stock: newStock, status: newStock > 0 ? "active" : "out_of_stock" });
      await refreshData();
      showToast(`Stock updated to ${newStock} for ${product.name}`, "success");
    } catch (error) {
      showToast("Failed to update stock", "error");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Top KPI Cards Row */}
      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-5 w-full">
        {/* Total Revenue / Units Sold */}
        <KpiCard
          label="Total Sales"
          chip="Sales"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={`$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          valueClassName="font-mono"
          icon="north_east"
          iconClassName="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold"
          subtext="Total order value"
          id="kpi-sales"
          className="rounded-2xl"
        />

        {/* Total Orders */}
        <KpiCard
          label="Total Orders"
          chip="Orders"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={totalOrdersCount.toLocaleString()}
          icon="north_east"
          iconClassName="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold"
          subtext="All customer orders"
          id="kpi-orders"
        />

        {/* Total Products */}
        <KpiCard
          label="Total Products"
          chip="Catalog"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={products.length.toLocaleString()}
          icon="inventory"
          iconClassName="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-bold"
          subtext="Items on sale"
          id="kpi-products"
        />

        {/* Total Customers */}
        <KpiCard
          label="Total Customers"
          chip="Registered"
          chipClassName="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60"
          value={customers.length.toLocaleString()}
          icon="group"
          iconClassName="text-purple-600 dark:text-purple-400 text-sm sm:text-base font-bold"
          subtext="Customer accounts"
          id="kpi-customers"
        />

        {/* Avg Order Value */}
        <KpiCard
          label="Avg. Order"
          chip="Average"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={`$${avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          valueClassName="font-mono"
          icon="north_east"
          iconClassName="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-bold"
          subtext="Avg customer spend"
          id="kpi-avg-order"
        />

        {/* Pending Orders */}
        <KpiCard
          label="Pending"
          chip="Action"
          chipClassName="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
          value={pendingOrdersCount}
          valueClassName="text-amber-600 dark:text-amber-400"
          icon="schedule"
          iconClassName="text-amber-600 dark:text-amber-400 text-sm sm:text-base font-bold"
          subtext="Awaiting processing"
          id="kpi-pending"
        />

        {/* Completed Orders */}
        <KpiCard
          label="Completed"
          chip="Fulfilled"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={completedOrdersCount}
          valueClassName="text-emerald-600 dark:text-emerald-400"
          icon="task_alt"
          iconClassName="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold"
          subtext="Delivered to buyers"
          id="kpi-completed"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Charts Row: Weekly Revenue & Orders by Status */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
        <RevenueBarChart data={charts.revenueByDay} />

        <OrdersByStatusList data={charts.ordersByStatus} />
      </section>

      {/* Top Selling Products */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
        <div className="lg:col-span-12">
          <TopProductsChart data={topProducts} />
        </div>
      </section>

      {/* Bottom Row: Recent Transactions Table & Inventory Warnings */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
        {/* Recent Transactions Data Table */}
        <RecentOrdersSection orders={orders} onOpenDetails={setSelectedOrder} onUpdateStatus={handleUpdateStatus} />

        {/* Inventory Alerts Panel */}
        <LowStockPanel products={lowStockProducts} onRestock={setRestockProduct} />
      </section>

      <RestockModal
        product={restockProduct}
        onClose={() => setRestockProduct(null)}
        onConfirm={handleRestock}
      />

      {/* Order Detail Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.orderNumber}` : ""}
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="font-black text-slate-900 dark:text-white text-sm">
              Total Amount: ${selectedOrder ? selectedOrder.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
            </span>
            <button
              onClick={() => setSelectedOrder(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedOrder && (
          <>
            <div className="space-y-2 text-xs">
              <p><strong className="text-slate-500 font-semibold">Customer:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.email})</p>
              <p><strong className="text-slate-500 font-semibold">Date:</strong> {formatDate(selectedOrder.createdAt, { month: "short", day: "numeric" })}</p>
              <p><strong className="text-slate-500 font-semibold">Address:</strong> {selectedOrder.address}</p>
              <p><strong className="text-slate-500 font-semibold">Payment:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong className="text-slate-500 font-semibold">Status:</strong> <span className="font-bold text-blue-600">{selectedOrder.status}</span></p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Update Status:</label>
              <div className="flex flex-wrap gap-2">
                {(["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.orderNumber, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedOrder.status === st
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
