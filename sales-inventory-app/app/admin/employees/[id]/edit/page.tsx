import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field, SelectField } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { updateEmployee } from "@/lib/actions/employees";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, branches] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.branch.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!employee) notFound();

  const action = updateEmployee.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Employee" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={action} submitLabel="Save Changes">
          <Field label="Full Name" name="name" defaultValue={employee.name} required autoFocus />
          <Field label="Email" name="email" type="email" defaultValue={employee.email} required />
          <Field
            label="New Password"
            name="password"
            type="password"
            minLength={8}
            placeholder="Leave blank to keep current password"
          />
          <SelectField label="Role" name="role" required defaultValue={employee.role}>
            <option value="ADMIN">Administrator</option>
            <option value="MANAGER">Branch Manager</option>
            <option value="STAFF">Staff</option>
          </SelectField>
          <SelectField
            label="Branch (not required for Administrators)"
            name="branchId"
            defaultValue={employee.branchId ?? ""}
          >
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
