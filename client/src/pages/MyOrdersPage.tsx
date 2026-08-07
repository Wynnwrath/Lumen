import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { getMyOrders } from "../api/orders";
import type { Order } from "../types";
import { Icon } from "../components/common/Icon";
import { StatusBadge, getStatusColorClass } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { OrderDetailsModal } from "../components/common/OrderDetailsModal";
import { ListRowsSkeleton } from "../components/common/skeletons";
import { formatDate } from "../utils/format";

// "My Orders" for a logged-in customer: list + order details modal.
export const MyOrdersPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  return (
    <main className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8 flex-grow w-full">
      <nav className="flex items-center gap-1.5 text-xs text-outline font-medium mb-4">
        <Link to="/" className="hover:text-secondary">Home</Link>
        <Icon name="chevron_right" className="text-xs text-outline" />
        <span className="text-on-surface font-semibold">My Orders</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight">My Orders</h1>
        <Link to="/products" className="text-xs font-bold text-secondary hover:underline">
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
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl border border-outline-variant/30 p-4 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                <div>
                  <span className="font-mono font-black text-sm text-on-surface">#{order.orderNumber}</span>
                  <p className="text-[11px] text-outline">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="py-3 space-y-2">
                {order.items.slice(0, 3).map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface truncate max-w-[200px]">
                      {item.name} <span className="text-outline">&times; {item.quantity}</span>
                    </span>
                    <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-[11px] text-outline">+{order.items.length - 3} more item(s)</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
                <div className="text-xs">
                  <span className="text-outline">Total: </span>
                  <span className="font-black text-on-surface text-sm">${order.total.toFixed(2)}</span>
                  <span className="text-outline"> &bull; {order.paymentMethod}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${getStatusColorClass(order.status)}`}
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
