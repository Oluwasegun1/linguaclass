import { NextResponse } from "next/server";
import { getCurrentUser, getTeacherSession } from "@/lib/auth/auth";
import { canAccessCourse } from "@/lib/auth/access";
import { deleteLessonsCascade } from "@/lib/db/delete-lessons";
import { db, CourseLevel } from "@workspace/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                timezone: true,
              },
            },
          },
        },
        lessons: {
          orderBy: {
            scheduledAt: "asc",
          },
          include: {
            session: true,
            resources: true,
            _count: {
              select: {
                assignments: true,
                notes: true,
              },
            },
          },
        },
        resources: {
          orderBy: {
            createdAt: "desc",
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    timezone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!canAccessCourse(session, course)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Failed to get course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const course = await db.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this course" }, { status: 403 });
    }

    const body = await req.json();
    const { title, language, level, description } = body;

    const data: {
      title?: string;
      language?: string;
      level?: CourseLevel;
      description?: string | null;
    } = {};

    if (title && typeof title === "string") data.title = title.trim();
    if (language && typeof language === "string") data.language = language.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;

    if (level) {
      const validLevels = Object.values(CourseLevel);
      if (!validLevels.includes(level as CourseLevel)) {
        return NextResponse.json(
          { error: `Level must be one of: ${validLevels.join(", ")}` },
          { status: 400 }
        );
      }
      data.level = level as CourseLevel;
    }

    const updated = await db.course.update({
      where: { id },
      data,
    });

    return NextResponse.json({ course: updated });
  } catch (error) {
    console.error("Failed to update course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const course = await db.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this course" }, { status: 403 });
    }

    // Clean up associated resources and lessons
    await db.$transaction(async (tx) => {
      // Find lessons
      const lessons = await tx.lesson.findMany({
        where: { courseId: id },
        select: { id: true },
      });
      const lessonIds = lessons.map((l) => l.id);

      // Delete lessons with their session subtree, assignments, notes, resources
      await deleteLessonsCascade(tx, lessonIds);

      // Delete remaining course-level resources
      await tx.resource.deleteMany({
        where: { courseId: id },
      });

      // Delete enrollments
      await tx.enrollment.deleteMany({
        where: { courseId: id },
      });


      // Delete course
      await tx.course.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
