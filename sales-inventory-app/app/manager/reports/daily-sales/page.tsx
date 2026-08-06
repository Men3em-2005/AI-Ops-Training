import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getDailySales } from "@/lib/reports";

export default async function ManagerDailySalesReportPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const rows = await getDailySales(session.branchId);

  return (
    <div>
      <PageHeader
        title="Daily Sales"
        description="Your branch's sales by day, last 30 days."
        action={<ExportLink type="daily-sales" />}
      />
      <ReportTable
        columns={[
          { key: "date", label: "Date" },
          { key: "count", label: "Sales Count" },
          { key: "total", label: "Total ($)" },
        ]}
        rows={rows.map((r) => ({ ...r, total: r.total.toFixed(2) }))}
      />
    </div>
  );
}
