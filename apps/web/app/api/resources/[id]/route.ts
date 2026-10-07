import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/auth/auth";
import { db } from "@workspace/database";

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
    const resource = await db.resource.findUnique({
      where: { id },
      include: {
        course: true,
        lesson: {
          include: { course: true },
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Check ownership (orphan resources fall back to the uploader)
    const courseTeacherId = resource.course?.teacherId || resource.lesson?.course.teacherId;
    const isOwner = courseTeacherId
      ? courseTeacherId === session.dbUser.teacherProfile.id
      : resource.uploadedBy === session.dbUser.id;
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
