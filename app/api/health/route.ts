/**
 * Sitara — Health Check Endpoint
 * Used by Better Uptime monitoring
 * GET /api/health
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbStatus = "not_checked";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "ok";
  } catch {
    dbStatus = "error";
  }

  const isHealthy = dbStatus === "ok";

  const healthCheck = {
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    db: dbStatus,
  };

  return NextResponse.json(healthCheck, { status: isHealthy ? 200 : 503 });
}
