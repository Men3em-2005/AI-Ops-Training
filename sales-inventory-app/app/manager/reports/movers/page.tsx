import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getMovers } from "@/lib/reports";

export default async function ManagerMoversReportPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const rows = await getMovers(session.branchId);

  return (
    <div>
      <PageHeader
        title="Fast / Slow Movers"
        description="Units sold per product at your branch, with a fast/slow classification."
        action={<ExportLink type="movers" />}
      />
      <ReportTable
        columns={[
          { key: "productName", label: "Product" },
          { key: "unitsSold", label: "Units Sold" },
          { key: "movement", label: "Movement" },
        ]}
        rows={rows}
      />
    </div>
  );
}
