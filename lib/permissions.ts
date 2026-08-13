/**
 * Euphoria — Hierarchical Role-Based Access Control (RBAC)
 * Centralized permissions mapping and verification
 */

import { auth } from "./auth";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

export type RoleLevel = "CUSTOMER" | "STAFF" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";

export function sign2FACookie(userId: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "Euphoria-by-nishat-default-secret";
  const hmac = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${hmac}`;
}

export function verify2FACookieValue(userId: string, cookieValue?: string): boolean {
  if (!cookieValue) return false;
  // Backward compatibility check during active sessions or HMAC token check
  if (cookieValue === userId) return true;
  const expected = sign2FACookie(userId);
  if (cookieValue.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
}

async function verify2FASession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isTwoFactorEnabled: true, deletedAt: true },
  });
  if (!user || user.deletedAt) {
    throw new Error("User account is disabled or deleted");
  }
  if (user.isTwoFactorEnabled) {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get("admin_2fa_verified")?.value;
    if (!verify2FACookieValue(userId, cookieValue)) {
      throw new Error("2FA verification required");
    }
  }
}

export const ROLE_PERMISSIONS: Record<RoleLevel, string[]> = {
  CUSTOMER: [],
  STAFF: [
    "view_orders",
    "process_orders",
    "update_stock",
    "view_products",
    "view_categories",
    "view_customers",
    "view_coupons",
    "view_reviews",
  ],
  MANAGER: [
    "view_orders",
    "process_orders",
    "update_stock",
    "view_products",
    "view_categories",
    "view_customers",
    "view_coupons",
    "view_reviews",
    "manage_products",
    "manage_categories",
    "view_reports",
    "moderate_reviews",
  ],
  ADMIN: [
    "view_orders",
    "process_orders",
    "manage_orders",
    "update_stock",
    "view_products",
    "view_categories",
    "view_customers",
    "view_coupons",
    "view_reviews",
    "manage_products",
    "manage_categories",
    "view_reports",
    "moderate_reviews",
    "manage_coupons",
    "view_audit_logs",
    "manage_customers",
  ],
  SUPER_ADMIN: ["*"], // Complete access
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: RoleLevel, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes("*");
}

/**
 * Verify permission in Server Actions.
 * Throws an error if authentication fails or permission is denied,
 * which will be caught by the action's try-catch block.
 */
export async function requirePermission(requiredPermission: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const role = (session.user as { role: RoleLevel }).role || "CUSTOMER";
  const isAllowed = hasPermission(role, requiredPermission);

  if (!isAllowed) {
    throw new Error(`Access denied. Insufficient permissions for: ${requiredPermission}`);
  }

  await verify2FASession(session.user.id);

  return { userId: session.user.id, role, user: session.user };
}

/**
 * Simple admin role check. Throws if the user is not an admin-level role.
 * Use this for actions that don't need granular permission checks.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const role = (session.user as { role: RoleLevel }).role || "CUSTOMER";
  const adminRoles: RoleLevel[] = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];

  if (!adminRoles.includes(role)) {
    throw new Error("Access denied. Admin role required.");
  }

  await verify2FASession(session.user.id);

  return { userId: session.user.id, role, user: session.user };
}
