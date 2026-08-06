"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { canAccessBranch, resolveBranchId } from "@/lib/permissions";
import type { ActionState } from "@/lib/types";

function rolePath(session: { role: string }) {
  return session.role === "ADMIN"
    ? "/admin/purchase-orders"
    : session.role === "MANAGER"
    ? "/manager/purchase-orders"
    : "/staff/purchase-orders";
}

function deriveStatus(items: { orderedQty: number; receivedQty: number }[], current: string) {
  if (current === "CANCELLED") return "CANCELLED";
  const totalOrdered = items.reduce((s, i) => s + i.orderedQty, 0);
  const totalReceived = items.reduce((s, i) => s + i.receivedQty, 0);
  if (totalReceived <= 0) return current === "DRAFT" ? "DRAFT" : "SENT";
  if (totalReceived >= totalOrdered) return "RECEIVED";
  return "PARTIALLY_RECEIVED";
}

export async function createPurchaseOrder(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");

  const supplierId = String(formData.get("supplierId") ?? "");
  if (!supplierId) return { error: "Choose a supplier." };

  let branchId: string;
  try {
    branchId = resolveBranchId(session, String(formData.get("branchId") ?? ""));
  } catch (e) {
    return { error: (e as Error).message };
  }

  const productIds = formData.getAll("productId").map(String);
  const orderedQtys = formData.getAll("orderedQty").map(Number);
  const unitCosts = formData.getAll("unitCost").map(Number);

  const items = productIds
    .map((productId, i) => ({
      productId,
      orderedQty: orderedQtys[i],
      unitCost: unitCosts[i],
    }))
    .filter((i) => i.productId && i.orderedQty > 0);

  if (items.length === 0) return { error: "Add at least one product line with a quantity." };
  if (items.some((i) => !Number.isFinite(i.unitCost) || i.unitCost < 0)) {
    return { error: "Unit cost must be a positive number for every line." };
  }

  const expectedDateRaw = String(formData.get("expectedDate") ?? "");

  const po = await prisma.purchaseOrder.create({
    data: {
      branchId,
      supplierId,
      createdById: session.userId,
      status: "DRAFT",
      expectedDate: expectedDateRaw ? new Date(expectedDateRaw) : null,
      items: { create: items },
    },
  });

  revalidatePath(rolePath(session));
  redirect(`${rolePath(session)}/${po.id}`);
}

export async function sendPurchaseOrder(id: string) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const po = await prisma.purchaseOrder.findUniqueOrThrow({ where: { id } });
  if (!canAccessBranch(session, po.branchId)) {
    throw new Error("You do not have access to this purchase order.");
  }
  if (po.status !== "DRAFT") {
    throw new Error("Only draft purchase orders can be sent.");
  }

  await prisma.purchaseOrder.update({ where: { id }, data: { status: "SENT" } });
  revalidatePath(`${rolePath(session)}/${id}`);
}

export async function cancelPurchaseOrder(id: string) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const po = await prisma.purchaseOrder.findUniqueOrThrow({ where: { id } });
  if (!canAccessBranch(session, po.branchId)) {
    throw new Error("You do not have access to this purchase order.");
  }
  if (po.status !== "DRAFT" && po.status !== "SENT") {
    throw new Error("Only draft or sent purchase orders can be cancelled.");
  }

  await prisma.purchaseOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath(`${rolePath(session)}/${id}`);
}

export async function receiveDelivery(id: string, formData: FormData) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const po = await prisma.purchaseOrder.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });
  if (!canAccessBranch(session, po.branchId)) {
    throw new Error("You do not have access to this purchase order.");
  }
  if (po.status !== "SENT" && po.status !== "PARTIALLY_RECEIVED") {
    throw new Error("This purchase order is not awaiting delivery.");
  }

  const updates = po.items
    .map((item) => {
      const raw = Number(formData.get(`receive_${item.id}`) ?? 0);
      const remaining = item.orderedQty - item.receivedQty;
      const amount = Math.max(0, Math.min(raw, remaining));
      return { item, amount };
    })
    .filter((u) => u.amount > 0);

  if (updates.length === 0) {
    throw new Error("Enter a received quantity greater than zero for at least one line.");
  }

  await prisma.$transaction(async (tx) => {
    for (const { item, amount } of updates) {
      await tx.purchaseOrderItem.update({
        where: { id: item.id },
        data: { receivedQty: { increment: amount } },
      });

      await tx.stock.upsert({
        where: { branchId_productId: { branchId: po.branchId, productId: item.productId } },
        create: { branchId: po.branchId, productId: item.productId, quantity: amount, minStock: 10 },
        update: { quantity: { increment: amount } },
      });

      await tx.stockMovement.create({
        data: {
          branchId: po.branchId,
          productId: item.productId,
          type: "PURCHASE_RECEIPT",
          quantity: amount,
          referenceId: po.id,
        },
      });
    }

    const freshItems = await tx.purchaseOrderItem.findMany({ where: { poId: po.id } });
    const nextStatus = deriveStatus(freshItems, po.status);
    await tx.purchaseOrder.update({ where: { id: po.id }, data: { status: nextStatus } });
  });

  revalidatePath(`${rolePath(session)}/${id}`);
}
