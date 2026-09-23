import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { createLiveKitToken } from "@/lib/video/livekit";

export async function POST(req: NextRequest) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await req.json();
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    // Retrieve lesson and course to verify authorization
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            teacher: true,
            enrollments: true,
          },
        },
        session: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const isTeacher =
      userSession.dbUser.teacherProfile?.id === lesson.course.teacherId;

    const isEnrolledStudent = lesson.course.enrollments.some(
      (e) => e.studentProfileId === userSession.dbUser.studentProfile?.id
    );

    if (!isTeacher && !isEnrolledStudent) {
      return NextResponse.json(
        { error: "Forbidden: You are not enrolled in this lesson" },
        { status: 403 }
      );
    }

    // Ensure session record exists
    let session = lesson.session;
    if (!session) {
      session = await db.session.create({
        data: {
          lessonId: lesson.id,
          videoRoomId: `room_${lesson.id}`,
        },
      });
    }

    const roomName = session.videoRoomId || `room_${lesson.id}`;

    const token = await createLiveKitToken({
      roomName,
      participantIdentity: userSession.dbUser.id,
      participantName: userSession.dbUser.name,
      isTeacher,
      metadata: {
        role: userSession.dbUser.role,
        avatarUrl: userSession.dbUser.avatarUrl,
        sessionId: session.id,
      },
    });

    return NextResponse.json({
      token,
      roomName,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || "https://livekit.linguaclass.app",
      isTeacher,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Failed to generate video token:", error);
    return NextResponse.json(
      { error: "Internal server error generating video token" },
      { status: 500 }
    );
  }
}
