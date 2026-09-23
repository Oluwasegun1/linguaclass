import Link from "next/link";
import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { StudentCourseCard } from "@/components/student/student-course-card";
import { GraduationCap, Sparkles } from "lucide-react";

export default async function StudentClassesPage() {
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;
  const studentTimezone = session.dbUser.timezone || "UTC";

  // Fetch all enrolled courses with lessons and teacher profile
  const enrollments = await db.enrollment.findMany({
    where: { studentProfileId: student.id },
    include: {
      course: {
        include: {
          teacher: {
            include: { user: true },
          },
          lessons: {
            orderBy: { scheduledAt: "asc" },
          },
          resources: true,
          enrollments: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const now = new Date();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> Academic Curriculum
          </span>
          <h1 className="font-display text-3xl font-bold text-ink mt-1">
            My Classes ({enrollments.length})
          </h1>
          <p className="text-sm text-muted mt-1 max-w-2xl leading-relaxed">
            Select an enrolled class to view its full syllabus, scheduled lessons, course materials, and curriculum objectives.
          </p>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-lg mx-auto space-y-3 shadow-xs">
          <div className="size-12 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">
            No Classes Enrolled Yet
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            You haven't joined any classes yet. Ask your language instructor for an enrollment invitation link or token.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(({ course }) => {
            const completedLessons = course.lessons.filter(
              (l) => l.status === "COMPLETED"
            ).length;

            const upcomingLesson = course.lessons.find(
              (l) =>
                (l.status === "SCHEDULED" || l.status === "LIVE") &&
                new Date(l.scheduledAt).getTime() >= now.getTime() - 2 * 60 * 60 * 1000
            );

            return (
              <StudentCourseCard
                key={course.id}
                course={{
                  id: course.id,
                  title: course.title,
                  language: course.language,
                  level: course.level,
                  description: course.description,
                  teacher: {
                    name: course.teacher.user.name,
                    avatarUrl: course.teacher.user.avatarUrl,
                  },
                  totalLessons: course.lessons.length,
                  completedLessons,
                  nextLessonScheduledAt: upcomingLesson
                    ? upcomingLesson.scheduledAt.toISOString()
                    : null,
                  nextLessonTitle: upcomingLesson ? upcomingLesson.title : null,
                  resourceCount: course.resources.length,
                }}
                studentTimezone={studentTimezone}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
