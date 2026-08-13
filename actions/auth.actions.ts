/**
 * BIBAZ — Authentication Server Actions
 * SOP §৪ — Authentication & Validation
 */

"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { sign2FACookie } from "@/lib/permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function registerUserAction(input: RegisterInput) {
  try {
    // Rate limit check
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const rateLimit = await checkRateLimit(ip, "register");
    if (!rateLimit.success) {
      return { success: false, error: "Too many registration attempts. Please try again later." };
    }

    // 1. Zod schema validation (Mandatory under SOP)
    const validated = registerSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid registration inputs.",
      };
    }

    const { name, email, phone, password } = validated.data;

    // 2. Check if user already exists by email
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }

    // 3. Check if user already exists by phone
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return {
          success: false,
          error: "An account with this phone number already exists.",
        };
      }
    }

    // 4. Hash password with bcrypt (SOP: 12 salt rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Create user in database (Prisma client)
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    return {
      success: true,
      message: "Your account has been created successfully. Redirecting...",
    };
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return {
      success: false,
      error: "Something went wrong on our end. Please try again later.",
    };
  }
}

// ═══════════════════════════════════════════
// FORGOT PASSWORD & RESET
// ═══════════════════════════════════════════

import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators/auth";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

/**
 * Forgot Password — sends reset link via email
 * Rate limited: 3 requests per hour per email
 */
export async function forgotPasswordAction(email: string) {
  try {
    const validated = forgotPasswordSchema.safeParse({ email });
    if (!validated.success) {
      return { success: false, error: "Invalid email address." };
    }

    // Rate limit check
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const rateLimit = await checkRateLimit(ip, "passwordReset");
    if (!rateLimit.success) {
      return { success: false, error: "Too many requests. Please try again later." };
    }

    const normalizedEmail = validated.data.email.toLowerCase();

    // Find user (don't reveal if email exists or not)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in verification_tokens table
      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires,
        },
      });

      // Send reset email
      const resetUrl = `${process.env.NEXTAUTH_URL || "https://majedahmed.space"}/reset-password?token=${token}&email=${normalizedEmail}`;

      await sendEmail({
        to: normalizedEmail,
        subject: "Reset Your Password — Dressly By Nishat",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="text-align: center; letter-spacing: 2px; color: #0a0a0a;">Dressly By Nishat</h1>
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    // Always return success (don't reveal if email exists)
    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    };
  } catch (err) {
    console.error("[AUTH] Forgot password error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Reset Password — validates token and sets new password
 */
export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    const validated = resetPasswordSchema.safeParse({ token, password: newPassword });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid input." };
    }

    // Find valid token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return { success: false, error: "Invalid or expired reset link. Please request a new one." };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(validated.data.password, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: verificationToken.identifier },
    });

    return { success: true, message: "Password reset successfully. You can now login." };
  } catch (err) {
    console.error("[AUTH] Reset password error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ═══════════════════════════════════════════
// ADMIN 2FA ACTIONS
// ═══════════════════════════════════════════

import { generateSecret, getOTPAuthURI, verifyTOTP } from "@/lib/totp";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Generate 2FA Secret Key and QR Code provisioning URI (Admin+)
 */
export async function generate2FASecretAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  const adminRoles = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];
  if (!adminRoles.includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const secret = generateSecret();
    const otpAuthURI = getOTPAuthURI(session.user.email || "admin@bibaz.com", secret);

    // Save secret to database temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    });

    return { success: true, secret, otpAuthURI };
  } catch (error) {
    console.error("[2FA] generate2FASecretAction error:", error);
    return { success: false, error: "Failed to generate 2FA secret" };
  }
}

/**
 * Enable 2FA after verifying the first token (Admin+)
 */
export async function enable2FAAction(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      return { success: false, error: "2FA secret not generated yet. Setup 2FA first." };
    }

    const isValid = verifyTOTP(user.twoFactorSecret, token);
    if (!isValid) {
      return { success: false, error: "Invalid verification code. Please try again." };
    }

    // Enable 2FA in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isTwoFactorEnabled: true },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "ENABLE_2FA",
        entity: "User",
        entityId: session.user.id,
      },
    });

    // Mark as verified for the current session
    const cookieStore = await cookies();
    cookieStore.set("admin_2fa_verified", sign2FACookie(session.user.id), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return { success: true };
  } catch (error) {
    console.error("[2FA] enable2FAAction error:", error);
    return { success: false, error: "Failed to enable 2FA" };
  }
}

/**
 * Disable 2FA (Admin+)
 */
export async function disable2FAAction(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      return { success: false, error: "2FA not configured" };
    }

    const isValid = verifyTOTP(user.twoFactorSecret, token);
    if (!isValid) {
      return { success: false, error: "Invalid verification code. Please try again." };
    }

    // Disable 2FA in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "DISABLE_2FA",
        entity: "User",
        entityId: session.user.id,
      },
    });

    // Clear verification cookie
    const cookieStore = await cookies();
    cookieStore.delete("admin_2fa_verified");

    return { success: true };
  } catch (error) {
    console.error("[2FA] disable2FAAction error:", error);
    return { success: false, error: "Failed to disable 2FA" };
  }
}

/**
 * Verify 2FA Token at Login (Admin+)
 */
export async function verifyAdmin2FATokenAction(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      return { success: false, error: "2FA not configured" };
    }

    const isValid = verifyTOTP(user.twoFactorSecret, token);
    if (!isValid) {
      return { success: false, error: "Invalid verification code. Please try again." };
    }

    // Set HTTP-only cookie indicating verification
    const cookieStore = await cookies();
    cookieStore.set("admin_2fa_verified", sign2FACookie(session.user.id), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return { success: true };
  } catch (error) {
    console.error("[2FA] verifyAdmin2FATokenAction error:", error);
    return { success: false, error: "Verification failed" };
  }
}
