import React, { useState } from "react";
import { dataService } from "../../services/dataService";
import type { Order } from "../../types";

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(dataService.getOrders());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const refreshOrders = () => {
    setOrders(dataService.getOrders());
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    dataService.updateOrderStatus(id, newStatus);
    refreshOrders();
    if (selectedOrder && (selectedOrder._id === id || selectedOrder.orderNumber === id)) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
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

  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/90 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/90 dark:text-amber-300 border-amber-300 dark:border-amber-700";
      case "preparing":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/90 dark:text-purple-300 border-purple-300 dark:border-purple-700";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/90 dark:text-rose-300 border-rose-300 dark:border-rose-700";
      case "confirmed":
      case "shipped":
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/90 dark:text-blue-300 border-blue-300 dark:border-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-none">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or customer name..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
            <option value="pending" className="dark:bg-slate-900 text-slate-900 dark:text-white">Pending</option>
            <option value="confirmed" className="dark:bg-slate-900 text-slate-900 dark:text-white">Confirmed</option>
            <option value="preparing" className="dark:bg-slate-900 text-slate-900 dark:text-white">Preparing</option>
            <option value="shipped" className="dark:bg-slate-900 text-slate-900 dark:text-white">Shipped</option>
            <option value="completed" className="dark:bg-slate-900 text-slate-900 dark:text-white">Completed</option>
            <option value="cancelled" className="dark:bg-slate-900 text-slate-900 dark:text-white">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      <div className="space-y-4">
        {/* Mobile View: High-Density Order Cards */}
        <div className="block md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none">
              No orders found matching your criteria.
            </div>
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
                    onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusColorClass(ord.status)}`}
                  >
                    <option value="Pending" className="dark:bg-slate-900 text-slate-900 dark:text-white">Pending</option>
                    <option value="Confirmed" className="dark:bg-slate-900 text-slate-900 dark:text-white">Confirmed</option>
                    <option value="Preparing" className="dark:bg-slate-900 text-slate-900 dark:text-white">Preparing</option>
                    <option value="Shipped" className="dark:bg-slate-900 text-slate-900 dark:text-white">Shipped</option>
                    <option value="Completed" className="dark:bg-slate-900 text-slate-900 dark:text-white">Completed</option>
                    <option value="Cancelled" className="dark:bg-slate-900 text-slate-900 dark:text-white">Cancelled</option>
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
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">#{ord.orderNumber}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</p>
                        <p className="text-[10px] text-slate-500">{ord.customer.email}</p>
                      </div>
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
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${getStatusColorClass(ord.status)}`}
                      >
                        <option value="Pending" className="dark:bg-slate-900 text-slate-900 dark:text-white">Pending</option>
                        <option value="Confirmed" className="dark:bg-slate-900 text-slate-900 dark:text-white">Confirmed</option>
                        <option value="Preparing" className="dark:bg-slate-900 text-slate-900 dark:text-white">Preparing</option>
                        <option value="Shipped" className="dark:bg-slate-900 text-slate-900 dark:text-white">Shipped</option>
                        <option value="Completed" className="dark:bg-slate-900 text-slate-900 dark:text-white">Completed</option>
                        <option value="Cancelled" className="dark:bg-slate-900 text-slate-900 dark:text-white">Cancelled</option>
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
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Order Invoice #{selectedOrder.orderNumber}
                </h3>
                <p className="text-[10px] text-slate-500">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <p><strong className="text-slate-500">Customer:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.email})</p>
              <p><strong className="text-slate-500">Shipping Address:</strong> {selectedOrder.address}</p>
              <p><strong className="text-slate-500">Payment:</strong> {selectedOrder.paymentMethod}</p>
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

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 dark:text-white text-sm">
                Total Due: ${selectedOrder.total.toFixed(2)}
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
