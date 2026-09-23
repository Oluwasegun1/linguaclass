import { requireStudent } from "@/lib/auth/auth";
import { StudentNav } from "@/components/student/student-nav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStudent();

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      <StudentNav
        user={{
          id: session.dbUser.id,
          name: session.dbUser.name,
          email: session.dbUser.email,
          role: session.dbUser.role,
          timezone: session.dbUser.timezone || "UTC",
          avatarUrl: session.dbUser.avatarUrl,
        }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
