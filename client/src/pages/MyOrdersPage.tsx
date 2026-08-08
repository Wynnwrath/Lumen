import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useCartStore } from "../stores/cart.store";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { getMyOrders, confirmOrderReceived } from "../api/orders";
import { getErrorMessage } from "../api/client";
import { useToast } from "../components/ui/ToastProvider";
import type { Order } from "../types";
import { Icon } from "../components/ui/Icon";
import { ProductImage } from "../components/ui/ProductImage";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { OrderDetailsModal } from "../components/customer/orders/OrderDetailsModal";
import { OrderStatusTimeline, ORDER_TRACK_STEPS } from "../components/customer/orders/OrderStatusTimeline";
import { ListRowsSkeleton } from "../components/ui/skeletons";
import { Button } from "../components/ui/Button";
import { formatDate, formatMoney } from "../utils/format";
import { isCompletedStatus } from "../constants";

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
  const { addItem } = useCartStore();
  const { products: catalogProducts } = useCatalogProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "not-completed">("all");
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

  // Client-side status filter: "Completed" and "Received" count as completed,
  // everything still in progress is "not completed yet".
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    const isDone = (status: Order["status"]) => isCompletedStatus(status);
    return orders.filter((o) => (statusFilter === "completed" ? isDone(o.status) : !isDone(o.status)));
  }, [orders, statusFilter]);

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

  // Re-adds every item from a past order back into the cart. Items that are no
  // longer available (or out of stock) are skipped so the rest still works.
  const handleReorder = (order: Order) => {
    let added = 0;
    order.items.forEach((item) => {
      const product = catalogProducts.find((p) => p._id === item.productId);
      if (product && product.stock > 0) {
        addItem(product, item.quantity);
        added += 1;
      }
    });
    if (added > 0) {
      showToast(`Added ${added} item${added === 1 ? "" : "s"} back to your cart`, "success");
      navigate("/cart");
    } else {
      showToast("These items are no longer available.", "error");
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8 flex-grow w-full">
      <nav className="flex items-center gap-1.5 text-xs text-outline font-medium mb-4">
        <Link to="/" className="hover:text-secondary">Home</Link>
        <Icon name="chevron_right" className="text-xs text-outline" />
        <span className="text-on-surface font-semibold">My Orders</span>
      </nav>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight">My Orders</h1>

        <div className="flex items-center gap-1.5">
          {([
            ["all", "All"],
            ["completed", "Completed"],
            ["not-completed", "Not Completed"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === value
                  ? "bg-secondary text-white shadow-sm"
                  : "bg-surface-container-low dark:bg-slate-800 text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ListRowsSkeleton rows={4} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon="shopping_bag"
          title={orders.length === 0 ? "No orders yet" : "No orders in this status"}
          subtitle={
            orders.length === 0
              ? "When you place an order, it will show up here so you can track its status."
              : "Try a different filter to see more of your orders."
          }
          action={
            <Button to="/products" variant="secondary">
              Browse Products
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
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

              <div className="py-3.5">
                <div className={`space-y-3 ${order.items.length > 3 ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
                  {order.items.map((item) => (
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
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
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
                  <Button
                    variant="secondary"
                    loading={confirmingId === order._id}
                    onClick={() => handleConfirmReceived(order)}
                  >
                    Confirm Received
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <span className="text-outline text-sm">Total: </span>
                    <span className="font-black text-on-surface text-lg">{formatMoney(order.total)}</span>
                    <span className="text-outline text-sm"> &bull; {order.paymentMethod}</span>
                  </div>
                  {order.status === "Received" && (
                    <button
                      onClick={() => handleReorder(order)}
                      className="text-sm font-bold text-secondary hover:underline"
                    >
                      Reorder
                    </button>
                  )}
                </div>
                <Button variant="secondary" onClick={() => setSelectedOrder(order)}>
                  View Details
                </Button>
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
