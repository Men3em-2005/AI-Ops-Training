"use client";

import { useActionState, useMemo, useState } from "react";
import { createSale } from "@/lib/actions/sales";
import type { ActionState } from "@/lib/types";
import { Field } from "@/app/components/FormField";
import { buttonPrimary, buttonSecondary } from "@/app/components/ui";

interface ProductOption {
  id: string;
  name: string;
  unitPrice: number;
  unitOfMeasure: string;
}

interface Line {
  key: number;
  productId: string;
  quantity: number;
}

let nextKey = 1;

export default function POSForm({ products }: { products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createSale, {});
  const [lines, setLines] = useState<Line[]>([{ key: nextKey++, productId: "", quantity: 1 }]);
  const [discount, setDiscount] = useState(0);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const subtotal = lines.reduce((sum, line) => {
    const product = productMap.get(line.productId);
    return product ? sum + product.unitPrice * line.quantity : sum;
  }, 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { key: nextKey++, productId: "", quantity: 1 }]);
  }

  function removeLine(key: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        {lines.map((line) => {
          const product = productMap.get(line.productId);
          return (
            <div key={line.key} className="grid grid-cols-12 items-center gap-2">
              <select
                name="productId"
                value={line.productId}
                onChange={(e) => updateLine(line.key, { productId: e.target.value })}
                className="col-span-6 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.unitPrice.toFixed(2)} / {p.unitOfMeasure}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                min={1}
                value={line.quantity}
                onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
                className="col-span-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
              />
              <span className="col-span-3 text-sm text-slate-600 dark:text-slate-400">
                {product ? `$${(product.unitPrice * line.quantity).toFixed(2)}` : "—"}
              </span>
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                className="col-span-1 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          );
        })}
        <button type="button" onClick={addLine} className={buttonSecondary}>
          + Add Line
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Customer Name (optional)" name="customerName" />
        <Field label="Customer Phone (optional)" name="customerPhone" />
      </div>

      <div className="flex items-end justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="w-40">
          <Field
            label="Discount ($)"
            name="discount"
            type="number"
            min={0}
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal: ${subtotal.toFixed(2)}</p>
          <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>
        </div>
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Recording sale..." : "Complete Sale"}
      </button>
    </form>
  );
}
