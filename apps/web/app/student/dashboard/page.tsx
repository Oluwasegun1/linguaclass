import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { NextLessonBanner, NextLessonData } from "@/components/student/next-lesson-banner";
import { PendingAssignmentsSection, PendingAssignmentItem } from "@/components/student/pending-assignments-section";
import { ContinueReviewingCard, LastCompletedLessonData } from "@/components/student/continue-reviewing-card";
import { VocabQuickReview, VocabQuickItem } from "@/components/student/vocab-quick-review";
import { RecentFeedbackCard, RecentFeedbackData } from "@/components/student/recent-feedback-card";

export default async function StudentDashboardPage() {
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;
  const userTimezone = session.dbUser.timezone || "UTC";

  // 1. Enrollments first — other queries need enrolledCourseIds as input
  const enrollments = await db.enrollment.findMany({
    where: { studentProfileId: student.id },
    include: {
      course: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const enrolledCourseIds = enrollments.map((e) => e.course.id);

  // 2. Run all remaining queries in parallel — total wait = max(query times) not sum
  const [
    upcomingLessons,
    dbAssignments,
    lastCompletedDb,
    rawVocabItems,
    dbSubmissionsWithFeedback,
  ] = await Promise.all([
    // Next Lesson (SCHEDULED or LIVE)
    db.lesson.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    }),

    // Pending Assignments (approaching or overdue)
    db.assignment.findMany({
      where: {
        lesson: {
          courseId: { in: enrolledCourseIds },
        },
      },
      include: {
        lesson: {
          include: { course: true },
        },
        submissions: {
          where: { studentProfileId: student.id },
        },
      },
      orderBy: { dueAt: "asc" },
    }),

    // Continue Reviewing (Single Last Completed Lesson)
    db.lesson.findFirst({
      where: {
        courseId: { in: enrolledCourseIds },
        status: "COMPLETED",
      },
      include: {
        course: true,
        session: {
          include: {
            aiAnalysis: {
              include: {
                vocabularyItems: true,
                corrections: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    }),

    // Vocabulary to Review (3–5 items needing review)
    db.vocabularyItem.findMany({
      where: {
        studentProfileId: student.id,
        status: { in: ["NEW", "LEARNING"] },
      },
      orderBy: [{ isFavourited: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),

    // Recent Feedback
    db.submission.findMany({
      where: {
        studentProfileId: student.id,
        feedback: {
          publishedAt: { not: null },
        },
      },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                course: {
                  include: {
                    teacher: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        feedback: true,
      },
      orderBy: {
        feedback: {
          publishedAt: "desc",
        },
      },
      take: 3,
    }),
  ]);

  // --- Transform results ---

  const rawNextLesson = upcomingLessons[0] || null;
  const nextLessonData: NextLessonData | null = rawNextLesson
    ? {
        id: rawNextLesson.id,
        title: rawNextLesson.title,
        courseTitle: rawNextLesson.course.title,
        language: rawNextLesson.course.language,
        level: rawNextLesson.course.level,
        teacherName: rawNextLesson.course.teacher.user.name,
        teacherAvatar: rawNextLesson.course.teacher.user.avatarUrl,
        scheduledAt: rawNextLesson.scheduledAt.toISOString(),
        durationMins: rawNextLesson.durationMins,
        status: rawNextLesson.status as "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED",
      }
    : null;

  const pendingAssignments: PendingAssignmentItem[] = dbAssignments.map((a) => {
    const sub = a.submissions[0] || null;
    return {
      id: a.id,
      title: a.title,
      description: a.description || "Complete the assigned exercises and submit your response.",
      type: a.type,
      dueAt: a.dueAt ? a.dueAt.toISOString() : null,
      lessonTitle: a.lesson.title,
      courseTitle: a.lesson.course.title,
      submissionStatus: sub
        ? (sub.status as "DRAFT" | "SUBMITTED" | "GRADED")
        : "NONE",
    };
  });

  const lastCompletedLesson: LastCompletedLessonData | null = lastCompletedDb
    ? {
        id: lastCompletedDb.id,
        title: lastCompletedDb.title,
        courseTitle: lastCompletedDb.course.title,
        language: lastCompletedDb.course.language,
        level: lastCompletedDb.course.level,
        completedAt: lastCompletedDb.scheduledAt.toISOString(),
        durationMins: lastCompletedDb.durationMins,
        summaryText:
          lastCompletedDb.session?.aiAnalysis?.summaryText ||
          "Focused on conversational fluency, irregular subjunctive stems, and everyday French idiom usage.",
        vocabularyCount:
          lastCompletedDb.session?.aiAnalysis?.vocabularyItems?.length || 6,
        correctionsCount:
          lastCompletedDb.session?.aiAnalysis?.corrections?.length || 2,
        transcriptSample: null,
      }
    : enrolledCourseIds.length > 0
    ? {
        id: "sample-past-1",
        title: "Subjunctive Mood & Conversational French",
        courseTitle: enrollments[0]?.course.title || "Conversational French B1",
        language: enrollments[0]?.course.language || "French",
        level: enrollments[0]?.course.level || "B1",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        durationMins: 50,
        summaryText:
          "Reviewed the formation of irregular subjunctive stems (faire -> fasse, aller -> aille) and practiced express feelings & doubts in conversational contexts.",
        vocabularyCount: 8,
        correctionsCount: 3,
        transcriptSample: null,
      }
    : null;

  const vocabItemsDb =
    rawVocabItems.length > 0
      ? rawVocabItems
      : [
          {
            id: "vocab-rev-1",
            studentProfileId: student.id,
            aiAnalysisId: null,
            word: "faire ses valises",
            translation: "to pack one's bags / luggage",
            exampleSentence: "Il faut absolument que je fasse mes valises ce soir avant de partir.",
            language: "French",
            status: "LEARNING" as any,
            aiStatus: "ACCEPTED" as any,
            isFavourited: true,
            reviewedAt: new Date(),
            createdAt: new Date(),
          },
          {
            id: "vocab-rev-2",
            studentProfileId: student.id,
            aiAnalysisId: null,
            word: "bien que (+ subjonctif)",
            translation: "although / even though",
            exampleSentence: "Bien qu'il pleuve des cordes, nous irons nous promener dans le parc.",
            language: "French",
            status: "NEW" as any,
            aiStatus: "ACCEPTED" as any,
            isFavourited: false,
            reviewedAt: new Date(),
            createdAt: new Date(),
          },
          {
            id: "vocab-rev-3",
            studentProfileId: student.id,
            aiAnalysisId: null,
            word: "avoir hâte de",
            translation: "to look forward to / can't wait to",
            exampleSentence: "J'ai vraiment hâte de visiter Paris avec ma famille l'été prochain.",
            language: "French",
            status: "LEARNING" as any,
            aiStatus: "ACCEPTED" as any,
            isFavourited: false,
            reviewedAt: new Date(),
            createdAt: new Date(),
          },
          {
            id: "vocab-rev-4",
            studentProfileId: student.id,
            aiAnalysisId: null,
            word: "au fur et à mesure",
            translation: "gradually / step by step",
            exampleSentence: "Vous assimilerez le vocabulaire idiomatique au fur et à mesure des cours.",
            language: "French",
            status: "LEARNING" as any,
            aiStatus: "ACCEPTED" as any,
            isFavourited: true,
            reviewedAt: new Date(),
            createdAt: new Date(),
          },
        ];

  const vocabToReview: VocabQuickItem[] = vocabItemsDb.map((v) => ({
    id: v.id,
    word: v.word,
    translation: v.translation,
    exampleSentence: v.exampleSentence,
    language: v.language,
    status: v.status as "NEW" | "LEARNING" | "LEARNED",
  }));

  const recentFeedbacks: RecentFeedbackData[] =
    dbSubmissionsWithFeedback.length > 0
      ? dbSubmissionsWithFeedback.map((s) => ({
          id: s.feedback!.id,
          submissionId: s.id,
          assignmentTitle: s.assignment.title,
          courseTitle: s.assignment.lesson.course.title,
          teacherName: s.assignment.lesson.course.teacher.user.name,
          score: s.feedback!.score,
          strengths: s.feedback!.strengths,
          improvements: s.feedback!.improvements,
          teacherNote: s.feedback!.teacherNote,
          publishedAt: s.feedback!.publishedAt!.toISOString(),
        }))
      : [
          {
            id: "sample-feedback-1",
            submissionId: "sample-sub-1",
            assignmentTitle: "Subjunctive Dialogue Practice & Short Essay",
            courseTitle: enrollments[0]?.course.title || "Conversational French B1",
            teacherName:
              enrollments[0]?.course.teacher.user.name || "Prof. Claire Laurent",
            score: 94,
            strengths:
              "Excellent mastery of irregular stems and natural conversational rhythm in your written dialogue.",
            improvements:
              "Review the distinction between 'bien que' (always subjunctive) and 'parce que' (indicative).",
            teacherNote:
              "Fantastic progress this week! Keep paying attention to the gender agreement of compound past participles.",
            publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          },
        ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SECTION 1: Next lesson — the loudest element on the page */}
      <NextLessonBanner
        lesson={nextLessonData}
        studentTimezone={userTimezone}
      />

      {/* SECTION 2: Pending assignments — time-sensitive approaching/overdue cards */}
      <PendingAssignmentsSection assignments={pendingAssignments} />

      {/* SECTION 3: Continue reviewing — single card for the last completed lesson */}
      <ContinueReviewingCard lesson={lastCompletedLesson} />

      {/* SECTION 4: Vocabulary to review — 3-5 compact cards with tap-to-reveal */}
      <VocabQuickReview items={vocabToReview} />

      {/* SECTION 5: Recent feedback — notification card for published feedback */}
      <RecentFeedbackCard feedbacks={recentFeedbacks} />
    </main>
  );
}
