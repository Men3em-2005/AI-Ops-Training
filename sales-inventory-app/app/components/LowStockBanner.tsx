import Link from "next/link";

export default function LowStockBanner({
  count,
  href,
}: {
  count: number;
  href: string;
}) {
  if (count === 0) return null;

  return (
    <Link
      href={href}
      className="block rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900"
    >
      <strong className="font-semibold">{count}</strong>{" "}
      product{count === 1 ? "" : "s"} below minimum stock level. View low-stock report →
    </Link>
  );
}
