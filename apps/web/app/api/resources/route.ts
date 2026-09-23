import { NextResponse } from "next/server";
import { getCurrentUser, getTeacherSession } from "@/lib/auth/auth";
import { db } from "@workspace/database";

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const lessonId = searchParams.get("lessonId");

  try {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (lessonId) where.lessonId = lessonId;

    const resources = await db.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Failed to list resources:", error);
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
    const { fileName, fileType, url, storageKey, courseId, lessonId } = body;

    if (!fileName || typeof fileName !== "string" || !fileName.trim()) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    if (!fileType || typeof fileType !== "string") {
      return NextResponse.json({ error: "File type is required" }, { status: 400 });
    }

    if (!courseId && !lessonId) {
      return NextResponse.json(
        { error: "Either courseId or lessonId must be specified" },
        { status: 400 }
      );
    }

    let targetCourseId = courseId;

    // If lessonId is given, verify lesson and inherit courseId if needed
    if (lessonId) {
      const lesson = await db.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true },
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      if (lesson.course.teacherId !== session.dbUser.teacherProfile.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!targetCourseId) {
        targetCourseId = lesson.courseId;
      }
    } else if (targetCourseId) {
      const course = await db.course.findUnique({
        where: { id: targetCourseId },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      if (course.teacherId !== session.dbUser.teacherProfile.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const resource = await db.resource.create({
      data: {
        fileName: fileName.trim(),
        fileType: fileType.trim().toLowerCase(),
        url: url ? url.trim() : null,
        storageKey: storageKey ? storageKey.trim() : null,
        courseId: targetCourseId,
        lessonId: lessonId || null,
        uploadedBy: session.dbUser.id,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Failed to attach resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
