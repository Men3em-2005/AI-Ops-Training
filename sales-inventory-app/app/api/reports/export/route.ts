import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { toCsv, csvResponse } from "@/lib/csv";
import {
  getDailySales,
  getLowStock,
  getMovers,
  getBranchPerformance,
  getEmployeePerformance,
  getSupplierPerformance,
} from "@/lib/reports";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const branchId = session.role === "ADMIN" ? null : session.branchId;
  const type = request.nextUrl.searchParams.get("type");

  switch (type) {
    case "daily-sales":
      return csvResponse("daily-sales.csv", toCsv(await getDailySales(branchId)));
    case "low-stock":
      return csvResponse("low-stock.csv", toCsv(await getLowStock(branchId)));
    case "movers":
      return csvResponse("fast-slow-movers.csv", toCsv(await getMovers(branchId)));
    case "employee-performance":
      return csvResponse(
        "employee-performance.csv",
        toCsv(await getEmployeePerformance(branchId))
      );
    case "branch-performance":
      if (session.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
      return csvResponse("branch-performance.csv", toCsv(await getBranchPerformance()));
    case "supplier-performance":
      if (session.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
      return csvResponse("supplier-performance.csv", toCsv(await getSupplierPerformance()));
    default:
      return new Response("Unknown report type", { status: 400 });
  }
}
