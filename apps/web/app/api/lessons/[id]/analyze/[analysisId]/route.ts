/**
 * API Route: Teacher AI Analysis Review
 *
 * PATCH /api/lessons/[id]/analyze/[analysisId]
 *
 * Allows the authenticated teacher to update the analysis status and optionally
 * edit the payload after reviewing the AI output.
 *
 * Status transitions:
 *   SUGGESTED → ACCEPTED  (teacher accepted as-is)
 *   SUGGESTED → EDITED    (teacher modified the AI output)
 *   SUGGESTED → DISMISSED (teacher rejected the analysis)
 *
 * Authorization: Teacher must own the lesson's course.
 */

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/auth";
import { db, type Prisma } from "@workspace/database";
import { LessonIntelligenceSchema } from "@/lib/ai/schemas";
import { z } from "zod";

const PatchBodySchema = z.object({
  status: z.enum(["ACCEPTED", "EDITED", "DISMISSED"]),
  payload: LessonIntelligenceSchema.optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; analysisId: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId, analysisId } = await params;

  let body: z.infer<typeof PatchBodySchema>;
  try {
    const raw = await req.json();
    const parsed = PatchBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    // ── Authorize: verify lesson belongs to this teacher ──────────────────

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true, session: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Verify the analysis belongs to this lesson's session ──────────────

    const analysis = await db.aIAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.sessionId !== lesson.session?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Update the analysis ───────────────────────────────────────────────

    const updated = await db.aIAnalysis.update({
      where: { id: analysisId },
      data: {
        analysisStatus: body.status,
        reviewedAt: new Date(),
        ...(body.payload && {
          payload: body.payload as unknown as Prisma.InputJsonValue,
          summaryText: body.payload.summary,
          topicsCovered: body.payload.topics.map((t) => t.title),
        }),
      },
      include: {
        corrections: true,
        vocabularyItems: true,
      },
    });

    return NextResponse.json({ analysis: updated });
  } catch (error) {
    console.error("[API] Failed to update AI analysis review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
