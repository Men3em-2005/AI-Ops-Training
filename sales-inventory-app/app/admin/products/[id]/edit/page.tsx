import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field, SelectField } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { updateProduct } from "@/lib/actions/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Product" />
      <div className="max-w-lg rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <ActionForm action={action} submitLabel="Save Changes">
          <Field label="Name" name="name" defaultValue={product.name} required autoFocus />
          <SelectField label="Category" name="categoryId" required defaultValue={product.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <Field
            label="Unit Price"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.unitPrice}
            required
          />
          <Field
            label="Unit of Measure"
            name="unitOfMeasure"
            defaultValue={product.unitOfMeasure}
            required
          />
          <Field
            label="Default Minimum Stock (per branch)"
            name="defaultMinStock"
            type="number"
            min="0"
            defaultValue={product.defaultMinStock}
            required
          />
        </ActionForm>
      </div>
    </div>
  );
}
