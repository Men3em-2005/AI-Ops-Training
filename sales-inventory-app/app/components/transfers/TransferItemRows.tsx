const ROWS = 8;

export default function TransferItemRows({
  products,
}: {
  products: { id: string; name: string; unitOfMeasure: string }[];
}) {
  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Product Lines
      </p>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Choose a product and quantity for each line you need. Leave unused rows blank.
      </p>
      <div className="space-y-2">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <select
              name="productId"
              defaultValue=""
              className="col-span-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
            >
              <option value="">—</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unitOfMeasure})
                </option>
              ))}
            </select>
            <input
              type="number"
              name="quantity"
              min={0}
              placeholder="Qty"
              className="col-span-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
