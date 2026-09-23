"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db, Role, CourseLevel } from "@workspace/database";

export interface TeacherSignUpInput {
  name: string;
  email: string;
  password: string;
  languages?: string[];
  timezone?: string;
}

export interface ActionResult {
  success?: boolean;
  requiresVerification?: boolean;
  redirectPath?: string;
  error?: string;
}

/**
 * Teacher registration & onboarding Server Action.
 * 1. Validates input.
 * 2. Creates the Supabase auth user with role metadata.
 * 3. Pre-creates / syncs the Prisma User and TeacherProfile records (upsert / resilient sync).
 * 4. Creates an initial starter course so the teacher can immediately begin creating invites.
 */
export async function signUpTeacherAction(
  data: TeacherSignUpInput,
): Promise<ActionResult> {
  const { name, email, password, languages = ["French"], timezone = "UTC" } = data;
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail || !password || !name) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const supabase = await createClient();

  // 1. Supabase Auth signup
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        role: "TEACHER",
        name,
        languages,
        timezone,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user account. Please try again." };
  }

  const primaryLanguage = languages[0] || "French";

  try {
    // 2. Sync to Prisma User + TeacherProfile + Starter Course (Resilient Upsert)
    await db.$transaction(async (tx) => {
      // Find existing user by supabaseId OR normalized email
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { supabaseId: authData.user!.id },
            { email: normalizedEmail },
          ],
        },
        include: {
          teacherProfile: {
            include: { courses: true },
          },
        },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            supabaseId: authData.user!.id,
            email: normalizedEmail,
            name,
            role: Role.TEACHER,
            timezone,
            teacherProfile: {
              create: {
                languages,
                bio: `Language instructor specializing in ${primaryLanguage}.`,
              },
            },
          },
          include: {
            teacherProfile: {
              include: { courses: true },
            },
          },
        });
      } else {
        // User already exists in database — link with current supabaseId & update profile
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            supabaseId: authData.user!.id,
            name: name || user.name,
            timezone: timezone || user.timezone,
            role: Role.TEACHER,
          },
          include: {
            teacherProfile: {
              include: { courses: true },
            },
          },
        });

        if (!user.teacherProfile) {
          await tx.teacherProfile.create({
            data: {
              userId: user.id,
              languages,
              bio: `Language instructor specializing in ${primaryLanguage}.`,
            },
          });
        }
      }

      // 3. Ensure teacher has at least one starter course
      const teacherProfile = await tx.teacherProfile.findUnique({
        where: { userId: user.id },
        include: { courses: true },
      });

      if (teacherProfile && teacherProfile.courses.length === 0) {
        await tx.course.create({
          data: {
            teacherId: teacherProfile.id,
            title: `${primaryLanguage} Fundamentals (A1)`,
            language: primaryLanguage,
            level: CourseLevel.A1,
            description: `Introductory ${primaryLanguage} course covering foundational grammar, conversational vocabulary, and speaking practice.`,
          },
        });
      }
    });
  } catch (err: unknown) {
    console.error("Prisma teacher creation sync failed:", err);
    const detailMsg = (err as Error)?.message || "Profile database synchronization failed.";
    return {
      error: `Registration completed in authentication service, but database profile setup encountered an error: ${detailMsg}. Please try signing in.`,
    };
  }

  // Check if email confirmation is required by Supabase
  if (!authData.session) {
    return { requiresVerification: true };
  }

  return { success: true, redirectPath: "/teacher/dashboard" };
}

/**
 * Universal Login Server Action for both Teachers and Students.
 * Authenticates against Supabase and determines redirection by user role.
 */
export async function signInAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Authentication failed. Please verify credentials." };
  }

  // Look up user role in Prisma (by supabaseId or email) with graceful fallback
  let dbUser = null;
  try {
    dbUser = await db.user.findFirst({
      where: {
        OR: [
          { supabaseId: authData.user.id },
          { email },
        ],
      },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    // Self-heal supabaseId if matched by email
    if (dbUser && dbUser.supabaseId !== authData.user.id) {
      dbUser = await db.user.update({
        where: { id: dbUser.id },
        data: { supabaseId: authData.user.id },
        include: {
          teacherProfile: true,
          studentProfile: true,
        },
      });
    }
  } catch (dbErr) {
    console.warn("Database lookup during sign in deferred to metadata:", dbErr);
  }

  if (!dbUser) {
    // Fallback based on auth metadata
    const metaRole = authData.user.user_metadata?.role;
    if (metaRole === "STUDENT") {
      return { success: true, redirectPath: "/student/dashboard" };
    }
    return { success: true, redirectPath: "/teacher/dashboard" };
  }

  if (dbUser.role === Role.TEACHER) {
    return { success: true, redirectPath: "/teacher/dashboard" };
  } else if (dbUser.role === Role.STUDENT) {
    return { success: true, redirectPath: "/student/dashboard" };
  }

  return { success: true, redirectPath: "/" };
}

/**
 * Sign out Server Action.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
