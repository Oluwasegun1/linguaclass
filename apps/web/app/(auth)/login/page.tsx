"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "@/actions/auth-actions";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input, FormField } from "@workspace/ui/components/form-elements";
import { Alert } from "@workspace/ui/components/alert";
import { ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signInAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.redirectPath) {
        router.push(result.redirectPath);
      }
    });
  }

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
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

        <h2 className="mt-6 text-center font-display text-[28px] font-semibold tracking-tight text-ink">
          Welcome back
        </h2>
        <p className="mt-1.5 text-center text-[14px] text-muted">
          Sign in to your teacher or student account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6">
              <Alert type="error" title="Sign In Error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="email" label="Email address" required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                disabled={isPending}
              />
            </FormField>

            <FormField id="password" label="Password" required>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                disabled={isPending}
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
                className="w-full flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center space-y-2">
            <p className="text-[13px] text-muted">
              Are you a teacher?{" "}
              <Link
                href="/signup/teacher"
                className="font-semibold text-teal hover:text-teal-dark hover:underline"
              >
                Create teacher account
              </Link>
            </p>
            <p className="text-[12px] text-muted flex items-center justify-center gap-1">
              <BookOpen className="size-3.5 text-teal" />
              Students register via invitation link from their instructor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
