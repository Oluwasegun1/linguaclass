import type { CurrentUserSession } from "@/lib/auth/auth";

interface CourseAccessShape {
  teacherId: string;
  enrollments: { studentProfileId: string }[];
}

/**
 * Returns true when the user is the course's teacher or an enrolled student.
 * Used to guard read access to course / lesson / session scoped data.
 */
export function canAccessCourse(
  session: CurrentUserSession,
  course: CourseAccessShape
): boolean {
  const { teacherProfile, studentProfile } = session.dbUser;

  if (teacherProfile && teacherProfile.id === course.teacherId) {
    return true;
  }

  if (studentProfile) {
    return course.enrollments.some(
      (e) => e.studentProfileId === studentProfile.id
    );
  }

  return false;
}
