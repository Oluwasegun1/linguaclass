import { NextResponse } from "next/server";
import { db } from "@workspace/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  let dbStatus = "ok";
  let dbError: string | null = null;

  try {
    // Quick probe to verify database connectivity
    await db.$queryRaw`SELECT 1`;
  } catch (err: unknown) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Unknown database connection error";
  }

  const isHealthy = dbStatus === "ok";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp,
      uptime,
      services: {
        database: {
          status: dbStatus,
          ...(dbError && { error: dbError }),
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
    }
  );
}
