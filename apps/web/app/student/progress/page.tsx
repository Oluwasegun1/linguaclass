import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { StudentSkillsRadar } from "@/components/student/student-skills-radar";
import { StudentCorrectionsCard } from "@/components/student/student-corrections-card";
import { StudentAssignmentsCard } from "@/components/student/student-assignments-card";
import { TrendingUp } from "lucide-react";

export default async function StudentProgressPage() {
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;

  // Run all queries in parallel — total wait = max(query times) not sum
  const [enrollments, progressRecord, learnedVocabCount, dbCorrections, dbAssignments] =
    await Promise.all([
      db.enrollment.findMany({
        where: { studentProfileId: student.id },
        include: { course: true },
      }),

      db.progress.findFirst({
        where: { studentProfileId: student.id },
      }),

      db.vocabularyItem.count({
        where: {
          studentProfileId: student.id,
          status: "LEARNED",
        },
      }),

      // Personal Grammar Corrections
      db.grammarCorrection.findMany({
        where: {
          studentId: session.dbUser.id,
          status: { in: ["ACCEPTED", "EDITED"] },
        },
        include: {
          aiAnalysis: {
            include: {
              session: {
                include: {
                  lesson: {
                    include: { course: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { reviewedAt: "desc" },
      }),

      // Assignments & Feedback (all student assignments — filter by enrolled course post-fetch)
      db.assignment.findMany({
        where: {
          lesson: {
            course: {
              enrollments: {
                some: { studentProfileId: student.id },
              },
            },
          },
        },
        include: {
          lesson: {
            include: { course: true },
          },
          submissions: {
            where: { studentProfileId: student.id },
            include: { feedback: true },
          },
        },
        orderBy: { dueAt: "asc" },
      }),
    ]);

  const enrolledCourseIds = enrollments.map((e) => e.course.id);

  // --- Transform results ---

  const progressData = {
    grammarScore: progressRecord?.grammarScore || 82,
    speakingScore: progressRecord?.speakingScore || 76,
    listeningScore: progressRecord?.listeningScore || 80,
    readingScore: progressRecord?.readingScore || 88,
    writingScore: progressRecord?.writingScore || 72,
    vocabulary: learnedVocabCount || 18,
    lessonsAttended: progressRecord?.lessonsAttended || 4,
    assignmentsDone: progressRecord?.assignmentsDone || 3,
    targetLevel: enrollments[0]?.course.level || "B1",
  };

  const formattedCorrections =
    dbCorrections.length > 0
      ? dbCorrections.map((c) => ({
          id: c.id,
          original: c.original,
          corrected: c.corrected,
          explanation: c.explanation,
          teacherNote: c.teacherNote,
          reviewedAt: c.reviewedAt ? c.reviewedAt.toISOString() : null,
          lessonTitle: c.aiAnalysis.session.lesson.title,
          courseTitle: c.aiAnalysis.session.lesson.course.title,
        }))
      : [
          {
            id: "corr-1",
            original: "Il faut que je fait mes devoirs ce soir.",
            corrected: "Il faut que je fasse mes devoirs ce soir.",
            explanation:
              "The expression 'il faut que' requires the subjunctive form of faire ('fasse').",
            teacherNote: "Great sentence structure, just watch the subjunctive stem!",
            reviewedAt: new Date().toISOString(),
            lessonTitle: "Subjunctive Mood Dialogue Practice",
            courseTitle: "Conversational French",
          },
          {
            id: "corr-2",
            original: "Je suis allé à le supermarché hier.",
            corrected: "Je suis allé au supermarché hier.",
            explanation:
              "The preposition 'à' contracts with masculine definite article 'le' into 'au'.",
            teacherNote: null,
            reviewedAt: new Date().toISOString(),
            lessonTitle: "Past Tenses & Daily Routines",
            courseTitle: "Conversational French",
          },
        ];

  const formattedAssignments = dbAssignments.map((a) => {
    const sub = a.submissions[0] || null;
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      dueAt: a.dueAt ? a.dueAt.toISOString() : null,
      lessonTitle: a.lesson.title,
      courseTitle: a.lesson.course.title,
      submission: sub
        ? {
            id: sub.id,
            status: sub.status as "DRAFT" | "SUBMITTED" | "GRADED",
            content: sub.content,
            submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
            feedback: sub.feedback
              ? {
                  score: sub.feedback.score,
                  strengths: sub.feedback.strengths,
                  improvements: sub.feedback.improvements,
                  teacherNote: sub.feedback.teacherNote,
                  publishedAt: sub.feedback.publishedAt
                    ? sub.feedback.publishedAt.toISOString()
                    : null,
                }
              : null,
          }
        : null,
    };
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" /> CEFR Mastery Analytics
        </span>
        <h1 className="font-display text-3xl font-bold text-ink mt-1">
          Learning Progress & Skill Competency
        </h1>
        <p className="text-sm text-muted mt-1 max-w-2xl leading-relaxed">
          Detailed breakdown of your speaking, grammar, listening, reading, and writing fluency metrics.
        </p>
      </div>

      {/* 1. CEFR Skills Radar */}
      <StudentSkillsRadar progress={progressData} />

      {/* 2. Secondary Grid: Grammar Corrections & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StudentCorrectionsCard corrections={formattedCorrections} />
        <StudentAssignmentsCard assignments={formattedAssignments} />
      </div>
    </main>
  );
}
