import { AIStatus, type Prisma } from "@workspace/database";

/**
 * Deletes lessons and all dependent rows inside an existing transaction.
 *
 * The Prisma schema has no `onDelete: Cascade` on the lesson/session subtree,
 * so deleting a lesson whose session has a transcript, recording, AI analysis,
 * consent records, chat messages, assignments, etc. fails with a foreign-key
 * violation. Children are removed explicitly, leaf-first.
 *
 * Student vocabulary that was accepted from an AI analysis is preserved
 * (detached from the analysis) rather than deleted.
 */
export async function deleteLessonsCascade(
  tx: Prisma.TransactionClient,
  lessonIds: string[]
): Promise<void> {
  if (lessonIds.length === 0) return;

  const sessions = await tx.session.findMany({
    where: { lessonId: { in: lessonIds } },
    select: { id: true },
  });
  const sessionIds = sessions.map((s) => s.id);

  if (sessionIds.length > 0) {
    const analyses = await tx.aIAnalysis.findMany({
      where: { sessionId: { in: sessionIds } },
      select: { id: true },
    });
    const analysisIds = analyses.map((a) => a.id);

    if (analysisIds.length > 0) {
      await tx.grammarCorrection.deleteMany({
        where: { aiAnalysisId: { in: analysisIds } },
      });
      // Drop unreviewed/rejected suggestions; keep what students now own.
      await tx.vocabularyItem.deleteMany({
        where: {
          aiAnalysisId: { in: analysisIds },
          aiStatus: { in: [AIStatus.SUGGESTED, AIStatus.DISMISSED] },
        },
      });
      await tx.vocabularyItem.updateMany({
        where: { aiAnalysisId: { in: analysisIds } },
        data: { aiAnalysisId: null },
      });
      await tx.aIAnalysis.deleteMany({ where: { id: { in: analysisIds } } });
    }

    await tx.transcriptSegment.deleteMany({
      where: { transcript: { sessionId: { in: sessionIds } } },
    });
    await tx.transcript.deleteMany({ where: { sessionId: { in: sessionIds } } });
    await tx.recording.deleteMany({ where: { sessionId: { in: sessionIds } } });
    await tx.chatMessage.deleteMany({ where: { sessionId: { in: sessionIds } } });
    await tx.consentRecord.deleteMany({
      where: { sessionId: { in: sessionIds } },
    });
    await tx.session.deleteMany({ where: { id: { in: sessionIds } } });
  }

  await tx.feedback.deleteMany({
    where: { submission: { assignment: { lessonId: { in: lessonIds } } } },
  });
  await tx.submission.deleteMany({
    where: { assignment: { lessonId: { in: lessonIds } } },
  });
  await tx.assignment.deleteMany({ where: { lessonId: { in: lessonIds } } });
  await tx.note.deleteMany({ where: { lessonId: { in: lessonIds } } });
  await tx.resource.deleteMany({ where: { lessonId: { in: lessonIds } } });
  await tx.lesson.deleteMany({ where: { id: { in: lessonIds } } });
}
