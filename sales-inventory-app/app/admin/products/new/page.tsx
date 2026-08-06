import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field, SelectField } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { createProduct } from "@/lib/actions/products";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New Product" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={createProduct} submitLabel="Create Product">
          <Field label="Name" name="name" required autoFocus />
          <SelectField label="Category" name="categoryId" required defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <Field label="Unit Price" name="unitPrice" type="number" step="0.01" min="0" required />
          <Field label="Unit of Measure" name="unitOfMeasure" placeholder="e.g. each, box, kg" required />
          <Field
            label="Default Minimum Stock (per branch)"
            name="defaultMinStock"
            type="number"
            min="0"
            defaultValue={10}
            required
          />
        </ActionForm>
      </div>
    </div>
  );
}
