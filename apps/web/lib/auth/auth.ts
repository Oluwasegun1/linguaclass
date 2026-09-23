import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db, Role, CourseLevel, type User, type TeacherProfile, type StudentProfile } from "@workspace/database";

export interface CurrentUserSession {
  supabaseUser: {
    id: string;
    email?: string;
  };
  dbUser: User & {
    teacherProfile: TeacherProfile | null;
    studentProfile: StudentProfile | null;
  };
}

/**
 * Retrieves the currently authenticated user session from Supabase Auth
 * and attaches the corresponding Prisma database user record.
 * Performs automatic self-healing sync if the database profile is missing or out of sync.
 */
export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const normalizedEmail = (user.email || "").trim().toLowerCase();

  // 1. Search by supabaseId OR normalized email
  let dbUser = await db.user.findFirst({
    where: {
      OR: [
        { supabaseId: user.id },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ],
    },
    include: {
      teacherProfile: true,
      studentProfile: true,
    },
  });

  // 2. Self-healing: Update supabaseId if found by email with mismatched id
  if (dbUser && dbUser.supabaseId !== user.id) {
    try {
      dbUser = await db.user.update({
        where: { id: dbUser.id },
        data: { supabaseId: user.id },
        include: {
          teacherProfile: true,
          studentProfile: true,
        },
      });
    } catch (err) {
      console.error("Failed to heal supabaseId on dbUser:", err);
    }
  }

  // 3. Self-healing: If user is authenticated in Supabase but completely missing in Prisma, auto-provision
  if (!dbUser && normalizedEmail) {
    try {
      const meta = user.user_metadata || {};
      const role = meta.role === "STUDENT" ? Role.STUDENT : Role.TEACHER;
      const name = meta.name || normalizedEmail.split("@")[0] || "User";
      const timezone = meta.timezone || "UTC";
      const languages = meta.languages || ["French"];

      if (role === Role.TEACHER) {
        const createdUser = await db.user.create({
          data: {
            supabaseId: user.id,
            email: normalizedEmail,
            name,
            role: Role.TEACHER,
            timezone,
            teacherProfile: {
              create: {
                languages,
                bio: `Language instructor.`,
              },
            },
          },
          include: {
            teacherProfile: true,
            studentProfile: true,
          },
        });

        // Ensure default course
        if (createdUser.teacherProfile) {
          const primaryLanguage = languages[0] || "French";
          await db.course.create({
            data: {
              teacherId: createdUser.teacherProfile.id,
              title: `${primaryLanguage} Fundamentals (A1)`,
              language: primaryLanguage,
              level: CourseLevel.A1,
              description: `Introductory ${primaryLanguage} course covering foundational grammar and conversational practice.`,
            },
          });
        }
        dbUser = createdUser;
      } else {
        dbUser = await db.user.create({
          data: {
            supabaseId: user.id,
            email: normalizedEmail,
            name,
            role: Role.STUDENT,
            timezone,
            studentProfile: {
              create: {
                isMinor: false,
              },
            },
          },
          include: {
            teacherProfile: true,
            studentProfile: true,
          },
        });
      }
    } catch (createErr) {
      console.error("Auto-provisioning Prisma user in getCurrentUser failed:", createErr);
      return null;
    }
  }

  // 4. Ensure associated profile exists according to role
  if (dbUser) {
    if (dbUser.role === Role.TEACHER && !dbUser.teacherProfile) {
      try {
        const tp = await db.teacherProfile.create({
          data: {
            userId: dbUser.id,
            languages: ["French"],
          },
        });
        dbUser.teacherProfile = tp;
      } catch (err) {
        console.error("Failed to auto-create teacher profile:", err);
      }
    } else if (dbUser.role === Role.STUDENT && !dbUser.studentProfile) {
      try {
        const sp = await db.studentProfile.create({
          data: {
            userId: dbUser.id,
          },
        });
        dbUser.studentProfile = sp;
      } catch (err) {
        console.error("Failed to auto-create student profile:", err);
      }
    }
  }

  if (!dbUser) {
    return null;
  }

  return {
    supabaseUser: {
      id: user.id,
      email: user.email,
    },
    dbUser,
  };
}

/**
 * Enforces that the request has an active authenticated user.
 * Redirects to /login if unauthenticated.
 */
export async function requireUser(): Promise<CurrentUserSession> {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Enforces that the active user is a TEACHER.
 * Redirects to /login if unauthenticated, or /unauthorized if role mismatch.
 */
export async function requireTeacher(): Promise<
  CurrentUserSession & {
    dbUser: User & { teacherProfile: TeacherProfile };
  }
> {
  const session = await requireUser();

  if (session.dbUser.role !== Role.TEACHER || !session.dbUser.teacherProfile) {
    redirect("/unauthorized");
  }

  return session as CurrentUserSession & {
    dbUser: User & { teacherProfile: TeacherProfile };
  };
}

/**
 * Enforces that the active user is a STUDENT.
 * Redirects to /login if unauthenticated, or /unauthorized if role mismatch.
 */
export async function requireStudent(): Promise<
  CurrentUserSession & {
    dbUser: User & { studentProfile: StudentProfile };
  }
> {
  const session = await requireUser();

  if (session.dbUser.role !== Role.STUDENT || !session.dbUser.studentProfile) {
    redirect("/unauthorized");
  }

  return session as CurrentUserSession & {
    dbUser: User & { studentProfile: StudentProfile };
  };
}

/**
 * Non-redirecting session retrieval for API Route Handlers.
 */
export async function getTeacherSession() {
  const session = await getCurrentUser();
  if (!session || session.dbUser.role !== Role.TEACHER || !session.dbUser.teacherProfile) {
    return null;
  }
  return session as CurrentUserSession & {
    dbUser: User & { teacherProfile: TeacherProfile };
  };
}

export async function getStudentSession() {
  const session = await getCurrentUser();
  if (!session || session.dbUser.role !== Role.STUDENT || !session.dbUser.studentProfile) {
    return null;
  }
  return session as CurrentUserSession & {
    dbUser: User & { studentProfile: StudentProfile };
  };
}
