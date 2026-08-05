import React, { useState } from "react";
import { dataService } from "../../services/dataService";
import type { Order, Product } from "../../types";

interface Toast {
  id: number;
  message: string;
  type: "info" | "success";
}

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(dataService.getOrders());
  const [products, setProducts] = useState<Product[]>(dataService.getProducts());
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "info" | "success" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const refreshData = () => {
    setOrders(dataService.getOrders());
    setProducts(dataService.getProducts());
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
  const fulfillmentRate = totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalOrdersCount) * 100) : 0;

  // Filtered recent orders
  const recentOrders = orders.filter((o) => {
    if (orderFilter === "pending") return o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing";
    if (orderFilter === "completed") return o.status === "Completed";
    return true;
  });

  // Low stock products (< 5)
  const lowStockProducts = products.filter((p) => p.stock < 5);

  const handleUpdateStatus = (orderId: string, orderNumber: string, newStatus: string) => {
    dataService.updateOrderStatus(orderId, newStatus);
    refreshData();
    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderNumber === orderNumber)) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    }
    showToast(`Order ${orderNumber} status updated to ${newStatus}`, "success");
  };

  const handleRestock = (product: Product) => {
    const newStock = (product.stock || 0) + 10;
    dataService.updateProduct(product._id, { stock: newStock, status: "active" });
    refreshData();
    showToast(`Restocked +10 units for ${product.name}`, "success");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Aug 1";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Aug 1";
    }
  };

  const getStatusBadgeHTML = (status: string) => {
    let colorClasses = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    switch (status) {
      case "Pending":
        colorClasses = "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
        break;
      case "Confirmed":
        colorClasses = "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        break;
      case "Preparing":
        colorClasses = "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
        break;
      case "Shipped":
        colorClasses = "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
        break;
      case "Completed":
        colorClasses = "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
        break;
      case "Cancelled":
        colorClasses = "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
        break;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Toast Notification Container */}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold max-w-sm border pointer-events-auto transition-all duration-200 ${toast.type === "success"
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200"
              }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : "info"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Top 5 Prominent KPI Cards Row */}
      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 w-full">
        {/* Total Revenue / Units Sold */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Units Sold</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              -38%
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div id="kpi-sales" className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                ${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold">north_east</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Up 38% this week</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Total Orders</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              -11%
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div id="kpi-orders" className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalOrdersCount.toLocaleString()}
              </div>
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold">north_east</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Up 11% this week</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Avg. Order</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              +8%
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div id="kpi-avg-order" className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                ${avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm sm:text-base font-bold">north_east</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Avg customer spend</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Pending</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              Action
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div id="kpi-pending" className="text-xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {pendingOrdersCount}
              </div>
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm sm:text-base font-bold">schedule</span>
            </div>
            <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-300/80 font-medium mt-1">Awaiting processing</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Completed</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Fulfilled
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div id="kpi-completed" className="text-xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {completedOrdersCount}
              </div>
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold">task_alt</span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-300/80 font-medium mt-1">Delivered to buyers</p>
          </div>
        </div>
      </section>

      {/* Middle Row: Sales Conversion Funnel & Revenue Trend */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
        {/* Sales Conversion Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-7 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Sales conversion</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Conversion process from leads to deals</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Conversion rate</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span id="funnel-fulfillment-rate" className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {fulfillmentRate}%
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">+7%</span>
                </div>
              </div>
            </div>

            {/* Stepped Milestone Vertical Bars Visualizer */}
            <div className="pt-2 pb-4">
              <div className="h-36 w-full flex items-end justify-between gap-1.5 sm:gap-2 px-1">
                {/* Stage 1: Leads */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                  <div className="w-full bg-emerald-500 rounded-t-md h-28 shadow-xs"></div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Leads</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">1500</span>
                </div>

                {/* Stage 2: Add cart */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">53%</span>
                  <div className="w-full bg-emerald-500 rounded-t-md h-20 shadow-xs"></div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Add cart</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">800</span>
                </div>

                {/* Stage 3: Checkout */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">13%</span>
                  <div className="w-full bg-emerald-500 rounded-t-md h-12 shadow-xs"></div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Checkout</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">200</span>
                </div>

                {/* Stage 4: Deals */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">10%</span>
                  <div className="w-full bg-emerald-500 rounded-t-md h-8 shadow-xs"></div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Deals</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">150</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Revenue Trend Bar Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-7 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Revenue Trend</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Store sales breakdown for current period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                ${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-4 pb-2 w-full">
            <div className="h-36 w-full flex items-end justify-between gap-2 px-1">
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: "45%" }}></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Mon</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: "65%" }}></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tue</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: "52%" }}></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Wed</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: "85%" }}></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Thu</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-emerald-500 rounded-t-lg transition-all" style={{ height: "100%" }}></div>
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">Fri</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: "70%" }}></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sat</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: "78%" }}></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sun</span>
              </div>
            </div>
          </div>
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
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No orders recorded yet.
                </div>
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
                        {getStatusBadgeHTML(ord.status)}
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
                        onChange={(e) => handleUpdateStatus(ord._id, ord.orderNumber, e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer shadow-xs"
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
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                        No orders recorded yet.
                      </td>
                    </tr>
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
                          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs align-middle inline-block ml-0.5">north_east</span>
                        </td>
                        <td className="px-5 py-4">
                          {getStatusBadgeHTML(ord.status)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateStatus(ord._id, ord.orderNumber, e.target.value)}
                              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-blue-500 shadow-xs"
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
                  <span className="material-symbols-outlined text-emerald-500 text-3xl mb-1 block">check_circle</span>
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
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Order #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

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
                    onClick={() => handleUpdateStatus(selectedOrder._id, selectedOrder.orderNumber, st)}
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

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 dark:text-white text-sm">
                Total Amount: ${selectedOrder.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
