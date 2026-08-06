import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getDailySales } from "@/lib/reports";

export default async function DailySalesReportPage() {
  const rows = await getDailySales(null);

  return (
    <div>
      <PageHeader
        title="Daily Sales"
        description="Sales grouped by day and branch, last 30 days."
        action={<ExportLink type="daily-sales" />}
      />
      <ReportTable
        columns={[
          { key: "date", label: "Date" },
          { key: "branchName", label: "Branch" },
          { key: "count", label: "Sales Count" },
          { key: "total", label: "Total ($)" },
        ]}
        rows={rows.map((r) => ({ ...r, total: r.total.toFixed(2) }))}
      />
    </div>
  );
}
