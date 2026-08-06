import StatusBadge from "@/app/components/StatusBadge";
import { buttonDanger, buttonPrimary, buttonSecondary, card, tdClass, thClass, trClass } from "@/app/components/ui";
import { sendPurchaseOrder, cancelPurchaseOrder, receiveDelivery } from "@/lib/actions/purchaseOrders";

interface PoItem {
  id: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  product: { name: string; unitOfMeasure: string };
}

interface Po {
  id: string;
  status: string;
  createdAt: Date;
  expectedDate: Date | null;
  supplier: { name: string; contactPerson: string; phone: string };
  branch: { name: string };
  createdBy: { name: string };
  items: PoItem[];
}

export default function PurchaseOrderDetailView({ po }: { po: Po }) {
  const canSend = po.status === "DRAFT";
  const canCancel = po.status === "DRAFT" || po.status === "SENT";
  const canReceive = po.status === "SENT" || po.status === "PARTIALLY_RECEIVED";

  const totalCost = po.items.reduce((s, i) => s + i.orderedQty * i.unitCost, 0);

  return (
    <div className="space-y-6">
      <div className={`${card} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Purchase Order</p>
            <h2 className="text-lg font-bold">{po.supplier.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {po.supplier.contactPerson} · {po.supplier.phone}
            </p>
          </div>
          <StatusBadge status={po.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Branch</dt>
            <dd className="font-medium">{po.branch.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Created by</dt>
            <dd className="font-medium">{po.createdBy.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Created</dt>
            <dd className="font-medium">{po.createdAt.toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Expected</dt>
            <dd className="font-medium">
              {po.expectedDate ? po.expectedDate.toLocaleDateString() : "—"}
            </dd>
          </div>
        </dl>

        {(canSend || canCancel) && (
          <div className="mt-4 flex gap-3">
            {canSend && (
              <form action={sendPurchaseOrder.bind(null, po.id)}>
                <button type="submit" className={buttonPrimary}>
                  Send to Supplier
                </button>
              </form>
            )}
            {canCancel && (
              <form action={cancelPurchaseOrder.bind(null, po.id)}>
                <button type="submit" className={buttonDanger}>
                  Cancel Order
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className={`${card} overflow-x-auto`}>
        <form action={receiveDelivery.bind(null, po.id)}>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Product</th>
                <th className={thClass}>Ordered</th>
                <th className={thClass}>Received</th>
                <th className={thClass}>Remaining</th>
                <th className={thClass}>Unit Cost</th>
                <th className={thClass}>Line Total</th>
                {canReceive && <th className={thClass}>Receive Now</th>}
              </tr>
            </thead>
            <tbody>
              {po.items.map((item) => {
                const remaining = item.orderedQty - item.receivedQty;
                return (
                  <tr key={item.id} className={trClass}>
                    <td className={tdClass}>
                      {item.product.name}
                      <span className="text-slate-400"> ({item.product.unitOfMeasure})</span>
                    </td>
                    <td className={tdClass}>{item.orderedQty}</td>
                    <td className={tdClass}>{item.receivedQty}</td>
                    <td className={tdClass}>{remaining}</td>
                    <td className={tdClass}>${item.unitCost.toFixed(2)}</td>
                    <td className={tdClass}>${(item.orderedQty * item.unitCost).toFixed(2)}</td>
                    {canReceive && (
                      <td className={tdClass}>
                        {remaining > 0 ? (
                          <input
                            type="number"
                            name={`receive_${item.id}`}
                            min={0}
                            max={remaining}
                            defaultValue={0}
                            className="w-20 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="text-slate-400">done</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className={trClass}>
                <td className={tdClass} colSpan={5}>
                  <strong>Total</strong>
                </td>
                <td className={tdClass}>
                  <strong>${totalCost.toFixed(2)}</strong>
                </td>
                {canReceive && <td className={tdClass}></td>}
              </tr>
            </tfoot>
          </table>
          {canReceive && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-4">
              <button type="submit" className={buttonSecondary}>
                Record Delivery
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
