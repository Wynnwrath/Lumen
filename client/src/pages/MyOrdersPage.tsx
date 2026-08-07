import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { getMyOrders, confirmOrderReceived } from "../api/orders";
import { getErrorMessage } from "../api/client";
import { useToast } from "../components/common/ToastProvider";
import type { Order } from "../types";
import { Icon } from "../components/common/Icon";
import { ProductImage } from "../components/common/ProductImage";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { OrderDetailsModal } from "../components/common/OrderDetailsModal";
import { OrderStatusTimeline, ORDER_TRACK_STEPS } from "../components/common/OrderStatusTimeline";
import { ListRowsSkeleton } from "../components/common/skeletons";
import { formatDate } from "../utils/format";

const AUTO_RECEIVE_DAYS = 3;

// Human-ish remaining time like "2d 14h" or "5h" until auto-receive.
function formatRemaining(ms: number): string {
  const totalHours = Math.floor(Math.max(0, ms) / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days}d ${hours}h` : `${totalHours}h`;
}

// "Auto-marks as received in 2d 14h" label for a Completed order, or null once
// the window has passed (the server will finalize on next fetch).
function getAutoReceiveLabel(order: Order): string | null {
  const anchor = order.completedAt || order.createdAt;
  const start = new Date(anchor).getTime();
  const deadline = start + AUTO_RECEIVE_DAYS * 24 * 60 * 60 * 1000;
  const remaining = deadline - Date.now();
  if (remaining <= 0) return null;
  return `Auto-marks as received in ${formatRemaining(remaining)}`;
}

// "My Orders" for a logged-in customer: list + order details modal.
export const MyOrdersPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleConfirmReceived = async (order: Order) => {
    if (confirmingId) return;
    setConfirmingId(order._id);
    try {
      const updated = await confirmOrderReceived(order.orderNumber);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, ...updated } : o)));
      if (selectedOrder && selectedOrder._id === order._id) {
        setSelectedOrder({ ...selectedOrder, ...updated });
      }
      showToast("Order marked as received. Thanks for confirming!", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8 flex-grow w-full">
      <nav className="flex items-center gap-1.5 text-xs text-outline font-medium mb-4">
        <Link to="/" className="hover:text-secondary">Home</Link>
        <Icon name="chevron_right" className="text-xs text-outline" />
        <span className="text-on-surface font-semibold">My Orders</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight">My Orders</h1>
        <Link to="/products" className="text-sm font-bold text-secondary hover:underline">
          Continue Shopping
        </Link>
      </div>

      {loading ? (
        <ListRowsSkeleton rows={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="shopping_bag"
          title="No orders yet"
          subtitle="When you place an order, it will show up here so you can track its status."
          action={
            <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold shadow-sm hover:bg-secondary-container transition">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl border border-outline-variant/30 p-5 sm:p-6 shadow-xs hover:border-secondary/40 hover:shadow-sm transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Icon name="shopping_bag" className="text-lg" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-base text-on-surface">#{order.orderNumber}</span>
                    <p className="text-sm text-outline">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="py-3.5 space-y-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="flex items-center gap-3">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 aspect-square object-cover rounded-xl bg-surface dark:bg-slate-700/50 shrink-0 border border-outline-variant/30"
                    />
                    <span className="font-semibold text-on-surface text-base truncate flex-1 min-w-0">
                      {item.name}
                    </span>
                    <span className="text-outline text-sm shrink-0">&times; {item.quantity}</span>
                    <span className="font-mono font-bold text-base text-on-surface shrink-0 w-24 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-outline">+{order.items.length - 3} more item(s)</p>
                )}
              </div>

              {/* Order Progress + Track Dropdown */}
              <div className="pt-3 border-t border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Order progress</p>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    className="text-xs font-bold text-secondary hover:underline flex items-center gap-0.5"
                  >
                    <span>{expandedOrderId === order._id ? "Hide" : "Track order"}</span>
                    <Icon name={expandedOrderId === order._id ? "expand_less" : "expand_more"} className="text-sm" />
                  </button>
                </div>

                <div className="flex gap-1.5">
                  {ORDER_TRACK_STEPS.map((step, idx) => {
                    const reached = idx <= ORDER_TRACK_STEPS.indexOf(order.status);
                    return (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          order.status === "Cancelled"
                            ? "bg-rose-300 dark:bg-rose-800/70"
                            : reached
                              ? "bg-secondary"
                              : "bg-outline-variant/40"
                        }`}
                      />
                    );
                  })}
                </div>

                <p className="text-[11px] text-outline font-medium mt-1.5">
                  {order.status === "Cancelled"
                    ? "Order cancelled"
                    : `${order.status} • Step ${Math.min(ORDER_TRACK_STEPS.indexOf(order.status) + 1, ORDER_TRACK_STEPS.length)} of ${ORDER_TRACK_STEPS.length}`}
                </p>

                {expandedOrderId === order._id && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 animate-fade-up">
                    <OrderStatusTimeline order={order} />
                  </div>
                )}
              </div>

              {order.status === "Completed" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-secondary/5 border border-secondary/20 rounded-xl p-3.5">
                  <div>
                    <p className="text-sm font-bold text-on-surface">Received your order?</p>
                    <p className="text-xs text-outline">
                      {order.paymentMethod === "Cash on Delivery"
                        ? "Confirm you received it to settle your Cash on Delivery."
                        : "Confirm delivery so we can close your order."}
                      {getAutoReceiveLabel(order) ? ` ${getAutoReceiveLabel(order)}.` : " Auto-marking now."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirmReceived(order)}
                    disabled={confirmingId === order._id}
                    className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold shadow-sm hover:bg-secondary-container transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    {confirmingId === order._id && <Icon name="loader" className="text-sm animate-spin" />}
                    <span>Confirm Received</span>
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <span className="text-outline text-sm">Total: </span>
                    <span className="font-black text-on-surface text-lg">${order.total.toFixed(2)}</span>
                    <span className="text-outline text-sm"> &bull; {order.paymentMethod}</span>
                  </div>
                  {order.status === "Received" && (
                    <Link
                      to={order.items[0]?.productId ? `/product/${order.items[0].productId}` : "/products"}
                      className="text-sm font-bold text-secondary hover:underline"
                    >
                      Reorder
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold shadow-sm hover:bg-secondary-container transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onConfirmReceived={selectedOrder ? () => handleConfirmReceived(selectedOrder) : undefined}
        confirming={confirmingId !== null}
        footer={
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs"
          >
            Close
          </button>
        }
      />
    </main>
  );
};
