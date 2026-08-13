import crypto from "crypto";

/**
 * Centralized, self-contained standard RFC 6238 TOTP (Google Authenticator) Utility.
 * Zero-dependencies. Uses built-in crypto module.
 */

/**
 * Standard base32 decode helper for TOTP secrets
 */
function base32Decode(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/=+$/, "");
  const length = cleaned.length;
  const buffer = Buffer.alloc(Math.floor((length * 5) / 8));

  let bits = 0;
  let value = 0;
  let index = 0;

  for (let i = 0; i < length; i++) {
    const char = cleaned.charAt(i);
    const val = alphabet.indexOf(char);
    if (val === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return buffer;
}

/**
 * Generate standard TOTP token for a base32 secret
 */
export function generateTOTP(secret: string, time = Date.now(), timeStep = 30): string {
  const key = base32Decode(secret);
  const epoch = Math.floor(time / 1000);
  const counter = Math.floor(epoch / timeStep);

  const buffer = Buffer.alloc(8);
  // Write 64-bit counter
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(counter, 4);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(buffer);
  const hmacResult = hmac.digest();

  const lastByte = hmacResult[hmacResult.length - 1];
  if (lastByte === undefined) {
    throw new Error("Invalid digest length");
  }

  const offset = lastByte & 0xf;

  const b0 = hmacResult[offset];
  const b1 = hmacResult[offset + 1];
  const b2 = hmacResult[offset + 2];
  const b3 = hmacResult[offset + 3];

  if (b0 === undefined || b1 === undefined || b2 === undefined || b3 === undefined) {
    throw new Error("Invalid offset in hmac digest");
  }

  const code = ((b0 & 0x7f) << 24) | ((b1 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b3 & 0xff);

  const token = (code % 1_000_000).toString().padStart(6, "0");
  return token;
}

/**
 * Generate a cryptographically secure random base32 secret key (16 chars, 80 bits)
 */
export function generateSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(10); // 80 bits
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      secret += alphabet[byte % 32];
    }
  }
  return secret;
}

/**
 * Verify a 6-digit TOTP code with a 1-step time window drift (allows ±30s delay)
 */
export function verifyTOTP(secret: string, token: string, timeStep = 30): boolean {
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || isNaN(Number(cleanToken))) return false;

  const now = Date.now();
  // Check current time step, previous, and next
  for (let i = -1; i <= 1; i++) {
    const calculatedToken = generateTOTP(secret, now + i * timeStep * 1000, timeStep);
    if (calculatedToken === cleanToken) {
      return true;
    }
  }
  return false;
}

/**
 * Generate dynamic Google Authenticator provisioning URI (otpauth://)
 */
export function getOTPAuthURI(label: string, secret: string, issuer = "Euphoria"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
