import { prisma } from "@/lib/db";

const THIRTY_DAYS_AGO = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export async function getDailySales(branchId: string | null) {
  const sales = await prisma.sale.findMany({
    where: {
      status: { not: "CANCELLED" },
      createdAt: { gte: THIRTY_DAYS_AGO() },
      ...(branchId ? { branchId } : {}),
    },
    include: { branch: true },
  });

  const byKey = new Map<string, { date: string; branchName: string; count: number; total: number }>();
  for (const sale of sales) {
    const date = sale.createdAt.toISOString().slice(0, 10);
    const key = `${date}__${sale.branchId}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.total += sale.total;
    } else {
      byKey.set(key, { date, branchName: sale.branch.name, count: 1, total: sale.total });
    }
  }

  return [...byKey.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getLowStock(branchId: string | null) {
  const stock = await prisma.stock.findMany({
    where: {
      ...(branchId ? { branchId } : {}),
    },
    include: { product: true, branch: true },
  });

  return stock
    .filter((s) => s.quantity < s.minStock)
    .map((s) => ({
      branchName: s.branch.name,
      productName: s.product.name,
      quantity: s.quantity,
      minStock: s.minStock,
    }))
    .sort((a, b) => a.quantity - a.minStock - (b.quantity - b.minStock));
}

export async function getMovers(branchId: string | null) {
  const movements = await prisma.stockMovement.groupBy({
    by: ["productId"],
    where: { type: "SALE", ...(branchId ? { branchId } : {}) },
    _sum: { quantity: true },
  });

  const products = await prisma.product.findMany({ where: { active: true } });
  const soldMap = new Map(movements.map((m) => [m.productId, Math.abs(m._sum.quantity ?? 0)]));

  const rows = products.map((p) => ({
    productName: p.name,
    unitsSold: soldMap.get(p.id) ?? 0,
  }));
  rows.sort((a, b) => b.unitsSold - a.unitsSold);

  const withSales = rows.filter((r) => r.unitsSold > 0);
  const fastCutoff = withSales[Math.floor(withSales.length / 4)]?.unitsSold ?? 0;
  const slowCutoff = withSales[Math.floor((withSales.length * 3) / 4)]?.unitsSold ?? 0;

  return rows.map((r) => ({
    ...r,
    movement:
      r.unitsSold === 0
        ? "No sales"
        : r.unitsSold >= fastCutoff
        ? "Fast moving"
        : r.unitsSold <= slowCutoff
        ? "Slow moving"
        : "Normal",
  }));
}

export async function getBranchPerformance() {
  const [branches, sales, stock] = await Promise.all([
    prisma.branch.findMany({ where: { active: true } }),
    prisma.sale.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: THIRTY_DAYS_AGO() } },
    }),
    prisma.stock.findMany(),
  ]);

  return branches.map((b) => {
    const branchSales = sales.filter((s) => s.branchId === b.id);
    const lowStockCount = stock.filter((s) => s.branchId === b.id && s.quantity < s.minStock).length;
    return {
      branchName: b.name,
      salesCount: branchSales.length,
      salesTotal: branchSales.reduce((sum, s) => sum + s.total, 0),
      lowStockCount,
    };
  });
}

export async function getEmployeePerformance(branchId: string | null) {
  const sales = await prisma.sale.findMany({
    where: {
      status: { not: "CANCELLED" },
      createdAt: { gte: THIRTY_DAYS_AGO() },
      ...(branchId ? { branchId } : {}),
    },
    include: { employee: true, branch: true },
  });

  const byEmployee = new Map<
    string,
    { employeeName: string; branchName: string; salesCount: number; salesTotal: number }
  >();
  for (const sale of sales) {
    const existing = byEmployee.get(sale.employeeId);
    if (existing) {
      existing.salesCount += 1;
      existing.salesTotal += sale.total;
    } else {
      byEmployee.set(sale.employeeId, {
        employeeName: sale.employee.name,
        branchName: sale.branch.name,
        salesCount: 1,
        salesTotal: sale.total,
      });
    }
  }

  return [...byEmployee.values()].sort((a, b) => b.salesTotal - a.salesTotal);
}

export async function getSupplierPerformance() {
  const suppliers = await prisma.supplier.findMany({
    include: { purchaseOrders: true },
  });

  return suppliers.map((s) => {
    const totalOrders = s.purchaseOrders.length;
    const received = s.purchaseOrders.filter((po) => po.status === "RECEIVED");
    const avgLeadDays =
      received.length > 0
        ? received.reduce(
            (sum, po) => sum + (po.updatedAt.getTime() - po.createdAt.getTime()) / 86_400_000,
            0
          ) / received.length
        : null;
    const lateCount = s.purchaseOrders.filter(
      (po) =>
        po.expectedDate &&
        ["SENT", "PARTIALLY_RECEIVED"].includes(po.status) &&
        po.expectedDate.getTime() < Date.now()
    ).length;

    return {
      supplierName: s.name,
      totalOrders,
      receivedOrders: received.length,
      avgLeadDays: avgLeadDays !== null ? Math.round(avgLeadDays * 10) / 10 : null,
      lateCount,
    };
  });
}
