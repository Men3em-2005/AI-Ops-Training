import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getEmployeePerformance } from "@/lib/reports";

export default async function ManagerEmployeePerformanceReportPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const rows = await getEmployeePerformance(session.branchId);

  return (
    <div>
      <PageHeader
        title="Employee Performance"
        description="Sales contribution by your staff, last 30 days, ranked by total sales."
        action={<ExportLink type="employee-performance" />}
      />
      <ReportTable
        columns={[
          { key: "employeeName", label: "Employee" },
          { key: "salesCount", label: "Sales Count" },
          { key: "salesTotal", label: "Sales Total ($)" },
        ]}
        rows={rows.map((r) => ({ ...r, salesTotal: r.salesTotal.toFixed(2) }))}
      />
    </div>
  );
}
