import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field, SelectField } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { createEmployee } from "@/lib/actions/employees";

export default async function NewEmployeePage() {
  const branches = await prisma.branch.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New Employee" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={createEmployee} submitLabel="Create Employee">
          <Field label="Full Name" name="name" required autoFocus />
          <Field label="Email" name="email" type="email" required />
          <Field label="Temporary Password" name="password" type="password" minLength={8} required />
          <SelectField label="Role" name="role" required defaultValue="STAFF">
            <option value="ADMIN">Administrator</option>
            <option value="MANAGER">Branch Manager</option>
            <option value="STAFF">Staff</option>
          </SelectField>
          <SelectField label="Branch (not required for Administrators)" name="branchId" defaultValue="">
            <option value="">No branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectField>
        </ActionForm>
      </div>
    </div>
  );
}
