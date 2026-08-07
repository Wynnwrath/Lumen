import type { OrderStatus } from "../../types";
import { ADMIN_ORDER_STATUSES } from "../../constants";

// Dropdown of the 6 admin-selectable order statuses, used in admin pages.
// "Received" is customer-driven, so it's not offered here.
interface OrderStatusSelectProps {
  value: OrderStatus | string;
  onChange: (status: OrderStatus) => void;
  className?: string;
}

export const OrderStatusSelect = ({ value, onChange, className }: OrderStatusSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as OrderStatus)}
    className={className}
  >
    {/* Non-admin statuses (e.g. "Received") render read-only so the dropdown
        isn't blank, but can't be selected. */}
    {value !== "all" && !ADMIN_ORDER_STATUSES.includes(value as OrderStatus) && (
      <option value={value} disabled>
        {value}
      </option>
    )}
    {ADMIN_ORDER_STATUSES.map((st) => (
      <option key={st} value={st}>
        {st}
      </option>
    ))}
  </select>
);
