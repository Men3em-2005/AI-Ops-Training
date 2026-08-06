"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

function parseProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const unitPrice = Number(formData.get("unitPrice"));
  const unitOfMeasure = String(formData.get("unitOfMeasure") ?? "").trim();
  const defaultMinStock = Number(formData.get("defaultMinStock"));

  if (!name) return { error: "Product name is required." };
  if (!categoryId) return { error: "Choose a category." };
  if (!unitOfMeasure) return { error: "Unit of measure is required." };
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return { error: "Unit price must be a positive number." };
  }
  if (!Number.isFinite(defaultMinStock) || defaultMinStock < 0) {
    return { error: "Minimum stock must be a positive number." };
  }

  return { data: { name, categoryId, unitPrice, unitOfMeasure, defaultMinStock } };
}

export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseProductForm(formData);
  if ("error" in parsed) return parsed;

  const branches = await prisma.branch.findMany({ where: { active: true } });

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data: parsed.data });
    if (branches.length > 0) {
      await tx.stock.createMany({
        data: branches.map((b) => ({
          branchId: b.id,
          productId: product.id,
          quantity: 0,
          minStock: parsed.data.defaultMinStock,
        })),
      });
    }
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseProductForm(formData);
  if ("error" in parsed) return parsed;

  await prisma.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProductActive(id: string) {
  await requireRole("ADMIN");
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({
    where: { id },
    data: { active: !product.active },
  });
  revalidatePath("/admin/products");
}
