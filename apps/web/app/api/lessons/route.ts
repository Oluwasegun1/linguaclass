import { NextResponse } from "next/server";
import { getCurrentUser, getTeacherSession } from "@/lib/auth/auth";
import { db, Role, SessionStatus } from "@workspace/database";

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const status = searchParams.get("status");

  try {
    let whereCondition: any = {};

    if (session.dbUser.role === Role.TEACHER && session.dbUser.teacherProfile) {
      whereCondition.course = {
        teacherId: session.dbUser.teacherProfile.id,
      };
    } else if (session.dbUser.role === Role.STUDENT && session.dbUser.studentProfile) {
      whereCondition.course = {
        enrollments: {
          some: {
            studentProfileId: session.dbUser.studentProfile.id,
          },
        },
      };
    }

    if (courseId) {
      whereCondition.courseId = courseId;
    }

    if (status && Object.values(SessionStatus).includes(status as SessionStatus)) {
      whereCondition.status = status as SessionStatus;
    }

    const lessons = await db.lesson.findMany({
      where: whereCondition,
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
        _count: {
          select: {
            assignments: true,
            notes: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Failed to list lessons:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, title, scheduledAt, durationMins, timezone, objectives } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Lesson title is required" }, { status: 400 });
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt date is required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt date format" }, { status: 400 });
    }

    // Verify course belongs to this teacher
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.teacherId !== session.dbUser.teacherProfile.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this course" }, { status: 403 });
    }

    const duration = parseInt(durationMins, 10) || 60;
    const lessonTz = timezone || session.dbUser.timezone || "UTC";

    // Create Lesson and connected Session atomically
    const lesson = await db.lesson.create({
      data: {
        courseId,
        title: title.trim(),
        scheduledAt: scheduledDate, // Stored in UTC
        durationMins: duration,
        timezone: lessonTz,
        objectives: objectives ? objectives.trim() : null,
        status: SessionStatus.SCHEDULED,
        session: {
          create: {
            status: SessionStatus.SCHEDULED,
            videoRoomId: `lingua-${course.id.slice(0, 6)}-${Date.now()}`,
          },
        },
      },
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

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error("Failed to schedule lesson:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
