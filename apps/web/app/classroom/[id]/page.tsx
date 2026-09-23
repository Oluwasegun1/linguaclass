import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { createLiveKitToken } from "@/lib/video/livekit";
import { ClassroomView } from "@/components/classroom/classroom-view";

interface ClassroomPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id: lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
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
      },
      session: true,
      resources: true,
    },
  });

  if (!lesson) {
    redirect("/unauthorized");
  }

  const isTeacher =
    session.dbUser.teacherProfile?.id === lesson.course.teacherId;

  const isEnrolledStudent = lesson.course.enrollments.some(
    (e) => e.studentProfileId === session.dbUser.studentProfile?.id
  );

  if (!isTeacher && !isEnrolledStudent) {
    redirect("/unauthorized");
  }

  // Ensure live session database entry exists
  let liveSession = lesson.session;
  if (!liveSession) {
    liveSession = await db.session.create({
      data: {
        lessonId: lesson.id,
        videoRoomId: `room_${lesson.id}`,
      },
    });
  }

  const roomName = liveSession.videoRoomId || `room_${lesson.id}`;

  const token = await createLiveKitToken({
    roomName,
    participantIdentity: session.dbUser.id,
    participantName: session.dbUser.name,
    isTeacher,
    metadata: {
      role: session.dbUser.role,
      avatarUrl: session.dbUser.avatarUrl,
      sessionId: liveSession.id,
    },
  });

  const serverUrl =
    process.env.NEXT_PUBLIC_LIVEKIT_URL || "https://livekit.linguaclass.app";

  return (
    <ClassroomView
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      courseTitle={lesson.course.title}
      language={lesson.course.language}
      level={lesson.course.level}
      sessionId={liveSession.id}
      user={{
        id: session.dbUser.id,
        name: session.dbUser.name,
        role: session.dbUser.role as "TEACHER" | "STUDENT",
        timezone: session.dbUser.timezone || "UTC",
        avatarUrl: session.dbUser.avatarUrl,
      }}
      serverUrl={serverUrl}
      token={token}
      resources={lesson.resources.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        fileType: r.fileType,
        url: r.url,
      }))}
    />
  );
}
