import { updateStockThreshold } from "@/lib/actions/inventory";
import { card, tdClass, thClass, trClass } from "@/app/components/ui";

interface Row {
  id: string;
  quantity: number;
  minStock: number;
  product: { name: string; unitOfMeasure: string };
  branch: { name: string };
}

export default function InventoryTable({
  stock,
  showBranch,
  editable,
}: {
  stock: Row[];
  showBranch: boolean;
  editable: boolean;
}) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full">
        <thead>
          <tr>
            <th className={thClass}>Product</th>
            {showBranch && <th className={thClass}>Branch</th>}
            <th className={thClass}>On Hand</th>
            <th className={thClass}>Min Stock</th>
            <th className={thClass}>Status</th>
            {editable && <th className={thClass}></th>}
          </tr>
        </thead>
        <tbody>
          {stock.map((s) => {
            const low = s.quantity < s.minStock;
            return (
              <tr key={s.id} className={trClass}>
                <td className={tdClass}>
                  {s.product.name}
                  <span className="text-slate-400"> ({s.product.unitOfMeasure})</span>
                </td>
                {showBranch && <td className={tdClass}>{s.branch.name}</td>}
                <td className={tdClass}>{s.quantity}</td>
                <td className={tdClass}>{s.minStock}</td>
                <td className={tdClass}>
                  {low ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Low stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                      OK
                    </span>
                  )}
                </td>
                {editable && (
                  <td className={tdClass}>
                    <form
                      action={updateStockThreshold.bind(null, s.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="number"
                        name="minStock"
                        min={0}
                        defaultValue={s.minStock}
                        className="w-20 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            );
          })}
          {stock.length === 0 && (
            <tr>
              <td className={tdClass} colSpan={showBranch ? 5 : 4}>
                No stock records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
