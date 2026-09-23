import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@workspace/database";

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const consent = await db.consentRecord.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: session.dbUser.id,
        },
      },
    });

    const allConsents = await db.consentRecord.findMany({
      where: { sessionId },
    });

    return NextResponse.json({
      userConsent: consent ? consent.consented : false,
      allConsented: allConsents.length > 0 && allConsents.every((c) => c.consented),
      consents: allConsents,
    });
  } catch (error) {
    console.error("Failed to check consent status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, consented } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const consentRecord = await db.consentRecord.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId: session.dbUser.id,
        },
      },
      create: {
        sessionId,
        userId: session.dbUser.id,
        consented: Boolean(consented),
      },
      update: {
        consented: Boolean(consented),
        consentedAt: new Date(),
      },
    });

    return NextResponse.json({ consentRecord }, { status: 200 });
  } catch (error) {
    console.error("Failed to record consent:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
