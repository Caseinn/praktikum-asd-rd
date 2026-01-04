import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AttendanceList from "@/components/dashboard/attendance/attendance-list";

export default async function AdminAttendancePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard/student/attendance");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  return (
    <AttendanceList
      role="ADMIN"
      userId={user.id}
      basePath="/dashboard/admin/attendance"
    />
  );
}

