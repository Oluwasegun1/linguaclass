"use client";

import { useState, useTransition } from "react";
import { createStudentInviteAction } from "@/actions/invite-actions";
import { Button } from "@workspace/ui/components/button";
import { Input, Select, FormField } from "@workspace/ui/components/form-elements";
import { Alert } from "@workspace/ui/components/alert";
import { Send, Copy, Check, Link as LinkIcon, Sparkles } from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
  language: string;
  level: string;
}

interface InviteCreatorProps {
  courses: CourseOption[];
}

export function InviteCreator({ courses }: InviteCreatorProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    courseId: courses[0]?.id || "",
    email: "",
    expirationDays: 7,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedUrl(null);
    setCopied(false);

    startTransition(async () => {
      const result = await createStudentInviteAction({
        courseId: formData.courseId,
        email: formData.email,
        expirationDays: Number(formData.expirationDays),
      });

      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        const origin = window.location.origin;
        setCreatedUrl(`${origin}/invite/${result.token}`);
        setFormData((prev) => ({ ...prev, email: "" }));
      }
    });
  }

  function handleCopy() {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 text-center text-muted text-[14px]">
        No courses found. Please create a course first before generating student invitations.
      </div>
    );
  }

  return (
    <div className="rounded-[var(--r-lg)] border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-9 rounded-[var(--r-md)] bg-teal-light border border-teal-mid text-teal flex items-center justify-center">
          <Send className="size-4.5" />
        </div>
        <div>
          <h2 className="font-display text-[18px] font-semibold text-ink">
            Generate Student Invitation
          </h2>
          <p className="text-[13px] text-muted">
            Send an invitation link for student registration and automatic course enrollment
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5">
          <Alert type="error" title="Invitation Error" message={error} />
        </div>
      )}

      {createdUrl && (
        <div className="mb-6 rounded-[var(--r-md)] border border-teal-mid bg-teal-light p-4">
          <div className="flex items-center gap-2 text-teal-dark font-semibold text-[14px] mb-2">
            <Sparkles className="size-4 text-teal" />
            Invitation Link Generated!
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={createdUrl}
              className="w-full px-3 py-2 bg-surface border border-border rounded-[var(--r-sm)] text-ink text-[13px] font-mono select-all outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Share this link with your student. It will automatically expire in{" "}
            {formData.expirationDays} days.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="course-select" label="Assigned Course" required>
            <Select
              id="course-select"
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              required
              disabled={isPending}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.language} · {course.level})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="student-email" label="Student Email Address" required>
            <Input
              id="student-email"
              type="email"
              required
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isPending}
            />
          </FormField>
        </div>

        <div>
          <FormField id="expiration-days" label="Link Expiration">
            <Select
              id="expiration-days"
              value={formData.expirationDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expirationDays: Number(e.target.value),
                })
              }
              disabled={isPending}
              className="w-full sm:w-64"
            >
              <option value={1}>24 Hours</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days (Default)</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </Select>
          </FormField>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            className="flex items-center gap-2"
          >
            <LinkIcon className="size-4" />
            Generate Student Invitation Link
          </Button>
        </div>
      </form>
    </div>
  );
}
