import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ProgressRing } from "@/components/student/progress-ring";
import { ResourceList } from "@/components/resources/resource-list";
import { formatInTimezone } from "@/lib/date-utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Paperclip,
  BookOpen,
  CheckCircle2,
  Video,
  Sparkles,
  Shield,
  FileText,
} from "lucide-react";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;
  const studentTimezone = session.dbUser.timezone || "UTC";

  // Verify student enrollment and load full course data
  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentProfileId: {
        courseId,
        studentProfileId: student.id,
      },
    },
    include: {
      course: {
        include: {
          teacher: {
            include: { user: true },
          },
          lessons: {
            include: {
              resources: true,
              session: {
                include: {
                  aiAnalysis: true,
                },
              },
            },
            orderBy: { scheduledAt: "asc" },
          },
          resources: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      },
    },
  });

  if (!enrollment) {
    notFound();
  }

  const { course } = enrollment;
  const now = new Date();

  const getLevelVariant = (level: string) => {
    if (level.startsWith("A")) return "cefr-a" as const;
    if (level.startsWith("B")) return "cefr-b" as const;
    return "cefr-c" as const;
  };

  const completedLessons = course.lessons.filter((l) => l.status === "COMPLETED");
  const upcomingLessons = course.lessons.filter(
    (l) => l.status === "SCHEDULED" || l.status === "LIVE"
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/student/classes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Classes</span>
        </Link>
      </div>

      {/* Course Hero & Header */}
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-2 text-ink">
                {course.language}
              </span>
              <Badge variant={getLevelVariant(course.level)}>
                CEFR {course.level}
              </Badge>
              <span className="text-xs font-medium text-muted">
                Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Progress Ring Card */}
          <div className="p-4 rounded-2xl bg-surface-2/80 border border-border/80 flex items-center gap-4 shrink-0">
            <ProgressRing
              completed={completedLessons.length}
              total={course.lessons.length}
              size={56}
              strokeWidth={5}
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                Course Progress
              </span>
              <div className="text-base font-bold text-ink">
                {completedLessons.length} / {course.lessons.length}
              </div>
              <span className="text-[11px] text-teal">
                Lessons completed
              </span>
            </div>
          </div>
        </div>

        {/* Course Info Cards Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/80">
          {/* Teacher Info */}
          <div className="p-4 rounded-xl bg-surface-2/50 border border-border/60 flex items-center gap-3">
            {course.teacher.user.avatarUrl ? (
              <img
                src={course.teacher.user.avatarUrl}
                alt={course.teacher.user.name}
                className="size-10 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-10 rounded-full bg-teal-light text-teal font-display text-sm font-bold flex items-center justify-center border border-teal/20">
                {course.teacher.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                Instructor
              </span>
              <span className="text-sm font-bold text-ink block truncate">
                {course.teacher.user.name}
              </span>
            </div>
          </div>

          {/* Enrolled Students Count (Privacy Respecting) */}
          <div className="p-4 rounded-xl bg-surface-2/50 border border-border/60 flex items-center gap-3">
            <div className="size-10 rounded-full bg-surface text-teal flex items-center justify-center border border-border shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                Class Size
                <span title="Student names are kept confidential">
                  <Shield className="w-3 h-3 text-teal" />
                </span>
              </span>
              <span className="text-sm font-bold text-ink block truncate">
                {course._count.enrollments} Enrolled Students
              </span>
              <span className="text-[10px] text-muted block">
                Private peer environment
              </span>
            </div>
          </div>

          {/* Total Course Materials */}
          <div className="p-4 rounded-xl bg-surface-2/50 border border-border/60 flex items-center gap-3">
            <div className="size-10 rounded-full bg-surface text-amber flex items-center justify-center border border-border shrink-0">
              <Paperclip className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                Course Resources
              </span>
              <span className="text-sm font-bold text-ink block truncate">
                {course.resources.length} Attached Handouts
              </span>
              <span className="text-[10px] text-muted block">
                Available for download
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Level Resources (Handouts attached to the course) */}
      {course.resources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-teal" />
                Course Materials & Handouts ({course.resources.length})
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Teacher-curated study guides, syllabi, and reference sheets for this course.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <ResourceList resources={course.resources} canDelete={false} />
          </div>
        </section>
      )}

      {/* Lessons Curriculum (Upcoming + Past Sessions) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal" />
              Curriculum & Lesson Schedule ({course.lessons.length})
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Times displayed in your timezone: <strong>{studentTimezone}</strong>
            </p>
          </div>
        </div>

        {course.lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted text-xs">
            No lessons scheduled yet for this course.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {course.lessons.map((lesson) => {
              const formattedDate = formatInTimezone(
                lesson.scheduledAt,
                studentTimezone,
                {
                  timeZone: studentTimezone,
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }
              );

              const isLive = lesson.status === "LIVE";
              const isCompleted = lesson.status === "COMPLETED";

              return (
                <div
                  key={lesson.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                    isLive
                      ? "border-green-500/50 bg-green-500/5 shadow-sm ring-1 ring-green-500/20"
                      : isCompleted
                      ? "border-border bg-surface/70"
                      : "border-border bg-surface shadow-xs hover:border-teal/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <Badge variant="live">LIVE CLASSROOM ACTIVE</Badge>
                        ) : isCompleted ? (
                          <Badge variant="completed">COMPLETED</Badge>
                        ) : lesson.status === "CANCELLED" ? (
                          <Badge variant="error">CANCELLED</Badge>
                        ) : (
                          <Badge variant="scheduled">SCHEDULED</Badge>
                        )}
                        <span className="text-[11px] text-muted">
                          {lesson.durationMins} mins
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold text-ink">
                      {lesson.title}
                    </h3>

                    {/* Formatted Date */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink p-2.5 rounded-lg bg-surface-2/60 border border-border/60">
                      <Clock className="w-3.5 h-3.5 text-teal shrink-0" />
                      <span>{formattedDate}</span>
                    </div>

                    {/* Objectives */}
                    {lesson.objectives && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                          Curriculum Focus:
                        </span>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {lesson.objectives}
                        </p>
                      </div>
                    )}

                    {/* Attached lesson materials */}
                    {lesson.resources.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted pt-1">
                        <Paperclip className="w-3.5 h-3.5 text-teal" />
                        <span>{lesson.resources.length} Lesson Attachment{lesson.resources.length > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                    {isLive ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Live Classroom</span>
                      </Button>
                    ) : lesson.status === "SCHEDULED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-2"
                        onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
                      >
                        <Video className="w-3.5 h-3.5 text-teal" />
                        <span>Preview Classroom</span>
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between w-full text-xs text-muted">
                        <span className="flex items-center gap-1 text-teal font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Session Completed
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-teal hover:bg-teal-light/20 h-8"
                          onClick={() => window.open(`/classroom/${lesson.id}`, "_blank")}
                        >
                          View Room
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
