import { useState } from "react";
import { updateOrderStatus } from "../../api/orders";
import type { Order } from "../../types";
import { getStatusColorClass } from "../../components/common/StatusBadge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { useOrders } from "../../hooks/useOrders";

export const AdminOrdersPage = () => {
  const { orders, refresh: refreshOrders } = useOrders();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleUpdateStatus = async (orderNumber: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderNumber, newStatus);
      await refreshOrders();
      if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== "all" && ord.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = ord.orderNumber.includes(q);
      const matchCust = ord.customer.name.toLowerCase().includes(q);
      if (!matchNum && !matchCust) return false;
    }
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing"
  ).length;

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-none">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by order # or customer name..." />

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>{" "}
          revenue
        </span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span>
          <span className="font-extrabold text-slate-900 dark:text-white">{pendingOrdersCount}</span> pending
        </span>
      </div>

      {/* Orders Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      <div className="space-y-4">
        {/* Mobile View: High-Density Order Cards */}
        <div className="block md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <EmptyState text="No orders found matching your criteria." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none" />
          ) : (
            filteredOrders.map((ord) => (
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
                      {new Date(ord.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className="font-mono font-extrabold text-base text-blue-600 dark:text-blue-400">
                    ${ord.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</h4>
                    <p className="text-[10px] text-slate-500">{ord.customer.email}</p>
                  </div>

                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord.orderNumber, e.target.value)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusColorClass(ord.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition text-center"
                  >
                    View Invoice
                  </button>
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
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">#{ord.orderNumber}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</p>
                        <p className="text-[11px] text-slate-500">{ord.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {ord.items.length} items
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{ord.paymentMethod}</td>
                    <td className="p-4 font-mono font-extrabold text-slate-900 dark:text-white">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.orderNumber, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusColorClass(ord.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Invoice #${selectedOrder.orderNumber}` : ""}
        subtitle={selectedOrder ? `Date: ${new Date(selectedOrder.createdAt).toLocaleDateString()}` : undefined}
        className="max-w-lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="font-black text-slate-900 dark:text-white text-sm">
              Total Due: ${selectedOrder ? selectedOrder.total.toFixed(2) : ""}
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
                <span className={`px-2 py-0.5 rounded-full font-bold ${getStatusColorClass(selectedOrder.status)}`}>
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
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name} &times; {item.quantity}</span>
                    <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-mono font-semibold">-${selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {selectedOrder.shipping === 0 ? "FREE" : `$${selectedOrder.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">${selectedOrder.tax.toFixed(2)}</span>
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
