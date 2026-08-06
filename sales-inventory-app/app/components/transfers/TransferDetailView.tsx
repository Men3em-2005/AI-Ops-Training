import StatusBadge from "@/app/components/StatusBadge";
import { buttonDanger, buttonPrimary, card, tdClass, thClass, trClass } from "@/app/components/ui";
import { markInTransit, markCompleted, cancelTransfer } from "@/lib/actions/transfers";

interface TransferItem {
  id: string;
  quantity: number;
  product: { name: string; unitOfMeasure: string };
}

interface Transfer {
  id: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  fromBranch: { name: string };
  toBranch: { name: string };
  requestedBy: { name: string };
  items: TransferItem[];
}

export default function TransferDetailView({
  transfer,
  canShip,
  canReceive,
  canCancel,
}: {
  transfer: Transfer;
  canShip: boolean;
  canReceive: boolean;
  canCancel: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className={`${card} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Stock Transfer</p>
            <h2 className="text-lg font-bold">
              {transfer.fromBranch.name} → {transfer.toBranch.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Requested by {transfer.requestedBy.name}
            </p>
          </div>
          <StatusBadge status={transfer.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Requested</dt>
            <dd className="font-medium">{transfer.createdAt.toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Completed</dt>
            <dd className="font-medium">
              {transfer.completedAt ? transfer.completedAt.toLocaleDateString() : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex gap-3">
          {canShip && transfer.status === "REQUESTED" && (
            <form action={markInTransit.bind(null, transfer.id)}>
              <button type="submit" className={buttonPrimary}>
                Mark as Shipped
              </button>
            </form>
          )}
          {canReceive && transfer.status === "IN_TRANSIT" && (
            <form action={markCompleted.bind(null, transfer.id)}>
              <button type="submit" className={buttonPrimary}>
                Confirm Received
              </button>
            </form>
          )}
          {canCancel && (transfer.status === "REQUESTED" || transfer.status === "IN_TRANSIT") && (
            <form action={cancelTransfer.bind(null, transfer.id)}>
              <button type="submit" className={buttonDanger}>
                Cancel Transfer
              </button>
            </form>
          )}
        </div>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Product</th>
              <th className={thClass}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {transfer.items.map((item) => (
              <tr key={item.id} className={trClass}>
                <td className={tdClass}>
                  {item.product.name}
                  <span className="text-slate-400"> ({item.product.unitOfMeasure})</span>
                </td>
                <td className={tdClass}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
