import { Icon } from "./Icon";
import type { Order, OrderStatus } from "../../types";
import { formatDate } from "../../utils/format";

// The forward progress of an order, in display order. "Received" is the final,
// customer-confirmed state (or auto-marked after the grace window).
export const ORDER_TRACK_STEPS: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Completed",
  "Received",
];

const STEP_ICONS: Record<string, string> = {
  Pending: "schedule",
  Confirmed: "check",
  Preparing: "inventory",
  Shipped: "local_shipping",
  Completed: "check_circle",
  Received: "verified",
};

// Vertical order-progress stepper used in the "Track order" dropdown.
export const OrderStatusTimeline = ({ order }: { order: Order }) => {
  const currentIndex = ORDER_TRACK_STEPS.indexOf(order.status);

  if (order.status === "Cancelled") {
    return (
      <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Icon name="block" className="text-lg" />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">Order Cancelled</p>
          <p className="text-xs text-outline">This order was cancelled and will not proceed further.</p>
        </div>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {ORDER_TRACK_STEPS.map((step, idx) => {
        const reached = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === ORDER_TRACK_STEPS.length - 1;
        const timestamp = step === "Completed" ? order.completedAt : step === "Received" ? order.receivedAt : undefined;

        const bubbleClasses = isCurrent
          ? "bg-secondary text-white border-secondary ring-4 ring-secondary/20"
          : reached
            ? "bg-emerald-500 text-white border-emerald-500"
            : "bg-surface-container-lowest text-outline border-outline-variant/60";

        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${bubbleClasses}`}>
                <Icon name={STEP_ICONS[step] || "check"} className="text-base" weight={reached ? "bold" : "regular"} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-6 ${reached ? "bg-emerald-500/70" : "bg-outline-variant/50"}`} />
              )}
            </div>
            <div className={`${isLast ? "pb-1" : "pb-6"}`}>
              <p className={`text-sm font-bold ${reached ? "text-on-surface" : "text-outline"}`}>{step}</p>
              {timestamp && (
                <p className="text-[11px] font-mono text-outline mt-0.5">
                  {formatDate(timestamp, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              {isCurrent && (
                <p className="text-[11px] text-secondary font-bold mt-0.5">Current status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
