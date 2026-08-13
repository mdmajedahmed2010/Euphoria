/**
 * Euphoria — Email System (Provider-Agnostic)
 * SOP §১১ — Email & Notification System
 *
 * Phase 1: Hostinger SMTP (free, 500/day)
 * Phase 2: Resend (if growth exceeds 500/day)
 *
 * Switch provider via EMAIL_PROVIDER env variable
 */

import { BUSINESS } from "./constants";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════
// MAIN SEND FUNCTION (Provider Switch)
// ═══════════════════════════════════════════

/**
 * Send email — automatically routes to configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || "smtp";

  try {
    switch (provider) {
      case "resend":
        return await sendViaResend(options);
      case "smtp":
      default:
        return await sendViaSMTP(options);
    }
  } catch (error) {
    console.error("[EMAIL] Send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}

// ═══════════════════════════════════════════
// SMTP PROVIDER (Hostinger — Phase 1)
// ═══════════════════════════════════════════

async function sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
  // Dynamic import to avoid bundling nodemailer when not needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require("nodemailer") as typeof import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${BUSINESS.NAME}" <${process.env.SMTP_USER || "noreply@majedahmed.space"}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { success: true };
}

// ═══════════════════════════════════════════
// RESEND PROVIDER (Phase 2 — Growth)
// ═══════════════════════════════════════════

async function sendViaResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${BUSINESS.NAME} <noreply@majedahmed.space>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, error: errorData.message || "Resend API error" };
  }

  return { success: true };
}

// ═══════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════

/**
 * Order Confirmation Email
 */
export function orderConfirmationEmail(data: {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: string;
  paymentMethod: string;
}): EmailOptions {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price.toLocaleString()}</td>
        </tr>`
    )
    .join("");

  return {
    to: "", // Will be set by caller
    subject: `Order Confirmed — ${data.orderNumber} | Euphoria`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0a0a0a;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #0a0a0a;">Euphoria</h1>
        </div>

        <div style="padding: 30px 0;">
          <h2 style="color: #111; margin-bottom: 5px;">Order Confirmed ✓</h2>
          <p style="color: #666; margin-top: 0;">Thank you for your order, ${data.customerName}!</p>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
            <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #111;">${data.orderNumber}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Item</th>
                <th style="padding: 10px 8px; text-align: center; font-size: 12px; text-transform: uppercase; color: #666;">Qty</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 12px; text-transform: uppercase; color: #666;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #eee; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #666;">Subtotal:</span>
              <span>৳${data.subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #666;">Shipping:</span>
              <span>৳${data.shipping.toLocaleString()}</span>
            </div>
            ${data.discount > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span style="color: #666;">Discount:</span><span style="color: green;">-৳${data.discount.toLocaleString()}</span></div>` : ""}
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
              <span>Total:</span>
              <span>৳${data.total.toLocaleString()}</span>
            </div>
          </div>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 5px; font-size: 14px; font-weight: bold;">Delivery Address</p>
            <p style="margin: 0; font-size: 14px; color: #666;">${data.address}</p>
          </div>

          <p style="font-size: 14px; color: #666;">
            <strong>Payment:</strong> ${data.paymentMethod === "COD" ? "Cash on Delivery" : data.paymentMethod}
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            You can track your order using your order number and phone number at
            <a href="https://majedahmed.space/track-order" style="color: #111;">majedahmed.space/track-order</a>
          </p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>${BUSINESS.NAME} | ${BUSINESS.ADDRESS}</p>
          <p>${BUSINESS.PHONE} | ${BUSINESS.EMAIL}</p>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Order Shipped Email
 */
export function orderShippedEmail(data: {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
}): EmailOptions {
  return {
    to: "",
    subject: `Your Order ${data.orderNumber} Has Been Shipped! | Euphoria`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0a0a0a;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #0a0a0a;">Euphoria</h1>
        </div>

        <div style="padding: 30px 0;">
          <h2 style="color: #111;">Your Order is On Its Way! 🚚</h2>
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order <strong>${data.orderNumber}</strong> has been shipped and is on its way to you.</p>

          ${data.trackingNumber ? `<div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bae6fd;"><p style="margin: 0 0 5px; font-size: 14px; font-weight: bold;">Tracking Number</p><p style="margin: 0; font-size: 16px; font-family: monospace;">${data.trackingNumber}</p></div>` : ""}

          <p style="font-size: 14px; color: #666;">
            Track your order at <a href="https://majedahmed.space/track-order" style="color: #111;">majedahmed.space/track-order</a>
          </p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>${BUSINESS.NAME} | ${BUSINESS.PHONE}</p>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Welcome Email (on registration)
 */
export function welcomeEmail(data: { name: string }): EmailOptions {
  return {
    to: "",
    subject: `Welcome to Euphoria! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0a0a0a;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #0a0a0a;">Euphoria</h1>
        </div>

        <div style="padding: 30px 0;">
          <h2 style="color: #111;">Welcome, ${data.name}! 🎉</h2>
          <p>Thank you for creating an account with Euphoria. We're excited to have you!</p>

          <p>With your account, you can:</p>
          <ul style="color: #555; line-height: 1.8;">
            <li>Track your orders easily</li>
            <li>Save your favorite items to wishlist</li>
            <li>Manage multiple delivery addresses</li>
            <li>Get exclusive offers and updates</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://majedahmed.space" style="display: inline-block; background: #111; color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Start Shopping
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>${BUSINESS.NAME} | ${BUSINESS.ADDRESS}</p>
          <p>${BUSINESS.PHONE} | ${BUSINESS.EMAIL}</p>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * New Order Alert (to Admin)
 */
export function newOrderAlertEmail(data: {
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
}): EmailOptions {
  return {
    to: BUSINESS.EMAIL,
    subject: `🛒 New Order: ${data.orderNumber} — ৳${data.total.toLocaleString()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>🛒 New Order Received!</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Order:</td><td style="padding: 8px;">${data.orderNumber}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Customer:</td><td style="padding: 8px;">${data.customerName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Items:</td><td style="padding: 8px;">${data.itemCount}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Total:</td><td style="padding: 8px; font-size: 18px; font-weight: bold;">৳${data.total.toLocaleString()}</td></tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="https://majedahmed.space/admin/orders" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
            View in Admin Panel →
          </a>
        </p>
      </body>
      </html>
    `,
  };
}

/**
 * Abandoned Cart Recovery Email
 */
export function abandonedCartEmail(data: {
  customerName: string;
  recoveryUrl: string;
}): EmailOptions {
  return {
    to: "",
    subject: `Did you forget something? 🛒 | Euphoria`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0a0a0a;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #0a0a0a;">Euphoria</h1>
        </div>

        <div style="padding: 30px 0; text-align: center;">
          <h2 style="color: #111;">We saved your cart! 🛍️</h2>
          <p style="color: #666; font-size: 16px;">Hi ${data.customerName || "there"}, we noticed you left some great items in your cart. They are selling out fast, so complete your order before they are gone!</p>
          
          <div style="margin: 30px 0;">
            <a href="${data.recoveryUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Return to Checkout
            </a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            If you need any help, reply to this email. We'd love to assist you.
          </p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>${BUSINESS.NAME} | ${BUSINESS.PHONE}</p>
        </div>
      </body>
      </html>
    `,
  };
}
