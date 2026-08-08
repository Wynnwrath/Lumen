import { useState, useMemo } from "react";
import { updateOrderStatus, getOrdersCsv, downloadCsv } from "../../api/orders";
import type { Order, OrderStatus } from "../../types";
import { getStatusClasses } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SearchInput } from "../../components/admin/shared/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/skeletons";
import { AdminPagination } from "../../components/admin/shared/AdminPagination";
import { useToast } from "../../components/ui/ToastProvider";
import { useOrders } from "../../hooks/useOrders";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, formatMoney } from "../../utils/format";
import { ORDER_STATUSES, isPendingStatus } from "../../constants";
import { OrderStatusSelect } from "../../components/admin/orders/OrderStatusSelect";

// Admin order management: client-side filtered list, status updates, CSV export.
export const AdminOrdersPage = () => {
  const { orders, refresh: refreshOrders, loading } = useOrders();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter((o) => isPendingStatus(o.status)).length;

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-none">
        <SearchInput
          value={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          placeholder="Search by order # or customer name..."
        />

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Orders Summary Strip */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>
          <span className="font-extrabold text-slate-900 dark:text-white">{orders.length}</span> orders
        </span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span>
          <span className="font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMoney(totalRevenue)}
          </span>{" "}
          revenue
        </span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span>
          <span className="font-extrabold text-slate-900 dark:text-white">{pendingOrdersCount}</span> pending
        </span>
      </div>

      {/* Orders Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {loading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : (
      <div className="space-y-4">
        {/* Mobile View: High-Density Order Cards */}
        <div className="block md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <EmptyState message="No orders found matching your criteria." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none" />
          ) : (
            paginated.map((ord) => (
              <div
                key={ord._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs rounded-none"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <div>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      #{ord.orderNumber}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {ord.items.length} items • {ord.paymentMethod}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {formatDate(ord.createdAt)}
                    </p>
                  </div>
                  <span className="font-mono font-extrabold text-base text-blue-600 dark:text-blue-400">
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
                  <Button variant="outline" size="sm" fullWidth onClick={() => setSelectedOrder(ord)}>
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
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredOrders.length === 0 ? (
                  <EmptyState
                    message="No orders found matching your criteria."
                    className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    colSpan={8}
                  />
                ) : (
                  paginated.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">#{ord.orderNumber}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</p>
                        <p className="text-[11px] text-slate-500">{ord.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {ord.items.length} items
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{ord.paymentMethod}</td>
                    <td className="p-4 font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(ord.total)}
                    </td>
                    <td className="p-4">
                      <OrderStatusSelect
                        value={ord.status}
                        onChange={(st) => handleUpdateStatus(ord.orderNumber, st)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusClasses(ord.status)}`}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(ord)}>
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

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        start={start}
        end={end}
        onChange={setPage}
      />

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

            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Items:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {selectedOrder.items.map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="flex items-center justify-between text-xs p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name} &times; {item.quantity}</span>
                    <span className="font-mono font-bold">{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
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
