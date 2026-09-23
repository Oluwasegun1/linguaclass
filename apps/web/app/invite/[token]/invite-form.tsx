"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptStudentInviteAction } from "@/actions/invite-actions";
import { Button } from "@workspace/ui/components/button";
import { Input, FormField } from "@workspace/ui/components/form-elements";
import { Alert } from "@workspace/ui/components/alert";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface InviteFormProps {
  token: string;
  email: string;
  courseTitle: string;
}

export function StudentInviteForm({ token, email, courseTitle }: InviteFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await acceptStudentInviteAction({
        token,
        name: formData.name,
        password: formData.password,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.redirectPath) {
        router.push(result.redirectPath);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4">
          <Alert type="error" title="Enrollment Error" message={error} />
        </div>
      )}

      {/* Pre-filled Email */}
      <FormField id="invited-email" label="Invited Email Address">
        <div className="flex items-center justify-between rounded-[var(--r-md)] border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink">
          <span className="font-mono text-[13px]">{email}</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-teal bg-teal-light border border-teal-mid/50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="size-3" />
            Verified
          </span>
        </div>
      </FormField>

      {/* Full Name */}
      <FormField id="student-name" label="Your Full Name" required>
        <Input
          id="student-name"
          type="text"
          required
          placeholder="e.g. Alex Johnson"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isPending}
        />
      </FormField>

      {/* Password */}
      <FormField
        id="student-password"
        label="Create Password"
        hint="Minimum 8 characters"
        required
      >
        <Input
          id="student-password"
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

      <div className="rounded-[var(--r-md)] border border-amber/30 bg-amber-light p-3.5 text-[12px] text-ink leading-relaxed">
        By activating your invitation, you will automatically be enrolled into{" "}
        <strong className="font-semibold text-ink">{courseTitle}</strong> and gain access to your live sessions, vocabulary banks, and assignments.
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="amber"
          loading={isPending}
          className="w-full flex items-center justify-center gap-2"
        >
          Join Class & Activate Enrollment
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
