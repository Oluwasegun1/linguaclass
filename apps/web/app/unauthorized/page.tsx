import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { signOutAction } from "@/actions/auth-actions";
import { Button } from "@workspace/ui/components/button";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export default async function UnauthorizedPage() {
  const session = await getCurrentUser();
  const role = session?.dbUser.role;

  const dashboardPath =
    role === "TEACHER"
      ? "/teacher/dashboard"
      : role === "STUDENT"
        ? "/student/dashboard"
        : "/";

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
            <ShieldAlert className="size-6" />
          </div>

          <h1 className="font-display text-[24px] font-semibold tracking-tight text-ink">
            Access Restricted
          </h1>
          <p className="mt-2 text-[14px] text-muted leading-relaxed">
            You do not have permission to view this section with your current account (
            <strong className="text-ink">{role ?? "Anonymous"}</strong>).
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={dashboardPath} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full inline-flex items-center justify-center gap-2">
                <ArrowLeft className="size-4" />
                Return to Your Dashboard
              </Button>
            </Link>

            <form action={signOutAction} className="w-full sm:w-auto">
              <Button
                type="submit"
                variant="ghost"
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <LogOut className="size-4" />
                Sign in with another account
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
