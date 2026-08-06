import { card, tdClass, thClass, trClass } from "@/app/components/ui";

export default function ReportTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number | null>[];
}) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={thClass}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={trClass}>
              {columns.map((c) => (
                <td key={c.key} className={tdClass}>
                  {row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className={tdClass} colSpan={columns.length}>
                No data for this report yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
