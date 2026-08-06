"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import type { ActionState, Role, SessionPayload } from "@/lib/types";
import { ROLES } from "@/lib/types";

function listPathFor(session: SessionPayload) {
  return session.role === "ADMIN" ? "/admin/employees" : "/manager/employees";
}

interface ParsedEmployee {
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
  password?: string;
}

async function parseEmployeeForm(
  session: SessionPayload,
  formData: FormData,
  { requirePassword }: { requirePassword: boolean }
): Promise<{ error: string } | { data: ParsedEmployee }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (requirePassword && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!requirePassword && password && password.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  if (session.role === "MANAGER") {
    if (!session.branchId) return { error: "Manager has no assigned branch." };
    return {
      data: { name, email, role: "STAFF", branchId: session.branchId, password: password || undefined },
    };
  }

  // ADMIN: role and branch are chosen explicitly.
  const role = String(formData.get("role") ?? "") as Role;
  if (!ROLES.includes(role)) return { error: "Choose a valid role." };

  const branchId = String(formData.get("branchId") ?? "") || null;
  if (role !== "ADMIN" && !branchId) {
    return { error: "Branch Manager and Staff must be assigned to a branch." };
  }

  return { data: { name, email, role, branchId, password: password || undefined } };
}

export async function createEmployee(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "MANAGER");
  const parsed = await parseEmployeeForm(session, formData, { requirePassword: true });
  if ("error" in parsed) return parsed;

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "A user with this email already exists." };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      branchId: parsed.data.branchId,
      passwordHash: await hashPassword(parsed.data.password!),
    },
  });

  revalidatePath(listPathFor(session));
  redirect(listPathFor(session));
}

export async function updateEmployee(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "MANAGER");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { error: "Employee not found." };

  if (session.role === "MANAGER") {
    if (target.role !== "STAFF" || target.branchId !== session.branchId) {
      return { error: "Managers can only edit staff in their own branch." };
    }
  }

  const parsed = await parseEmployeeForm(session, formData, { requirePassword: false });
  if ("error" in parsed) return parsed;

  if (parsed.data.email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return { error: "A user with this email already exists." };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      branchId: parsed.data.branchId,
      ...(parsed.data.password ? { passwordHash: await hashPassword(parsed.data.password) } : {}),
    },
  });

  revalidatePath(listPathFor(session));
  redirect(listPathFor(session));
}

export async function toggleEmployeeActive(id: string) {
  const session = await requireRole("ADMIN", "MANAGER");
  const target = await prisma.user.findUniqueOrThrow({ where: { id } });

  if (session.role === "MANAGER" && (target.role !== "STAFF" || target.branchId !== session.branchId)) {
    throw new Error("Managers can only manage staff in their own branch.");
  }

  await prisma.user.update({ where: { id }, data: { active: !target.active } });
  revalidatePath(listPathFor(session));
}
