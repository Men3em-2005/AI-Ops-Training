import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getEmployeePerformance } from "@/lib/reports";

export default async function EmployeePerformanceReportPage() {
  const rows = await getEmployeePerformance(null);

  return (
    <div>
      <PageHeader
        title="Employee Performance"
        description="Sales contribution by employee, last 30 days, ranked by total sales."
        action={<ExportLink type="employee-performance" />}
      />
      <ReportTable
        columns={[
          { key: "employeeName", label: "Employee" },
          { key: "branchName", label: "Branch" },
          { key: "salesCount", label: "Sales Count" },
          { key: "salesTotal", label: "Sales Total ($)" },
        ]}
        rows={rows.map((r) => ({ ...r, salesTotal: r.salesTotal.toFixed(2) }))}
      />
    </div>
  );
}
