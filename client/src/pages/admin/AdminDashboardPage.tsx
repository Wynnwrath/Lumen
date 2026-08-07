import { useState, useEffect } from "react";
import { Icon } from "../../components/common/Icon";
import { updateOrderStatus } from "../../api/orders";
import { updateProduct } from "../../api/products";
import { getDashboardCharts } from "../../api/dashboard";
import type { Order, Product } from "../../types";
import { KpiCard } from "../../components/common/KpiCard";
import { Modal } from "../../components/common/Modal";
import { StatusBadge, getStatusColorClass } from "../../components/common/StatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import { useToast } from "../../components/common/ToastProvider";
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { useCustomers } from "../../hooks/useCustomers";

export const AdminDashboardPage = () => {
  const { orders, refresh: refreshOrders } = useOrders();
  const { products, refresh: refreshProducts } = useProducts();
  const { customers } = useCustomers();
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
  const totalSales = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing"
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status === "Completed").length;
  const avgOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  // Filtered recent orders
  const recentOrders = orders.filter((o) => {
    if (orderFilter === "pending") return o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing";
    if (orderFilter === "completed") return o.status === "Completed";
    return true;
  });

  // Low stock products (< 5)
  const lowStockProducts = products.filter((p) => p.stock < 5);

  const handleUpdateStatus = async (orderNumber: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderNumber, newStatus);
      await refreshData();
      if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
      showToast(`Order ${orderNumber} status updated to ${newStatus}`, "success");
    } catch (error) {
      showToast("Failed to update order status", "error");
    }
  };

  const handleRestock = async (product: Product) => {
    const newStock = (product.stock || 0) + 10;
    try {
      await updateProduct(product._id, { stock: newStock, status: "active" });
      await refreshData();
      showToast(`Restocked +10 units for ${product.name}`, "success");
    } catch (error) {
      showToast("Failed to restock product", "error");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Aug 1";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Aug 1";
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
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Revenue</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Sales for the last 7 days</p>
          {charts.revenueByDay.length === 0 ? (
            <EmptyState text="No sales recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
          ) : (
            <div className="flex items-end justify-between gap-2 px-1 h-40">
              {charts.revenueByDay.map((day) => {
                const max = Math.max(...charts.revenueByDay.map((d) => d.total), 1);
                const pct = Math.round((day.total / max) * 100);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      ${day.total > 0 ? day.total.toFixed(0) : "0"}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${day.total > 0 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{day.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Orders by Status</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Current order distribution</p>
          {charts.ordersByStatus.length === 0 ? (
            <EmptyState text="No orders recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
          ) : (
            <div className="space-y-3">
              {charts.ordersByStatus.map((s) => {
                const total = charts.ordersByStatus.reduce((sum, x) => sum + x.count, 0) || 1;
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{s.status}</span>
                      <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Row: Recent Transactions Table & Inventory Warnings */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
        {/* Recent Transactions Data Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-sm overflow-hidden transition-colors duration-200 rounded-none">
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Customer orders and real-time status management</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Filter:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table Container: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
          <div className="p-4 sm:p-6 pt-0 sm:pt-0">
            {/* Mobile View: High-Density Transaction Cards */}
            <div className="block md:hidden space-y-3 mt-3">
              {recentOrders.length === 0 ? (
                <EmptyState text="No orders recorded yet." />
              ) : (
                recentOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          #{ord.orderNumber}
                        </span>
                        <StatusBadge status={ord.status} />
                      </div>
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                        ${ord.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</p>
                        <p className="text-[10px] text-slate-500">{ord.customer.email || "N/A"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{formatDate(ord.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.orderNumber, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2.5 py-1 outline-none border cursor-pointer ${getStatusColorClass(ord.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition shadow-xs"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Multi-Column Table (screen >= md) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3.5">Order #</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                  {recentOrders.length === 0 ? (
                    <EmptyState text="No orders recorded yet." className="py-12 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={6} />
                  ) : (
                    recentOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition border-b border-dashed border-slate-200 dark:border-slate-800">
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {ord.orderNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{ord.customer.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{ord.customer.email || "N/A"}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(ord.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white font-mono">
                          ${ord.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <Icon name="north_east" className="text-emerald-600 dark:text-emerald-400 text-xs align-middle inline-block ml-0.5" />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={ord.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateStatus(ord.orderNumber, e.target.value)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none border cursor-pointer ${getStatusColorClass(ord.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-1 py-1"
                              title="View Order Details"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory Alerts Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Low Stock Alerts</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Items requiring urgent restocking (&lt; 5 units)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                <span id="low-stock-count">{lowStockProducts.length}</span> Items
              </span>
            </div>

            <div id="low-stock-container" className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <Icon name="check_circle" className="text-emerald-500 text-3xl mb-1 block" />
                  All products are sufficiently stocked.
                </div>
              ) : (
                lowStockProducts.map((item) => {
                  const fallbackImg = "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80";
                  const imgSrc = item.images && item.images.length > 0 && item.images[0] ? item.images[0] : fallbackImg;

                  return (
                    <div
                      key={item._id}
                      className="py-3 px-1 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImg;
                          }}
                          className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700/80 shrink-0 bg-slate-100 dark:bg-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">
                              {item.category || "General"}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                              {item.stock} left
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestock(item)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs shrink-0"
                      >
                        Restock
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

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
              <p><strong className="text-slate-500 font-semibold">Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
              <p><strong className="text-slate-500 font-semibold">Address:</strong> {selectedOrder.address}</p>
              <p><strong className="text-slate-500 font-semibold">Payment:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong className="text-slate-500 font-semibold">Status:</strong> <span className="font-bold text-blue-600">{selectedOrder.status}</span></p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Update Status:</label>
              <div className="flex flex-wrap gap-2">
                {["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Cancelled"].map((st) => (
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
