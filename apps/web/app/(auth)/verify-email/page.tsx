import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Mail, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[20px] font-bold text-white shadow-sm">
              L
            </div>
            <div>
              <span className="font-display text-[22px] font-semibold text-ink">
                LinguaClass
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-8 rounded-[var(--r-lg)] border border-border bg-surface p-6 sm:p-10 shadow-sm text-center">
          <div className="size-12 rounded-full bg-teal-light border border-teal-mid text-teal flex items-center justify-center mx-auto mb-4">
            <Mail className="size-6" />
          </div>

          <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">
            Check your email
          </h2>
          <p className="mt-2 text-[14px] text-muted leading-relaxed">
            We have sent a verification link to your email address. Please click the link to confirm your account and complete your teacher setup.
          </p>

          <div className="mt-6 rounded-[var(--r-md)] border border-border bg-surface-2 p-4 text-left text-[12px] text-muted space-y-1">
            <p className="font-semibold text-ink">Didn't receive the email?</p>
            <p>• Check your spam or promotions folder</p>
            <p>• Make sure your email address was typed accurately</p>
          </div>

          <div className="mt-8">
            <Link href="/login" className="block">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                Return to Sign In
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
