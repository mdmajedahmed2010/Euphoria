/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Benarasi Kuthi — Prisma Client Singleton
 * Demo Mode: Falls back to in-memory mock data when DB is unavailable
 * Supports both production (MariaDB) and demo (no DB) environments
 */

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ═══════════════════════════════════════════
// DEMO MODE MOCK — Returns empty data when DB unavailable
// ═══════════════════════════════════════════
function createDummyPrisma() {
  const dummy: any = new Proxy({} as any, {
    get(target, prop) {
      if (typeof prop === "symbol") return undefined;

      // Prisma special methods
      if (
        prop === "$connect" ||
        prop === "$disconnect" ||
        prop === "$use" ||
        prop === "$transaction"
      ) {
        return async (args?: any) => {
          if (typeof args === "function") {
            return await args(dummy);
          }
          return args;
        };
      }
      if (prop === "$on") {
        return () => {};
      }
      if (prop.startsWith("$")) {
        return async () => null;
      }

      // Return a nested proxy for model operations (e.g. prisma.user.findMany)
      return new Proxy({} as any, {
        get(modelTarget, modelProp) {
          if (typeof modelProp === "symbol") return undefined;

          return async (...args: any[]) => {
            // Return appropriate empty types based on the method name
            if (modelProp === "findMany") return [];
            if (modelProp === "count") return 0;
            if (modelProp === "aggregate") return { _sum: {}, _count: {}, _avg: {}, _min: {}, _max: {} };
            if (modelProp === "groupBy") return [];
            if (modelProp === "upsert" || modelProp === "create" || modelProp === "update") return null;
            if (modelProp === "delete" || modelProp === "deleteMany" || modelProp === "updateMany") return { count: 0 };

            // For settings, return brand defaults when requested
            if (prop === "siteSetting" && modelProp === "findUnique") {
              const whereKey = args[0]?.where?.key;
              if (whereKey === "store_favicon") return { key: "store_favicon", value: "/favicon.ico" };
              if (whereKey === "store_logo") return { key: "store_logo", value: "/images/Euphoria/logo.jpg" };
            }
            if (prop === "siteSetting" && modelProp === "findMany") {
              return [
                { key: "store_name", value: "Euphoria" },
                { key: "store_phone", value: "+880 1741-875914" },
                { key: "store_email", value: "info@sewinstylebyfarzana1.com" },
                { key: "store_address", value: "Shop 2/73, Eastern Mollika Shopping Complex, Elephant Road, Dhaka, Bangladesh" },
                { key: "shipping_dhaka", value: "80" },
                { key: "shipping_outside", value: "150" },
                { key: "social_facebook", value: "https://www.facebook.com/sewinstylebyfarzana1/" },
              ];
            }

            return null;
          };
        },
      });
    },
  });
  return dummy;
}

// ═══════════════════════════════════════════
// DEMO MODE DETECTION
// ═══════════════════════════════════════════
export function isDemoMode(): boolean {
  // Build phase: always use mock
  if (process.env.NEXT_PHASE === "phase-production-build") return true;

  // Explicit demo flag
  if (process.env.DEMO_MODE === "true") return true;

  // No real DB credentials provided (demo password is "demo")
  const dbPass = process.env.DB_PASSWORD || "";
  const dbUser = process.env.DB_USER || "";
  if (!dbUser || (dbUser === "demo" && dbPass === "demo")) return true;

  return false;
}

// ═══════════════════════════════════════════
// REAL PRISMA CLIENT (production)
// ═══════════════════════════════════════════
function createPrismaClient(): PrismaClient {
  if (isDemoMode()) {
    console.log("[DEMO MODE] Using in-memory mock data — no database connection required.");
    return createDummyPrisma() as unknown as PrismaClient;
  }

  let host = process.env.DB_HOST || "127.0.0.1";
  let port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
  let user = process.env.DB_USER || "root";
  let password = process.env.DB_PASSWORD || "";
  let database = process.env.DB_NAME || "benarasikuthi";
  let connectionLimit = 10;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      host = url.hostname;

      if (
        process.env.NODE_ENV === "production" &&
        !process.env.VERCEL &&
        host !== "127.0.0.1" &&
        host !== "localhost"
      ) {
        host = "127.0.0.1";
      }

      port = url.port ? parseInt(url.port) : 3306;
      user = url.username;
      password = url.password;
      database = url.pathname.replace("/", "");

      const limitParam = url.searchParams.get("connection_limit");
      if (limitParam) {
        connectionLimit = parseInt(limitParam, 10);
      }
    } catch {
      console.error("Failed to parse DATABASE_URL");
    }
  }

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.VERCEL &&
    host !== "127.0.0.1" &&
    host !== "localhost"
  ) {
    host = "127.0.0.1";
  }

  if (process.env.NODE_ENV === "production") {
    connectionLimit = Math.min(connectionLimit, 3);
  }

  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit,
    connectTimeout: 3000,  // Fast-fail: 3 seconds
    acquireTimeout: 3000,  // Fast-fail: 3 seconds
    idleTimeout: 10000,
    allowPublicKeyRetrieval: true,
  } as any);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? [] : [],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

/**
 * Recursively converts Prisma Decimal values to standard JavaScript numbers.
 */
export function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "object") {
    if (
      obj !== null &&
      typeof obj === "object" &&
      "toNumber" in obj &&
      typeof (obj as any).toNumber === "function"
    ) {
      return (obj as any).toNumber() as unknown as T;
    }
    if (obj instanceof Date) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => serializeDecimals(item)) as unknown as T;
    }
    const serialized: any = {};
    for (const key of Object.keys(obj)) {
      serialized[key] = serializeDecimals((obj as any)[key]);
    }
    return serialized as T;
  }

  return obj;
}
