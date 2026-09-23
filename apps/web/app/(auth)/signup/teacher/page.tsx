"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpTeacherAction } from "@/actions/auth-actions";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input, Select, FormField } from "@workspace/ui/components/form-elements";
import { Alert } from "@workspace/ui/components/alert";
import { ArrowRight, BookOpen, Globe, Clock } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  "French",
  "Spanish",
  "German",
  "Italian",
  "Japanese",
  "Mandarin Chinese",
  "Portuguese",
  "Arabic",
  "Russian",
  "English",
];

const COMMON_TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Africa/Lagos",
  "Africa/Johannesburg",
];

export default function TeacherSignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    language: "French",
    timezone: "UTC",
  });

  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) {
        setFormData((prev) => ({ ...prev, timezone: userTz }));
      }
    } catch {
      // Fall back to UTC
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signUpTeacherAction({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        languages: [formData.language],
        timezone: formData.timezone,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.requiresVerification) {
        router.push("/verify-email");
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
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
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
          Teacher Registration
        </h2>
        <p className="mt-1.5 text-center text-[14px] text-muted">
          Create your teacher account to host live language lessons and invite students
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 sm:p-10 shadow-sm">
          {error && (
            <div className="mb-6">
              <Alert type="error" title="Registration Error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="name" label="Full Name" required>
              <Input
                id="name"
                type="text"
                required
                placeholder="e.g. Marie Dubois"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isPending}
              />
            </FormField>

            <FormField id="email" label="Email address" required>
              <Input
                id="email"
                type="email"
                required
                placeholder="marie@linguaclass.org"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              hint="Must be at least 8 characters"
              required
            >
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isPending}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <FormField
                id="language"
                label="Primary Language"
                hint="Default course language"
                required
              >
                <Select
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  disabled={isPending}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                id="timezone"
                label="Primary Timezone"
                hint="Used for lesson schedules"
                required
              >
                <Select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  disabled={isPending}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                  {!COMMON_TIMEZONES.includes(formData.timezone) && (
                    <option value={formData.timezone}>
                      {formData.timezone} (Detected)
                    </option>
                  )}
                </Select>
              </FormField>
            </div>

            {/* Starter Course Banner */}
            <div className="rounded-[var(--r-md)] border border-teal-mid bg-teal-light p-4 text-[13px] text-ink">
              <div className="flex items-start gap-2.5">
                <BookOpen className="size-4.5 text-teal shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-teal-dark block">
                    Automatic Starter Course
                  </span>
                  <p className="mt-0.5 text-muted leading-relaxed">
                    We will automatically set up your starter course (
                    <strong className="font-semibold text-ink">
                      {formData.language} Fundamentals A1
                    </strong>
                    ) so you can immediately generate invitations for your students.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
                className="w-full flex items-center justify-center gap-2"
              >
                Complete Teacher Registration
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-[13px] text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-teal hover:text-teal-dark hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
