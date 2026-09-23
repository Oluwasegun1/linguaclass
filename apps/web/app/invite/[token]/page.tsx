import Link from "next/link";
import { validateInviteToken } from "@/actions/invite-actions";
import { StudentInviteForm } from "./invite-form";
import { Button } from "@workspace/ui/components/button";
import { BookOpen, User, Globe, AlertTriangle, ArrowLeft } from "lucide-react";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const result = await validateInviteToken(token);

  if (!result.valid || !result.invitation) {
    return (
      <div className="min-h-screen bg-page text-ink flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[20px] font-bold text-white shadow-sm">
                L
              </div>
              <span className="font-display text-[22px] font-semibold text-ink">
                LinguaClass
              </span>
            </Link>
          </div>

          <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 sm:p-10 shadow-sm text-center">
            <div className="size-12 rounded-full bg-coral-light border border-coral/30 text-coral flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-6" />
            </div>

            <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">
              Invalid or Expired Invitation
            </h2>
            <p className="mt-2 text-[14px] text-muted leading-relaxed">
              {result.error ??
                "This invitation link has expired, was already used, or does not exist."}
            </p>

            <div className="mt-6">
              <Link href="/login">
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { invitation } = result;

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[20px] font-bold text-white shadow-sm">
              L
            </div>
            <span className="font-display text-[22px] font-semibold text-ink">
              LinguaClass
            </span>
          </Link>
        </div>

        <h2 className="mt-6 font-display text-[28px] font-semibold tracking-tight text-ink">
          Join Your Course
        </h2>
        <p className="mt-1.5 text-[14px] text-muted">
          You've been invited by your instructor to begin learning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 sm:p-10 shadow-sm">
          {/* Course Details Preview Card */}
          <div className="mb-6 rounded-[var(--r-md)] border border-teal-mid bg-teal-light p-4 text-ink">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white text-teal-dark border border-teal-mid shadow-xs">
                  Level {invitation.level}
                </span>
                <h3 className="mt-2 font-display text-[18px] font-semibold text-teal-dark flex items-center gap-2">
                  <BookOpen className="size-5 text-teal shrink-0" />
                  {invitation.courseTitle}
                </h3>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-teal-mid/40 grid grid-cols-2 gap-2 text-[12px] text-teal-dark font-medium">
              <div className="flex items-center gap-1.5">
                <User className="size-4 text-teal" />
                <span>Instructor: <strong>{invitation.teacherName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="size-4 text-teal" />
                <span>Language: <strong>{invitation.language}</strong></span>
              </div>
            </div>
          </div>

          <StudentInviteForm
            token={token}
            email={invitation.email}
            courseTitle={invitation.courseTitle}
          />
        </div>
      </div>
    </div>
  );
}
