"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

function parseSupplierForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) return { error: "Supplier name is required." };
  if (!contactPerson) return { error: "Contact person is required." };
  if (!phone) return { error: "Phone number is required." };

  return { data: { name, contactPerson, phone } };
}

export async function createSupplier(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseSupplierForm(formData);
  if ("error" in parsed) return parsed;

  await prisma.supplier.create({ data: parsed.data });
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function updateSupplier(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseSupplierForm(formData);
  if ("error" in parsed) return parsed;

  await prisma.supplier.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function toggleSupplierActive(id: string) {
  await requireRole("ADMIN");
  const supplier = await prisma.supplier.findUniqueOrThrow({ where: { id } });
  await prisma.supplier.update({
    where: { id },
    data: { active: !supplier.active },
  });
  revalidatePath("/admin/suppliers");
}
