import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { OrderSummary } from "./OrderSummary";
import { Icon } from "./Icon";
import type { Order } from "../../types";
import { formatDate, formatMoney } from "../../utils/format";
import type { ReactNode } from "react";

// Shared "view order" modal: status/payment/address, items, and totals.
interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  footer?: ReactNode;
  titlePrefix?: string;
  onConfirmReceived?: () => void;
  confirming?: boolean;
}

export const OrderDetailsModal = ({ order, onClose, footer, titlePrefix = "Order", onConfirmReceived, confirming }: OrderDetailsModalProps) => {
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
      <div className="space-y-3 text-sm">
        <div className="space-y-1.5 bg-surface dark:bg-slate-800/60 p-3.5 rounded-2xl border border-outline-variant/30">
          <p>
            <span className="text-outline font-semibold">Status:</span> <StatusBadge status={order.status} />
          </p>
          <p><span className="text-outline font-semibold">Payment:</span> {order.paymentMethod}</p>
          <p><span className="text-outline font-semibold">Address:</span> {order.address}</p>
          {order.orderNotes && (
            <p><span className="text-outline font-semibold">Notes:</span> {order.orderNotes}</p>
          )}
        </div>

        {order.status === "Completed" && onConfirmReceived && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-secondary/5 border border-outline-variant/20 rounded-xl p-3.5">
            <div>
              <p className="font-bold text-on-surface text-sm">Received your order?</p>
              <p className="text-xs text-outline">
                {order.paymentMethod === "Cash on Delivery"
                  ? "Confirm you received it to settle your Cash on Delivery."
                  : "Confirm delivery so we can close your order."}
              </p>
            </div>
            <button
              onClick={onConfirmReceived}
              disabled={confirming}
              className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-bold hover:bg-secondary-container transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              {confirming && <Icon name="loader" className="text-sm animate-spin" />}
              <span>Confirm Received</span>
            </button>
          </div>
        )}

        <div>
          <h4 className="font-bold text-on-surface mb-2">Items</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-surface dark:bg-slate-800/60 rounded-xl border border-outline-variant/20">
                <span className="font-semibold text-on-surface">{item.name} &times; {item.quantity}</span>
                <span className="font-mono font-bold">{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <OrderSummary subtotal={order.subtotal} discount={order.discount} shipping={order.shipping} tax={order.tax} total={order.total} />
      </div>
    </Modal>
  );
};
