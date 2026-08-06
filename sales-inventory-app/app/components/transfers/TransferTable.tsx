import Link from "next/link";
import StatusBadge from "@/app/components/StatusBadge";
import { card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

interface Row {
  id: string;
  status: string;
  createdAt: Date;
  fromBranch: { name: string };
  toBranch: { name: string };
  items: { quantity: number }[];
}

export default function TransferTable({
  transfers,
  basePath,
}: {
  transfers: Row[];
  basePath: string;
}) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full">
        <thead>
          <tr>
            <th className={thClass}>From</th>
            <th className={thClass}>To</th>
            <th className={thClass}>Lines</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Requested</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id} className={trClass}>
              <td className={tdClass}>{t.fromBranch.name}</td>
              <td className={tdClass}>{t.toBranch.name}</td>
              <td className={tdClass}>{t.items.length}</td>
              <td className={tdClass}>
                <StatusBadge status={t.status} />
              </td>
              <td className={tdClass}>{t.createdAt.toLocaleDateString()}</td>
              <td className={tdClass}>
                <Link href={`${basePath}/${t.id}`} className={linkClass}>
                  View
                </Link>
              </td>
            </tr>
          ))}
          {transfers.length === 0 && (
            <tr>
              <td className={tdClass} colSpan={6}>
                No stock transfers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
