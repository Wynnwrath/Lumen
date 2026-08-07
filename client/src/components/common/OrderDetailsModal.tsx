import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { OrderSummary } from "./OrderSummary";
import type { Order } from "../../types";
import { formatDate } from "../../utils/format";
import type { ReactNode } from "react";

// Shared "view order" modal: status/payment/address, items, and totals.
interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  footer?: ReactNode;
  titlePrefix?: string;
}

export const OrderDetailsModal = ({ order, onClose, footer, titlePrefix = "Order" }: OrderDetailsModalProps) => {
  if (!order) return null;
  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title={`${titlePrefix} #${order.orderNumber}`}
      subtitle={formatDate(order.createdAt)}
      className="max-w-lg"
      footer={footer}
    >
      <div className="space-y-3 text-xs">
        <div className="space-y-1.5 bg-surface dark:bg-slate-800/60 p-3 rounded-2xl border border-outline-variant/30">
          <p>
            <span className="text-outline font-semibold">Status:</span> <StatusBadge status={order.status} />
          </p>
          <p><span className="text-outline font-semibold">Payment:</span> {order.paymentMethod}</p>
          <p><span className="text-outline font-semibold">Address:</span> {order.address}</p>
          {order.orderNotes && (
            <p><span className="text-outline font-semibold">Notes:</span> {order.orderNotes}</p>
          )}
        </div>

        <div>
          <h4 className="font-bold text-on-surface mb-2">Items</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-surface dark:bg-slate-800/60 rounded-xl border border-outline-variant/20">
                <span className="font-semibold text-on-surface">{item.name} &times; {item.quantity}</span>
                <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <OrderSummary subtotal={order.subtotal} discount={order.discount} shipping={order.shipping} tax={order.tax} total={order.total} />
      </div>
    </Modal>
  );
};
