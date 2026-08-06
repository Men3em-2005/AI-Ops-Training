import Link from "next/link";
import StatusBadge from "@/app/components/StatusBadge";
import { card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

interface Row {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  branch: { name: string };
  employee: { name: string };
  customer: { name: string } | null;
}

export default function SalesTable({
  sales,
  basePath,
  showBranch,
}: {
  sales: Row[];
  basePath: string;
  showBranch: boolean;
}) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full">
        <thead>
          <tr>
            <th className={thClass}>Date</th>
            {showBranch && <th className={thClass}>Branch</th>}
            <th className={thClass}>Employee</th>
            <th className={thClass}>Customer</th>
            <th className={thClass}>Total</th>
            <th className={thClass}>Status</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className={trClass}>
              <td className={tdClass}>{s.createdAt.toLocaleString()}</td>
              {showBranch && <td className={tdClass}>{s.branch.name}</td>}
              <td className={tdClass}>{s.employee.name}</td>
              <td className={tdClass}>{s.customer?.name ?? "Walk-in"}</td>
              <td className={tdClass}>${s.total.toFixed(2)}</td>
              <td className={tdClass}>
                <StatusBadge status={s.status} />
              </td>
              <td className={tdClass}>
                <Link href={`${basePath}/${s.id}`} className={linkClass}>
                  View
                </Link>
              </td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr>
              <td className={tdClass} colSpan={showBranch ? 7 : 6}>
                No sales yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
