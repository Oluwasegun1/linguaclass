import { NextResponse } from "next/server";
import { getCurrentUser, getTeacherSession } from "@/lib/auth/auth";
import { db, SessionStatus } from "@workspace/database";

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
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        course: {
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
        },
        session: true,
        resources: true,
        assignments: true,
        notes: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Failed to get lesson:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        course: true,
        session: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this lesson's course" }, { status: 403 });
    }

    const body = await req.json();
    const { title, scheduledAt, durationMins, timezone, objectives, status } = body;

    const dataToUpdate: any = {};

    if (title && typeof title === "string") {
      dataToUpdate.title = title.trim();
    }

    if (scheduledAt) {
      const parsedDate = new Date(scheduledAt);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid scheduledAt format" }, { status: 400 });
      }
      dataToUpdate.scheduledAt = parsedDate;
    }

    if (durationMins !== undefined) {
      dataToUpdate.durationMins = parseInt(durationMins, 10) || 60;
    }

    if (timezone && typeof timezone === "string") {
      dataToUpdate.timezone = timezone.trim();
    }

    if (objectives !== undefined) {
      dataToUpdate.objectives = objectives ? objectives.trim() : null;
    }

    if (status) {
      if (!Object.values(SessionStatus).includes(status as SessionStatus)) {
        return NextResponse.json(
          { error: `Status must be one of: ${Object.values(SessionStatus).join(", ")}` },
          { status: 400 }
        );
      }
      dataToUpdate.status = status as SessionStatus;
    }

    // Execute update and sync Session status if needed
    const updated = await db.$transaction(async (tx) => {
      const updatedLesson = await tx.lesson.update({
        where: { id },
        data: dataToUpdate,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              language: true,
              level: true,
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
          },
          session: true,
          resources: true,
        },
      });

      if (dataToUpdate.status && lesson.session) {
        await tx.session.update({
          where: { id: lesson.session.id },
          data: { status: dataToUpdate.status },
        });
      }

      return updatedLesson;
    });

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error("Failed to update lesson:", error);
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
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this lesson" }, { status: 403 });
    }

    await db.$transaction(async (tx) => {
      // Delete session
      await tx.session.deleteMany({
        where: { lessonId: id },
      });

      // Delete resources linked directly to this lesson
      await tx.resource.deleteMany({
        where: { lessonId: id },
      });

      // Delete notes
      await tx.note.deleteMany({
        where: { lessonId: id },
      });

      // Delete assignments
      await tx.assignment.deleteMany({
        where: { lessonId: id },
      });

      // Delete lesson
      await tx.lesson.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
