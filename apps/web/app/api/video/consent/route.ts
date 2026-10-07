import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUserSession } from "@/lib/auth/auth";
import { canAccessCourse } from "@/lib/auth/access";
import { db } from "@workspace/database";

/** Returns "ok", "not_found" or "forbidden" for the given recording session. */
async function authorizeSession(
  user: CurrentUserSession,
  sessionId: string
): Promise<"ok" | "not_found" | "forbidden"> {
  const liveSession = await db.session.findUnique({
    where: { id: sessionId },
    select: {
      lesson: {
        select: {
          course: {
            select: {
              teacherId: true,
              enrollments: { select: { studentProfileId: true } },
            },
          },
        },
      },
    },
  });

  if (!liveSession) return "not_found";
  return canAccessCourse(user, liveSession.lesson.course) ? "ok" : "forbidden";
}

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
    const access = await authorizeSession(session, sessionId);
    if (access === "not_found") {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (access === "forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const access = await authorizeSession(session, sessionId);
    if (access === "not_found") {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (access === "forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
