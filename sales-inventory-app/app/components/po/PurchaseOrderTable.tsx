import Link from "next/link";
import StatusBadge from "@/app/components/StatusBadge";
import { card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

interface Row {
  id: string;
  status: string;
  createdAt: Date;
  expectedDate: Date | null;
  supplier: { name: string };
  branch: { name: string };
  items: { orderedQty: number; receivedQty: number }[];
}

export default function PurchaseOrderTable({
  purchaseOrders,
  basePath,
  showBranch,
}: {
  purchaseOrders: Row[];
  basePath: string;
  showBranch: boolean;
}) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full">
        <thead>
          <tr>
            <th className={thClass}>Supplier</th>
            {showBranch && <th className={thClass}>Branch</th>}
            <th className={thClass}>Lines</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Created</th>
            <th className={thClass}>Expected</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((po) => (
            <tr key={po.id} className={trClass}>
              <td className={tdClass}>{po.supplier.name}</td>
              {showBranch && <td className={tdClass}>{po.branch.name}</td>}
              <td className={tdClass}>{po.items.length}</td>
              <td className={tdClass}>
                <StatusBadge status={po.status} />
              </td>
              <td className={tdClass}>{po.createdAt.toLocaleDateString()}</td>
              <td className={tdClass}>
                {po.expectedDate ? po.expectedDate.toLocaleDateString() : "—"}
              </td>
              <td className={tdClass}>
                <Link href={`${basePath}/${po.id}`} className={linkClass}>
                  View
                </Link>
              </td>
            </tr>
          ))}
          {purchaseOrders.length === 0 && (
            <tr>
              <td className={tdClass} colSpan={showBranch ? 7 : 6}>
                No purchase orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
