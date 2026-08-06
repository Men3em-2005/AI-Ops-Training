export default function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClasses =
    tone === "danger"
      ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950"
      : tone === "warning"
      ? "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950"
      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
