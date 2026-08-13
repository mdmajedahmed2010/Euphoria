"use server";

/**
 * BIBAZ — Staff Management Server Actions
 * Handles RBAC (Role-Based Access Control) assignments
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function getStaffMembers() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, staff };
  } catch (error) {
    console.error("[STAFF] getStaffMembers error:", error);
    return { success: false, error: "Failed to fetch staff" };
  }
}

export async function assignRole(userId: string, newRole: string) {
  const session = await auth();
  const currentUserRole = (session?.user as { role?: string })?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(currentUserRole || "")) {
    return { success: false, error: "Unauthorized" };
  }

  const validRoles = ["CUSTOMER", "STAFF", "MANAGER"];
  if (newRole === "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
    return { success: false, error: "Only SUPER_ADMIN can assign ADMIN role" };
  }
  if (!validRoles.includes(newRole) && newRole !== "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
    return { success: false, error: "Invalid role assignment" };
  }

  try {
    // Prevent modifying SUPER_ADMIN unless you are SUPER_ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
      return { success: false, error: "Cannot modify SUPER_ADMIN" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as Role },
    });

    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          adminId: session.user.id,
          action: `ASSIGN_ROLE_${newRole}`,
          entity: "User",
          entityId: userId,
        },
      });
    }

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    console.error("[STAFF] assignRole error:", error);
    return { success: false, error: "Failed to assign role" };
  }
}

export async function searchUsersByEmail(emailQuery: string) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  if (emailQuery.length < 3) return { success: true, users: [] };

  try {
    const users = await prisma.user.findMany({
      where: {
        email: { contains: emailQuery },
        role: "CUSTOMER",
      },
      take: 5,
    });
    return { success: true, users };
  } catch {
    return { success: false, error: "Failed to search users" };
  }
}

export async function createStaffMember(data: {
  name: string;
  email: string;
  role: string;
  password?: string;
}) {
  const session = await auth();
  const currentUserRole = (session?.user as { role?: string })?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(currentUserRole || "")) {
    return { success: false, error: "Unauthorized" };
  }

  const validRoles = ["STAFF", "MANAGER"];
  if (data.role === "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
    return { success: false, error: "Only SUPER_ADMIN can create an ADMIN" };
  }
  if (!validRoles.includes(data.role) && data.role !== "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
    return { success: false, error: "Invalid role assignment" };
  }

  try {
    const emailLower = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return { success: false, error: "User with this email already exists" };
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : undefined;

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: emailLower,
        role: data.role as Role,
        passwordHash,
      },
    });

    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          adminId: session.user.id,
          action: `CREATE_STAFF_${data.role}`,
          entity: "User",
          entityId: newUser.id,
        },
      });
    }

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    console.error("[STAFF] createStaffMember error:", error);
    return { success: false, error: "Failed to create staff member" };
  }
}
