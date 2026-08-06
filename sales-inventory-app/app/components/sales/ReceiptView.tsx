import StatusBadge from "@/app/components/StatusBadge";
import PrintButton from "@/app/components/PrintButton";
import { buttonDanger, card, tdClass, thClass, trClass } from "@/app/components/ui";
import { cancelSale, refundSale } from "@/lib/actions/sales";

interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: { name: string; unitOfMeasure: string };
}

interface Sale {
  id: string;
  status: string;
  discount: number;
  subtotal: number;
  total: number;
  resolutionReason: string | null;
  createdAt: Date;
  branch: { name: string; location: string };
  employee: { name: string };
  customer: { name: string; phone: string } | null;
  items: SaleItem[];
}

export default function ReceiptView({
  sale,
  canCancel,
  canRefund,
}: {
  sale: Sale;
  canCancel: boolean;
  canRefund: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className={`${card} p-6`} id="receipt">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">BrightWay Retail Group</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sale.branch.name} · {sale.branch.location}
            </p>
          </div>
          <StatusBadge status={sale.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Date</dt>
            <dd className="font-medium">{sale.createdAt.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Served by</dt>
            <dd className="font-medium">{sale.employee.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Customer</dt>
            <dd className="font-medium">
              {sale.customer ? `${sale.customer.name} (${sale.customer.phone})` : "Walk-in"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Receipt No.</dt>
            <dd className="font-medium">{sale.id.slice(-8).toUpperCase()}</dd>
          </div>
        </dl>

        <table className="mt-6 w-full">
          <thead>
            <tr>
              <th className={thClass}>Product</th>
              <th className={thClass}>Qty</th>
              <th className={thClass}>Unit Price</th>
              <th className={thClass}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className={trClass}>
                <td className={tdClass}>
                  {item.product.name}
                  <span className="text-slate-400"> ({item.product.unitOfMeasure})</span>
                </td>
                <td className={tdClass}>{item.quantity}</td>
                <td className={tdClass}>${item.unitPrice.toFixed(2)}</td>
                <td className={tdClass}>${item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={trClass}>
              <td className={tdClass} colSpan={3}>
                Subtotal
              </td>
              <td className={tdClass}>${sale.subtotal.toFixed(2)}</td>
            </tr>
            <tr className={trClass}>
              <td className={tdClass} colSpan={3}>
                Discount
              </td>
              <td className={tdClass}>-${sale.discount.toFixed(2)}</td>
            </tr>
            <tr className={trClass}>
              <td className={tdClass} colSpan={3}>
                <strong>Total</strong>
              </td>
              <td className={tdClass}>
                <strong>${sale.total.toFixed(2)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>

        {sale.resolutionReason && (
          <p className="mt-4 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
            <strong>{sale.status} reason:</strong> {sale.resolutionReason}
          </p>
        )}
      </div>

      <div className="print:hidden flex flex-wrap items-start gap-4">
        <PrintButton />

        {canCancel && (
          <form action={cancelSale.bind(null, sale.id)} className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                Cancel reason (optional)
              </label>
              <input
                type="text"
                name="reason"
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
              />
            </div>
            <button type="submit" className={buttonDanger}>
              Cancel Sale
            </button>
          </form>
        )}

        {canRefund && (
          <form action={refundSale.bind(null, sale.id)} className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                Refund reason (required)
              </label>
              <input
                type="text"
                name="reason"
                required
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
              />
            </div>
            <button type="submit" className={buttonDanger}>
              Refund Sale
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
