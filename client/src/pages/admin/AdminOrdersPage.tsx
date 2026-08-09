import { useState, useMemo } from "react";
import { updateOrderStatus, getOrdersCsv, downloadCsv } from "../../api/orders";
import type { Order, OrderStatus } from "../../types";
import { getStatusClasses } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SearchInput } from "../../components/admin/shared/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/skeletons";
import { ProductImage } from "../../components/ui/ProductImage";
import { AdminPagination } from "../../components/admin/shared/AdminPagination";
import { AdminToolbar } from "../../components/admin/shared/AdminToolbar";
import { KpiCard } from "../../components/admin/shared/KpiCard";
import { useToast } from "../../components/ui/ToastProvider";
import { useOrders } from "../../hooks/useOrders";
import { usePagination } from "../../hooks/usePagination";
import { useOrderMetrics } from "../../hooks/useOrderMetrics";
import { formatDate, formatMoney } from "../../utils/format";
import { ORDER_STATUSES } from "../../constants";
import { OrderStatusSelect } from "../../components/admin/orders/OrderStatusSelect";

// Admin order management: client-side filtered list, status updates, CSV export.
export const AdminOrdersPage = () => {
  const { orders, refresh: refreshOrders, loading } = useOrders();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // Client-side filtering (status + search) over the loaded orders, matching
  // the other admin pages so changing filters never hits the server.
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== "all" && ord.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = ord.orderNumber.toLowerCase().includes(q);
        const matchCust = ord.customer.name.toLowerCase().includes(q);
        if (!matchNum && !matchCust) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const { page, setPage, totalPages, totalItems, start, end, paginated } = usePagination(filteredOrders, 10);

  const handleUpdateStatus = async (orderNumber: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderNumber, newStatus);
      await refreshOrders();
      if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showToast("Failed to update order status", "error");
    }
  };

  const handleExportCsv = async () => {
    try {
      const csv = await getOrdersCsv();
      downloadCsv(csv, "orders.csv");
      showToast("Orders exported successfully", "success");
    } catch (error) {
      showToast("Failed to export orders", "error");
    }
  };

  const { totalRevenue, pendingCount: pendingOrdersCount } = useOrderMetrics(orders);

  return (
    <div className="md:h-full md:min-h-0 flex flex-col gap-5 sm:gap-6 w-full">
      {/* Orders Summary KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 w-full shrink-0">
        <KpiCard
          label="Total Orders"
          chip="Orders"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={orders.length.toLocaleString()}
          icon="shopping_cart"
          iconClassName="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-bold"
          subtext="All customer orders"
          id="stat-total-orders"
        />
        <KpiCard
          label="Total Revenue"
          chip="Sales"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={formatMoney(totalRevenue)}
          valueClassName="font-mono"
          icon="north_east"
          iconClassName="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-bold"
          subtext="Total order value"
          id="stat-total-revenue"
        />
        <KpiCard
          label="Pending Orders"
          chip="Action"
          chipClassName="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
          value={pendingOrdersCount}
          valueClassName="text-amber-600 dark:text-amber-400"
          icon="schedule"
          iconClassName="text-amber-600 dark:text-amber-400 text-sm sm:text-base font-bold"
          subtext="Awaiting processing"
          id="stat-pending-orders"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Search & Filter Bar */}
      <div className="shrink-0">
        <AdminToolbar
          search={
            <SearchInput
              value={searchQuery}
              onChange={(q) => {
                setSearchQuery(q);
                setPage(1);
              }}
              placeholder="Search by order # or customer name..."
            />
          }
          actions={
            <>
              <Button variant="blue" icon="download" onClick={handleExportCsv}>
                Export CSV
              </Button>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </>
          }
        />
      </div>

      {/* Orders Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {loading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : (
      <div className="md:flex-1 md:min-h-0 md:overflow-y-auto space-y-4">
        {/* Mobile View: High-Density Order Cards */}
        <div className="block md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <EmptyState message="No orders found matching your criteria." card />
          ) : (
            paginated.map((ord) => (
              <div
                key={ord._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs rounded-none"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductImage
                      src={ord.items[0]?.image}
                      alt={ord.items[0]?.name || "Product"}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        #{ord.orderNumber}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {ord.items[0]?.name || "Product"}{ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ""}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {ord.items.length} {ord.items.length === 1 ? "item" : "items"} • {ord.paymentMethod}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {formatDate(ord.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-base text-blue-600 dark:text-blue-400 shrink-0">
                    {formatMoney(ord.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</h4>
                    <p className="text-[10px] text-slate-500">{ord.customer.email}</p>
                  </div>

                  <OrderStatusSelect
                    value={ord.status}
                    onChange={(st) => handleUpdateStatus(ord.orderNumber, st)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusClasses(ord.status)}`}
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button variant="outline" size="sm" fullWidth onClick={() => { setSelectedItemIndex(0); setSelectedOrder(ord); }}>
                    View Invoice
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Multi-Column Table (screen >= md) */}
        <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3">Items Count</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredOrders.length === 0 ? (
                  <EmptyState
                    message="No orders found matching your criteria."
                   
                    colSpan={8}
                  />
                ) : (
                  paginated.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">#{ord.orderNumber}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</p>
                        <p className="text-[11px] text-slate-500">{ord.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-400">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <ProductImage
                          src={ord.items[0]?.image}
                          alt={ord.items[0]?.name || "Product"}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {ord.items.length} {ord.items.length === 1 ? "item" : "items"}
                          {ord.items.length > 1 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              +{ord.items.length - 1}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">{ord.paymentMethod}</td>
                    <td className="p-3 font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(ord.total)}
                    </td>
                    <td className="p-3">
                      <OrderStatusSelect
                        value={ord.status}
                        onChange={(st) => handleUpdateStatus(ord.orderNumber, st)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusClasses(ord.status)}`}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedItemIndex(0); setSelectedOrder(ord); }}>
                        View Invoice
                      </Button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      <div className="shrink-0">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          start={start}
          end={end}
          onChange={setPage}
        />
      </div>

      {/* Invoice Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Invoice #${selectedOrder.orderNumber}` : ""}
        subtitle={selectedOrder ? `Date: ${formatDate(selectedOrder.createdAt, {})}` : undefined}
        className="max-w-lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="font-black text-slate-900 dark:text-white text-sm">
              Total Due: {selectedOrder ? formatMoney(selectedOrder.total) : ""}
            </span>
            <Button variant="blue" onClick={() => setSelectedOrder(null)}>Done</Button>
          </div>
        }
      >
        {selectedOrder && (
          <>
            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <p><strong className="text-slate-500">Customer:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.email})</p>
              <p><strong className="text-slate-500">Shipping Address:</strong> {selectedOrder.address}</p>
              <p><strong className="text-slate-500">Payment:</strong> {selectedOrder.paymentMethod}</p>
              <p>
                <strong className="text-slate-500">Status:</strong>{" "}
                <span className={`px-2 py-0.5 rounded-full font-bold ${getStatusClasses(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
              {selectedOrder.couponUsed && (
                <p><strong className="text-slate-500">Coupon:</strong> {selectedOrder.couponUsed}</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ordered Items</label>
                <select
                  value={selectedItemIndex}
                  onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
                >
                  {selectedOrder.items.map((item, idx) => (
                    <option key={`${item.name}-${idx}`} value={idx}>
                      {item.name} &times; {item.quantity} — {formatMoney(item.price * item.quantity)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder.items[selectedItemIndex] && (
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <ProductImage
                    src={selectedOrder.items[selectedItemIndex].image}
                    alt={selectedOrder.items[selectedItemIndex].name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedOrder.items[selectedItemIndex].name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {formatMoney(selectedOrder.items[selectedItemIndex].price)} &times; {selectedOrder.items[selectedItemIndex].quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white shrink-0">
                    {formatMoney(selectedOrder.items[selectedItemIndex].price * selectedOrder.items[selectedItemIndex].quantity)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatMoney(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-mono font-semibold">-{formatMoney(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {selectedOrder.shipping === 0 ? "FREE" : formatMoney(selectedOrder.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatMoney(selectedOrder.tax)}</span>
              </div>
              {selectedOrder.orderNotes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 font-semibold mb-0.5">Order Notes</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedOrder.orderNotes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
