"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { canAccessBranch } from "@/lib/permissions";

export async function updateStockThreshold(stockId: string, formData: FormData) {
  const session = await requireRole("ADMIN", "MANAGER");
  const stock = await prisma.stock.findUniqueOrThrow({ where: { id: stockId } });

  if (!canAccessBranch(session, stock.branchId)) {
    throw new Error("You do not have access to this branch's inventory.");
  }

  const minStock = Number(formData.get("minStock"));
  if (!Number.isFinite(minStock) || minStock < 0) {
    throw new Error("Minimum stock must be a positive number.");
  }

  await prisma.stock.update({ where: { id: stockId }, data: { minStock } });

  const path =
    session.role === "ADMIN" ? "/admin/inventory" : "/manager/inventory";
  revalidatePath(path);
}
