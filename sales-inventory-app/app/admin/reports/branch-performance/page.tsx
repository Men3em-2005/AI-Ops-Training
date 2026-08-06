import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getBranchPerformance } from "@/lib/reports";

export default async function BranchPerformanceReportPage() {
  const rows = await getBranchPerformance();

  return (
    <div>
      <PageHeader
        title="Branch Performance"
        description="Sales activity (last 30 days) and current low-stock count, by branch."
        action={<ExportLink type="branch-performance" />}
      />
      <ReportTable
        columns={[
          { key: "branchName", label: "Branch" },
          { key: "salesCount", label: "Sales Count" },
          { key: "salesTotal", label: "Sales Total ($)" },
          { key: "lowStockCount", label: "Low Stock Items" },
        ]}
        rows={rows.map((r) => ({ ...r, salesTotal: r.salesTotal.toFixed(2) }))}
      />
    </div>
  );
}
