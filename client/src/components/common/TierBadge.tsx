// Small colored pill for a customer's membership tier. One component so the
// badge looks identical across the mobile list, desktop table, and profile modal.
export const TierBadge = ({ tier }: { tier: string }) => {
  const classes = tier.includes("VIP")
    ? "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
    : tier.includes("Pro")
      ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";

  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${classes}`}>{tier}</span>;
};
