const STYLES: Record<string, string> = {
  // Purchase orders
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  PARTIALLY_RECEIVED: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  RECEIVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  // Stock transfers
  REQUESTED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_TRANSIT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  // Sales
  REFUNDED: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  // Shared
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  INACTIVE: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export default function StatusBadge({ status }: { status: string }) {
  const className = STYLES[status] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
