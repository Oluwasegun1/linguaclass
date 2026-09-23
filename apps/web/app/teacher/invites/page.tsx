import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireTeacher } from "@/lib/auth/auth";
import { db, InvitationStatus } from "@workspace/database";
import { InviteCreator } from "./invite-creator";
import { Badge } from "@workspace/ui/components/badge";
import { Users, ArrowLeft, Calendar } from "lucide-react";

export default async function TeacherInvitesPage() {
  const teacherSession = await requireTeacher();
  const teacherProfileId = teacherSession.dbUser.teacherProfile.id;

  // 1. Fetch courses owned by this teacher
  const courses = await db.course.findMany({
    where: { teacherId: teacherProfileId },
    select: {
      id: true,
      title: true,
      language: true,
      level: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch all student invitations issued by this teacher
  const invitations = await db.studentInvitation.findMany({
    where: { teacherId: teacherProfileId },
    include: {
      course: {
        select: {
          title: true,
          language: true,
          level: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-page text-ink pb-16">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-1.5 text-muted hover:text-ink text-[13px] font-medium transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[16px] font-bold text-white">
                L
              </div>
              <span className="font-display text-[18px] font-semibold text-ink">
                Student Invitations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted hidden sm:inline">
              Instructor: <strong className="text-ink">{teacherSession.dbUser.name}</strong>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
            Course Student Invitations
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Generate and manage invitation links. When a student registers with your
            link, they will be automatically enrolled in your assigned course.
          </p>
        </div>

        {/* Invite Generator Form */}
        <InviteCreator courses={courses} />

        {/* Invitation History Table */}
        <div className="rounded-[var(--r-lg)] border border-border bg-surface overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <Users className="size-4.5 text-teal" />
              <h3 className="font-display text-[17px] font-semibold text-ink">
                Invitation History ({invitations.length})
              </h3>
            </div>
          </div>

          {invitations.length === 0 ? (
            <div className="py-12 text-center text-muted text-[14px]">
              No student invitations sent yet. Use the form above to invite your first student!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] text-ink">
                <thead className="bg-surface-2 text-[12px] font-semibold text-muted uppercase tracking-wider border-b border-border">
                  <tr>
                    <th scope="col" className="py-3 px-5">Student Email</th>
                    <th scope="col" className="py-3 px-5">Course</th>
                    <th scope="col" className="py-3 px-5">Status</th>
                    <th scope="col" className="py-3 px-5">Sent Date</th>
                    <th scope="col" className="py-3 px-5">Expiration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invitations.map((inv) => {
                    const isExpired =
                      inv.status === InvitationStatus.PENDING &&
                      new Date(inv.expiresAt) < new Date();

                    return (
                      <tr key={inv.id} className="hover:bg-surface-2/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-[13px] font-medium text-ink">
                          {inv.email}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-ink">
                            {inv.course.title}
                          </span>
                          <span className="ml-2 text-[12px] text-muted">
                            ({inv.course.level})
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          {inv.status === InvitationStatus.ACCEPTED && (
                            <Badge variant="live">Enrolled</Badge>
                          )}
                          {inv.status === InvitationStatus.PENDING && !isExpired && (
                            <Badge variant="pending">Pending</Badge>
                          )}
                          {(inv.status === InvitationStatus.EXPIRED || isExpired) && (
                            <Badge variant="error">Expired</Badge>
                          )}
                          {inv.status === InvitationStatus.REVOKED && (
                            <Badge variant="completed">Revoked</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-muted">
                          {new Date(inv.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-muted">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-muted" />
                            <span>
                              {new Date(inv.expiresAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
