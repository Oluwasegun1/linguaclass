"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db, Role, InvitationStatus } from "@workspace/database";

export interface CreateInviteInput {
  courseId: string;
  email: string;
  expirationDays?: number;
}

export interface CreateInviteResult {
  success?: boolean;
  error?: string;
  inviteUrl?: string;
  token?: string;
  expiresAt?: Date;
}

export interface ValidateInviteResult {
  valid: boolean;
  error?: string;
  invitation?: {
    id: string;
    email: string;
    courseId: string;
    courseTitle: string;
    language: string;
    level: string;
    teacherName: string;
    expiresAt: Date;
  };
}

export interface AcceptInviteInput {
  token: string;
  name: string;
  password: string;
}

export interface AcceptInviteResult {
  success?: boolean;
  error?: string;
  redirectPath?: string;
}

/**
 * Creates a student invitation link for a course.
 * Enforces that caller is an authenticated TEACHER who owns the course.
 */
export async function createStudentInviteAction(
  data: CreateInviteInput,
): Promise<CreateInviteResult> {
  const { courseId, email, expirationDays = 7 } = data;

  if (!courseId || !email) {
    return { error: "Course and student email are required." };
  }

  // 1. Enforce teacher permission
  const teacherSession = await requireTeacher();
  const teacherProfileId = teacherSession.dbUser.teacherProfile.id;

  // 2. Verify course belongs to this teacher
  const course = await db.course.findFirst({
    where: {
      id: courseId,
      teacherId: teacherProfileId,
    },
  });

  if (!course) {
    return { error: "Course not found or unauthorized to manage this course." };
  }

  // 3. Generate secure cryptographic token
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

  try {
    const invitation = await db.studentInvitation.create({
      data: {
        email: email.trim().toLowerCase(),
        token,
        courseId: course.id,
        teacherId: teacherProfileId,
        expiresAt,
        status: InvitationStatus.PENDING,
      },
    });

    revalidatePath("/teacher/invites");

    return {
      success: true,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      inviteUrl: `/invite/${invitation.token}`,
    };
  } catch (err: unknown) {
    console.error("Failed to create student invitation:", err);
    return { error: "Failed to generate student invitation. Please try again." };
  }
}

/**
 * Validates a student invitation token without accepting it.
 * Verifies existence, pending status, and expiration.
 */
export async function validateInviteToken(
  token: string,
): Promise<ValidateInviteResult> {
  if (!token) {
    return { valid: false, error: "Invitation token missing." };
  }

  const invitation = await db.studentInvitation.findUnique({
    where: { token },
    include: {
      course: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    return { valid: false, error: "Invitation link not found or invalid." };
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return {
      valid: false,
      error: `This invitation has already been ${invitation.status.toLowerCase()}.`,
    };
  }

  if (invitation.expiresAt < new Date()) {
    // Optionally update status to EXPIRED
    await db.studentInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
    return { valid: false, error: "This invitation link has expired." };
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      courseId: invitation.course.id,
      courseTitle: invitation.course.title,
      language: invitation.course.language,
      level: invitation.course.level,
      teacherName: invitation.course.teacher.user.name,
      expiresAt: invitation.expiresAt,
    },
  };
}

/**
 * Accepts an invitation:
 * 1. Creates Supabase user with email_confirm: true (since teacher invited verified email)
 * 2. Creates Prisma User (role: STUDENT) + StudentProfile
 * 3. Enrolls the student in the target course
 * 4. Marks invitation as ACCEPTED
 * 5. Signs student into session cookies
 */
export async function acceptStudentInviteAction(
  data: AcceptInviteInput,
): Promise<AcceptInviteResult> {
  const { token, name, password } = data;

  if (!token || !name || !password) {
    return { error: "Name and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  // 1. Validate the invitation token
  const check = await validateInviteToken(token);
  if (!check.valid || !check.invitation) {
    return { error: check.error ?? "Invalid invitation token." };
  }

  const { email, courseId, id: invitationId } = check.invitation;
  const adminClient = createAdminClient();

  // 2. Create the user in Supabase Auth (pre-confirmed via invitation)
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "STUDENT",
        name,
      },
    });

  if (authError) {
    // If user already exists in auth, handle error
    if (authError.message.includes("already")) {
      return {
        error:
          "An account with this email already exists. Please log in or contact your teacher.",
      };
    }
    return { error: authError.message };
  }

  const supabaseUser = authData.user;
  if (!supabaseUser) {
    return { error: "Could not create user credentials." };
  }

  // 3. Database transaction: User + StudentProfile + CourseEnrollment + Progress + Mark Invite ACCEPTED
  try {
    const normalizedEmail = email.trim().toLowerCase();
    await db.$transaction(async (tx) => {
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { supabaseId: supabaseUser.id },
            { email: normalizedEmail },
          ],
        },
        include: {
          studentProfile: true,
        },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            supabaseId: supabaseUser.id,
            email: normalizedEmail,
            name,
            role: Role.STUDENT,
            studentProfile: {
              create: {
                isMinor: false,
              },
            },
          },
          include: {
            studentProfile: true,
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            supabaseId: supabaseUser.id,
            name: name || user.name,
            role: Role.STUDENT,
          },
          include: {
            studentProfile: true,
          },
        });

        if (!user.studentProfile) {
          await tx.studentProfile.create({
            data: {
              userId: user.id,
              isMinor: false,
            },
          });
        }
      }

      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId: user.id },
      });

      const studentProfileId = studentProfile!.id;

      // Auto-enroll student into the assigned Course if not already enrolled
      await tx.enrollment.upsert({
        where: {
          courseId_studentProfileId: {
            courseId,
            studentProfileId,
          },
        },
        create: {
          courseId,
          studentProfileId,
        },
        update: {},
      });

      // Initialize student course progress if not existing
      const existingProgress = await tx.progress.findFirst({
        where: {
          courseId,
          studentProfileId,
        },
      });

      if (!existingProgress) {
        await tx.progress.create({
          data: {
            courseId,
            studentProfileId,
          },
        });
      }

      // Invalidate the invitation token
      await tx.studentInvitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });
    });
  } catch (err: unknown) {
    console.error("Failed to enroll student:", err);
    return {
      error: "Encountered an issue finalizing enrollment. Please try again.",
    };
  }

  // 4. Sign in the student so session cookies are placed onto the browser response
  const client = await createClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.warn("Auto-signin after invite acceptance failed:", signInError);
    // Even if auto-sign-in cookie setting fails, registration succeeded
    return { success: true, redirectPath: "/login" };
  }

  return { success: true, redirectPath: "/student/dashboard" };
}
