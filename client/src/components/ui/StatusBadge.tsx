// Colored pill classes shared by the badge and the status dropdowns.
export const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/90 dark:text-emerald-200 dark:border-emerald-600 font-bold";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/90 dark:text-amber-200 dark:border-amber-600 font-bold";
    case "preparing":
      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/90 dark:text-purple-200 dark:border-purple-600 font-bold";
    case "cancelled":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/90 dark:text-rose-200 dark:border-rose-600 font-bold";
    case "received":
      return "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/90 dark:text-teal-200 dark:border-teal-600 font-bold";
    case "shipped":
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/90 dark:text-indigo-200 dark:border-indigo-600 font-bold";
    default:
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/90 dark:text-blue-200 dark:border-blue-600 font-bold";
  }
};

export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusClasses(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{status}</span>
    </span>
  );
};
