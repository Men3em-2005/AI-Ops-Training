"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { canAccessBranch, canRefundSale } from "@/lib/permissions";
import type { ActionState } from "@/lib/types";

function rolePath(session: { role: string }) {
  return session.role === "ADMIN"
    ? "/admin/sales"
    : session.role === "MANAGER"
    ? "/manager/sales"
    : "/staff/sales";
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function createSale(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("MANAGER", "STAFF");
  const branchId = session.branchId;
  if (!branchId) return { error: "You have no assigned branch." };

  const discount = Number(formData.get("discount") ?? 0) || 0;
  if (discount < 0) return { error: "Discount cannot be negative." };

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  if (customerPhone && !customerName) {
    return { error: "Enter the customer's name along with their phone number." };
  }

  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map(Number);
  const items = productIds
    .map((productId, i) => ({ productId, quantity: quantities[i] }))
    .filter((i) => i.productId && i.quantity > 0);

  if (items.length === 0) return { error: "Add at least one product to the sale." };

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const stocks = await prisma.stock.findMany({
    where: { branchId, productId: { in: items.map((i) => i.productId) } },
  });

  for (const item of items) {
    const stock = stocks.find((s) => s.productId === item.productId);
    const product = products.find((p) => p.id === item.productId);
    if (!stock || stock.quantity < item.quantity) {
      return { error: `Not enough stock for ${product?.name ?? "one of the selected products"}.` };
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.unitPrice * item.quantity;
  }, 0);
  const total = Math.max(0, subtotal - discount);

  const sale = await prisma.$transaction(async (tx) => {
    let customerId: string | undefined;
    if (customerPhone) {
      const customer = await tx.customer.upsert({
        where: { phone: customerPhone },
        create: { name: customerName, phone: customerPhone },
        update: { name: customerName },
      });
      customerId = customer.id;
    }

    const createdSale = await tx.sale.create({
      data: {
        branchId,
        employeeId: session.userId,
        customerId,
        status: "COMPLETED",
        discount,
        subtotal,
        total,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.unitPrice,
              lineTotal: product.unitPrice * item.quantity,
            };
          }),
        },
      },
    });

    for (const item of items) {
      await tx.stock.update({
        where: { branchId_productId: { branchId, productId: item.productId } },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          branchId,
          productId: item.productId,
          type: "SALE",
          quantity: -item.quantity,
          referenceId: createdSale.id,
        },
      });
    }

    return createdSale;
  });

  revalidatePath(rolePath(session));
  redirect(`${rolePath(session)}/${sale.id}`);
}

export async function cancelSale(id: string, formData: FormData) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const sale = await prisma.sale.findUniqueOrThrow({ where: { id }, include: { items: true } });

  if (!canAccessBranch(session, sale.branchId)) {
    throw new Error("You do not have access to this sale.");
  }
  if (session.role === "STAFF") {
    if (sale.employeeId !== session.userId) {
      throw new Error("Staff can only cancel sales they recorded themselves.");
    }
    if (!isSameDay(sale.createdAt, new Date())) {
      throw new Error("Staff can only cancel a sale on the same day it was made. Ask a manager for a refund.");
    }
  }
  if (sale.status !== "COMPLETED") {
    throw new Error("Only completed sales can be cancelled.");
  }

  const reason = String(formData.get("reason") ?? "").trim() || null;

  await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      await tx.stock.update({
        where: { branchId_productId: { branchId: sale.branchId, productId: item.productId } },
        data: { quantity: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          branchId: sale.branchId,
          productId: item.productId,
          type: "ADJUSTMENT",
          quantity: item.quantity,
          referenceId: sale.id,
        },
      });
    }
    await tx.sale.update({ where: { id }, data: { status: "CANCELLED", resolutionReason: reason } });
  });

  revalidatePath(`${rolePath(session)}/${id}`);
}

export async function refundSale(id: string, formData: FormData) {
  const session = await requireRole("ADMIN", "MANAGER");
  const sale = await prisma.sale.findUniqueOrThrow({ where: { id }, include: { items: true } });

  if (!canRefundSale(session)) throw new Error("Only managers and administrators can process refunds.");
  if (!canAccessBranch(session, sale.branchId)) {
    throw new Error("You do not have access to this sale.");
  }
  if (sale.status !== "COMPLETED") {
    throw new Error("Only completed sales can be refunded.");
  }

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("A reason is required to process a refund.");

  await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      await tx.stock.update({
        where: { branchId_productId: { branchId: sale.branchId, productId: item.productId } },
        data: { quantity: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          branchId: sale.branchId,
          productId: item.productId,
          type: "ADJUSTMENT",
          quantity: item.quantity,
          referenceId: sale.id,
        },
      });
    }
    await tx.sale.update({ where: { id }, data: { status: "REFUNDED", resolutionReason: reason } });
  });

  revalidatePath(`${rolePath(session)}/${id}`);
}
