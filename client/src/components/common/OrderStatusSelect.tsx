import type { OrderStatus } from "../../types";
import { ORDER_STATUSES } from "../../constants";

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
    {ORDER_STATUSES.map((st) => (
      <option key={st} value={st}>
        {st}
      </option>
    ))}
  </select>
);
