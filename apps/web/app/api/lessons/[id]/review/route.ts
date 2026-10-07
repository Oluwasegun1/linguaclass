import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/auth";
import { db, AIStatus, VocabStatus } from "@workspace/database";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { itemType, itemId, action, teacherNote, translation, exampleSentence } = body ?? {};

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

    const lessonAnalysis = lesson.session
      ? await db.aIAnalysis.findUnique({
          where: { sessionId: lesson.session.id },
          select: { id: true },
        })
      : null;

    if (action === "ACCEPT_ALL") {
      const aiAnalysis = lessonAnalysis;

      if (!aiAnalysis) {
        return NextResponse.json({ error: "No AI analysis to review" }, { status: 400 });
      }

      await db.$transaction(async (tx) => {
        // Accept all suggested corrections
        await tx.grammarCorrection.updateMany({
          where: { aiAnalysisId: aiAnalysis.id, status: AIStatus.SUGGESTED },
          data: { status: AIStatus.ACCEPTED, reviewedAt: new Date() },
        });

        // Accept all suggested vocabulary items and set status to NEW
        await tx.vocabularyItem.updateMany({
          where: { aiAnalysisId: aiAnalysis.id, aiStatus: AIStatus.SUGGESTED },
          data: {
            aiStatus: AIStatus.ACCEPTED,
            status: VocabStatus.NEW,
            reviewedAt: new Date(),
          },
        });
      });

      return NextResponse.json({ success: true, message: "All suggestions accepted" });
    }

    if (itemType === "correction") {
      const correction = await db.grammarCorrection.findUnique({
        where: { id: itemId },
      });

      if (!correction || correction.aiAnalysisId !== lessonAnalysis?.id) {
        return NextResponse.json({ error: "Correction not found" }, { status: 404 });
      }

      let newStatus: AIStatus = AIStatus.ACCEPTED;
      if (action === "DISMISS") newStatus = AIStatus.DISMISSED;
      else if (action === "EDIT") newStatus = AIStatus.EDITED;

      const updated = await db.grammarCorrection.update({
        where: { id: itemId },
        data: {
          status: newStatus,
          teacherNote: teacherNote !== undefined ? teacherNote : correction.teacherNote,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ updated });
    }

    if (itemType === "vocabulary") {
      const vocab = await db.vocabularyItem.findUnique({
        where: { id: itemId },
      });

      if (!vocab || vocab.aiAnalysisId !== lessonAnalysis?.id) {
        return NextResponse.json({ error: "Vocabulary item not found" }, { status: 404 });
      }

      let newAiStatus: AIStatus = AIStatus.ACCEPTED;
      if (action === "DISMISS") newAiStatus = AIStatus.DISMISSED;
      else if (action === "EDIT") newAiStatus = AIStatus.EDITED;

      const updated = await db.vocabularyItem.update({
        where: { id: itemId },
        data: {
          aiStatus: newAiStatus,
          status: newAiStatus === AIStatus.DISMISSED ? vocab.status : VocabStatus.NEW,
          translation: translation || vocab.translation,
          exampleSentence: exampleSentence !== undefined ? exampleSentence : vocab.exampleSentence,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ updated });
    }

    return NextResponse.json({ error: "Invalid itemType or action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process teacher review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
