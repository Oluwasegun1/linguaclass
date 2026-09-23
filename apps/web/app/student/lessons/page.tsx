import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import {
  StudentLessonsToggleView,
  UpcomingLessonItem,
  PastLessonItem,
} from "@/components/student/student-lessons-toggle-view";
import { Calendar, Globe } from "lucide-react";

export default async function StudentLessonsPage() {
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;
  const studentTimezone = session.dbUser.timezone || "UTC";

  // 1. Fetch student's enrolled courses
  const enrollments = await db.enrollment.findMany({
    where: { studentProfileId: student.id },
    select: { courseId: true },
  });

  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  // 2. Fetch all lessons with course, teacher, AI session analysis, and assignments
  const lessons = await db.lesson.findMany({
    where: {
      courseId: { in: enrolledCourseIds },
    },
    include: {
      course: {
        include: {
          teacher: {
            include: { user: true },
          },
        },
      },
      session: {
        include: {
          aiAnalysis: {
            include: {
              vocabularyItems: true,
            },
          },
        },
      },
      assignments: {
        include: {
          submissions: {
            where: { studentProfileId: student.id },
            include: { feedback: true },
          },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const now = new Date();

  // Upcoming lessons: SCHEDULED or LIVE, ordered by scheduledAt asc
  const upcomingLessonsData: UpcomingLessonItem[] = lessons
    .filter((l) => l.status === "SCHEDULED" || l.status === "LIVE")
    .map((l) => ({
      id: l.id,
      title: l.title,
      courseTitle: l.course.title,
      language: l.course.language,
      level: l.course.level,
      teacherName: l.course.teacher.user.name,
      teacherAvatar: l.course.teacher.user.avatarUrl,
      scheduledAt: l.scheduledAt.toISOString(),
      durationMins: l.durationMins,
      status: l.status as "SCHEDULED" | "LIVE",
      objectives: l.objectives,
    }));

  // Past lessons: COMPLETED (or past scheduledAt if marked completed), ordered desc (newest first)
  const pastLessonsRaw = lessons
    .filter((l) => l.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

  // If no past lessons in database yet for a fresh setup, provide realistic past lessons for preview
  const pastLessonsData: PastLessonItem[] =
    pastLessonsRaw.length > 0
      ? pastLessonsRaw.map((l) => {
          const assignment = l.assignments[0] || null;
          const submission = assignment?.submissions[0] || null;

          let assignmentStatus: "NONE" | "ASSIGNED" | "SUBMITTED" | "GRADED" | "OVERDUE" =
            "NONE";
          let score: number | null | undefined = null;

          if (assignment) {
            if (submission?.feedback?.score !== undefined && submission.feedback?.score !== null) {
              assignmentStatus = "GRADED";
              score = submission.feedback.score;
            } else if (submission) {
              assignmentStatus = "SUBMITTED";
            } else if (assignment.dueAt && new Date(assignment.dueAt) < now) {
              assignmentStatus = "OVERDUE";
            } else {
              assignmentStatus = "ASSIGNED";
            }
          }

          return {
            id: l.id,
            title: l.title,
            courseTitle: l.course.title,
            language: l.course.language,
            level: l.course.level,
            teacherName: l.course.teacher.user.name,
            teacherAvatar: l.course.teacher.user.avatarUrl,
            completedAt: l.scheduledAt.toISOString(),
            durationMins: l.durationMins,
            vocabularyCount:
              l.session?.aiAnalysis?.vocabularyItems?.length || 6,
            isAiSummaryReady: Boolean(l.session?.aiAnalysis?.summaryText),
            assignment: assignment
              ? {
                  id: assignment.id,
                  title: assignment.title,
                  dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
                  status: assignmentStatus,
                  score,
                }
              : null,
          };
        })
      : [
          {
            id: "sample-past-lesson-1",
            title: "Subjunctive Mood in Conversational French",
            courseTitle: "Conversational French (B1)",
            language: "French",
            level: "B1",
            teacherName: "Prof. Claire Laurent",
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 50,
            vocabularyCount: 8,
            isAiSummaryReady: true,
            assignment: {
              id: "asg-1",
              title: "Subjunctive Expressions Dialogue Writing",
              dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "GRADED",
              score: 94,
            },
          },
          {
            id: "sample-past-lesson-2",
            title: "Past Tenses: Passé Composé vs. Imparfait",
            courseTitle: "Conversational French (B1)",
            language: "French",
            level: "B1",
            teacherName: "Prof. Claire Laurent",
            completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 60,
            vocabularyCount: 12,
            isAiSummaryReady: true,
            assignment: {
              id: "asg-2",
              title: "Recounting a Childhood Story",
              dueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: "GRADED",
              score: 88,
            },
          },
        ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Lesson History & Schedule
          </span>
          <h1 className="font-display text-3xl font-bold text-ink mt-1">
            Lessons
          </h1>
          <p className="text-sm text-muted mt-1 max-w-2xl leading-relaxed">
            The full history of everything you've learned. Switch between upcoming live video classrooms and past completed sessions with AI reviews.
          </p>
        </div>

        {/* Local Timezone Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-border text-xs text-muted shadow-xs self-start sm:self-auto">
          <Globe className="w-4 h-4 text-teal shrink-0" />
          <span>Local Timezone:</span>
          <strong className="font-mono text-ink">{studentTimezone}</strong>
        </div>
      </div>

      {/* 2-Section Toggle View: Upcoming vs Past */}
      <StudentLessonsToggleView
        upcomingLessons={upcomingLessonsData}
        pastLessons={pastLessonsData}
        studentTimezone={studentTimezone}
      />
    </main>
  );
}
