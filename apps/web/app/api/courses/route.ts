import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/auth";
import { db, CourseLevel } from "@workspace/database";

export async function GET() {
  const session = await getTeacherSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const courses = await db.course.findMany({
      where: {
        teacherId: session.dbUser.teacherProfile.id,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            resources: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Failed to list courses:", error);
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
    const { title, language, level, description } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Course title is required" }, { status: 400 });
    }

    if (!language || typeof language !== "string" || !language.trim()) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 });
    }

    const validLevels = Object.values(CourseLevel);
    if (!level || !validLevels.includes(level as CourseLevel)) {
      return NextResponse.json(
        { error: `Level must be one of: ${validLevels.join(", ")}` },
        { status: 400 }
      );
    }

    const course = await db.course.create({
      data: {
        teacherId: session.dbUser.teacherProfile.id,
        title: title.trim(),
        language: language.trim(),
        level: level as CourseLevel,
        description: description ? description.trim() : null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
