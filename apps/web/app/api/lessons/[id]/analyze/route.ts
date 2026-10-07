/**
 * API Route: Lesson AI Analysis
 *
 * GET  /api/lessons/[id]/analyze  — Retrieve existing analysis for a lesson
 * POST /api/lessons/[id]/analyze  — Generate new AI analysis for a lesson
 *
 * The POST handler accepts an optional transcript from the request body.
 * If no transcript is provided, it falls back to any existing transcript
 * segments in the database.
 *
 * Authorization: Teacher must own the lesson's course.
 */

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/auth";
import { db, type Prisma } from "@workspace/database";
import { getLessonAnalysisProvider } from "@/lib/ai/lesson-analysis";
import { AnalysisRequestSchema } from "@/lib/ai/schemas";

const MAX_TRANSCRIPT_CHARS = 100_000;

// ── GET — retrieve existing analysis ─────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
        session: {
          include: {
            aiAnalysis: {
              include: {
                corrections: true,
                vocabularyItems: true,
              },
            },
            transcript: {
              include: {
                segments: {
                  orderBy: { startMs: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      lesson,
      analysis: lesson.session?.aiAnalysis ?? null,
      transcript: lesson.session?.transcript ?? null,
    });
  } catch (error) {
    console.error("[API] Failed to retrieve AI analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST — generate new AI analysis ──────────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;

  // ── Parse optional body (transcript may be passed from UI) ────────────────

  let bodyTranscript: string | undefined;
  let bodyLanguage: string | undefined;
  let bodyStudentLevel: string | undefined;
  let bodyObjectives: string[] | undefined;

  try {
    const text = await req.text();
    if (text.trim()) {
      const parsed = JSON.parse(text);
      bodyTranscript = typeof parsed.transcript === "string" ? parsed.transcript : undefined;
      bodyLanguage = typeof parsed.language === "string" ? parsed.language : undefined;
      bodyStudentLevel = typeof parsed.studentLevel === "string" ? parsed.studentLevel : undefined;
      bodyObjectives = Array.isArray(parsed.objectives) ? parsed.objectives : undefined;
    }
  } catch {
    // Ignore parse errors — body is optional
  }

  try {
    // ── Fetch lesson with authorization context ────────────────────────────

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
        session: {
          include: {
            transcript: {
              include: { segments: { orderBy: { startMs: "asc" } } },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Ensure a Session record exists ────────────────────────────────────

    let liveSession = lesson.session;
    if (!liveSession) {
      liveSession = await db.session.create({
        data: {
          lessonId: lesson.id,
          videoRoomId: `room_${lesson.id}`,
        },
        include: {
          transcript: { include: { segments: { orderBy: { startMs: "asc" } } } },
        },
      });
    }

    // ── Resolve transcript text ───────────────────────────────────────────

    let transcriptText: string;

    if (bodyTranscript && bodyTranscript.trim().length >= 10) {
      // Teacher pasted a transcript in the UI
      transcriptText = bodyTranscript.trim();
    } else if (
      liveSession.transcript?.segments &&
      liveSession.transcript.segments.length > 0
    ) {
      // Use database-stored segments (from live transcription)
      transcriptText = liveSession.transcript.segments
        .map((s) => `[${s.speakerRole}]: ${s.text}`)
        .join("\n");
    } else {
      return NextResponse.json(
        { error: "This lesson does not have a transcript yet." },
        { status: 400 }
      );
    }

    // ── Validate transcript size before calling Gemini ────────────────────

    if (transcriptText.length > MAX_TRANSCRIPT_CHARS) {
      return NextResponse.json(
        {
          error: `Transcript is too long (${transcriptText.length} chars). Maximum is ${MAX_TRANSCRIPT_CHARS}.`,
        },
        { status: 400 }
      );
    }

    // ── Validate analysis request ─────────────────────────────────────────

    const language = bodyLanguage || lesson.course.language || "French";
    const studentLevel = bodyStudentLevel || lesson.course.level;

    const requestValidation = AnalysisRequestSchema.safeParse({
      transcript: transcriptText,
      language,
      studentLevel: String(studentLevel),
      objectives: bodyObjectives || (lesson.objectives ? [lesson.objectives] : []),
    });

    if (!requestValidation.success) {
      return NextResponse.json(
        { error: requestValidation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const analysisInput = requestValidation.data;

    // ── Call the AI service ────────────────────────────────────────────────

    const provider = getLessonAnalysisProvider();

    let intelligence;
    try {
      intelligence = await provider.generateLessonAnalysis(analysisInput);
    } catch (aiError) {
      const message =
        aiError instanceof Error ? aiError.message : "Unknown AI error";

      // Map well-known error messages to safe client responses
      if (message.includes("not configured")) {
        return NextResponse.json(
          { error: "AI service is not configured." },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: message }, { status: 502 });
    }

    // ── Identify primary student ──────────────────────────────────────────

    const primaryStudent = lesson.course.enrollments[0]?.student;
    const studentUserId = primaryStudent?.user?.id ?? session.dbUser.id;
    const studentProfileId = primaryStudent?.id;

    // ── Persist to database atomically ────────────────────────────────────

    const analysis = await db.$transaction(async (tx) => {
      const existing = await tx.aIAnalysis.findUnique({
        where: { sessionId: liveSession.id },
      });

      let savedAnalysis;
      if (existing) {
        // Clean up the previous SUGGESTED items before overwriting
        await tx.grammarCorrection.deleteMany({
          where: { aiAnalysisId: existing.id, status: "SUGGESTED" },
        });
        await tx.vocabularyItem.deleteMany({
          where: { aiAnalysisId: existing.id, aiStatus: "SUGGESTED" },
        });

        savedAnalysis = await tx.aIAnalysis.update({
          where: { id: existing.id },
          data: {
            analysisStatus: "SUGGESTED",
            model: "gemini",
            modelVersion: provider.modelId,
            sourceTranscript: transcriptText,
            summaryText: intelligence.summary,
            topicsCovered: intelligence.topics.map((t) => t.title),
            payload: intelligence as unknown as Prisma.InputJsonValue,
            processedAt: new Date(),
            reviewedAt: null,
          },
        });
      } else {
        savedAnalysis = await tx.aIAnalysis.create({
          data: {
            sessionId: liveSession.id,
            analysisStatus: "SUGGESTED",
            model: "gemini",
            modelVersion: provider.modelId,
            sourceTranscript: transcriptText,
            summaryText: intelligence.summary,
            topicsCovered: intelligence.topics.map((t) => t.title),
            payload: intelligence as unknown as Prisma.InputJsonValue,
          },
        });
      }

      // ── Persist legacy grammar corrections ────────────────────────────

      for (const corr of intelligence.corrections) {
        await tx.grammarCorrection.create({
          data: {
            aiAnalysisId: savedAnalysis.id,
            studentId: studentUserId,
            original: corr.original,
            corrected: corr.corrected,
            explanation: corr.explanation,
            status: "SUGGESTED",
          },
        });
      }

      // ── Persist legacy vocabulary items (if student profile exists) ────

      if (studentProfileId) {
        for (const vocab of intelligence.vocabulary) {
          await tx.vocabularyItem.create({
            data: {
              studentProfileId,
              aiAnalysisId: savedAnalysis.id,
              word: vocab.word,
              translation: vocab.meaning,
              exampleSentence: vocab.example ?? null,
              language: language.toLowerCase(),
              aiStatus: "SUGGESTED",
            },
          });
        }
      }

      return tx.aIAnalysis.findUnique({
        where: { id: savedAnalysis.id },
        include: {
          corrections: true,
          vocabularyItems: true,
        },
      });
    });

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error("[API] Failed to run lesson AI analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
