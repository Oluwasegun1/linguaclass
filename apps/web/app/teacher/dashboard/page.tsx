import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireTeacher } from "@/lib/auth/auth";
import { signOutAction } from "@/actions/auth-actions";
import { db } from "@workspace/database";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  BookOpen,
  Users,
  UserPlus,
  Clock,
  Globe,
  LogOut,
  Calendar,
  Layers,
} from "lucide-react";

export default async function TeacherDashboardPage() {
  const session = await requireTeacher();
  const teacher = session.dbUser.teacherProfile;

  // Fetch teacher's courses with enrolled students count
  const courses = await db.course.findMany({
    where: { teacherId: teacher.id },
    include: {
      enrollments: {
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      },
      lessons: {
        take: 3,
        orderBy: { scheduledAt: "asc" },
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true,
          invitations: {
            where: { status: "PENDING" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = courses.reduce(
    (acc, c) => acc + c._count.enrollments,
    0,
  );
  const pendingInvites = courses.reduce(
    (acc, c) => acc + c._count.invitations,
    0,
  );

  return (
    <div className="min-h-screen bg-page text-ink pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[18px] font-bold text-white shadow-xs">
                L
              </div>
              <span className="font-display text-[20px] font-semibold text-ink">
                LinguaClass
              </span>
            </Link>
            <span className="rounded-full bg-teal-light px-2.5 py-0.5 text-[11px] font-semibold text-teal border border-teal-mid/50">
              Teacher Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/teacher/courses">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-muted hover:text-ink">
                <BookOpen className="size-3.5 text-teal" />
                <span>Courses</span>
              </Button>
            </Link>
            <Link href="/teacher/schedule">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-muted hover:text-ink">
                <Calendar className="size-3.5 text-teal" />
                <span>Schedule</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Link href="/teacher/invites">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <UserPlus className="size-3.5" />
                <span>Invite</span>
              </Button>
            </Link>

            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted hover:text-ink"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <span className="text-[12px] font-semibold text-teal uppercase tracking-wider">
            Instructor Overview
          </span>
          <h1 className="font-display text-[26px] sm:text-[32px] font-semibold text-ink mt-1">
            Bonjour, {session.dbUser.name}
          </h1>
          <p className="mt-2 text-[14px] text-muted max-w-2xl leading-relaxed">
            Manage your language courses, generate student invitations, review AI-assisted lesson corrections, and host interactive video classrooms.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-[13px] text-ink">
            <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-[var(--r-md)] border border-border">
              <Globe className="size-4 text-teal" />
              <span>Languages: <strong>{teacher.languages.join(", ")}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-[var(--r-md)] border border-border">
              <Clock className="size-4 text-teal" />
              <span>Timezone: <strong>{session.dbUser.timezone}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-[var(--r-lg)] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted text-[13px]">
              <span>Active Courses</span>
              <BookOpen className="size-4 text-teal" />
            </div>
            <p className="font-display text-[28px] font-bold text-ink mt-2">
              {courses.length}
            </p>
          </div>

          <div className="rounded-[var(--r-lg)] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted text-[13px]">
              <span>Enrolled Students</span>
              <Users className="size-4 text-[#2E7D32]" />
            </div>
            <p className="font-display text-[28px] font-bold text-ink mt-2">
              {totalStudents}
            </p>
          </div>

          <div className="rounded-[var(--r-lg)] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted text-[13px]">
              <span>Pending Invitations</span>
              <Clock className="size-4 text-amber" />
            </div>
            <p className="font-display text-[28px] font-bold text-ink mt-2">
              {pendingInvites}
            </p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] font-semibold text-ink flex items-center gap-2">
              <Layers className="size-5 text-teal" />
              Your Courses
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/teacher/courses">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5" />
                  Manage Courses
                </Button>
              </Link>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-[var(--r-lg)] border border-border bg-surface p-8 text-center text-muted text-[14px] space-y-3">
              <p>No courses created yet.</p>
              <Link href="/teacher/courses">
                <Button variant="primary" size="sm">Create First Course</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-[var(--r-lg)] border border-border bg-surface p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          course.level.startsWith("A")
                            ? "cefr-a"
                            : course.level.startsWith("B")
                              ? "cefr-b"
                              : "cefr-c"
                        }
                      >
                        Level {course.level}
                      </Badge>
                      <span className="text-[12px] text-muted font-medium">
                        {course.language}
                      </span>
                    </div>

                    <Link href={`/teacher/courses/${course.id}`}>
                      <h3 className="font-display text-[18px] font-semibold text-ink hover:text-teal transition-colors mt-2">
                        {course.title}
                      </h3>
                    </Link>
                    {course.description && (
                      <p className="text-[13px] text-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-4 text-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="size-4 text-teal" />
                        {course._count.enrollments} Students
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="size-4 text-teal" />
                        {course._count.lessons} Lessons
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/teacher/courses/${course.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Curriculum
                        </Button>
                      </Link>
                      <Link href={`/teacher/invites?courseId=${course.id}`}>
                        <Button variant="ghost" size="sm" className="text-teal font-medium text-xs">
                          Invite
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
