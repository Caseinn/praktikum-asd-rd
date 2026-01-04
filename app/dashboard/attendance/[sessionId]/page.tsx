import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type AttendanceSessionRedirectProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function AttendanceSessionRedirect({
  params,
}: AttendanceSessionRedirectProps) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const resolvedParams = await params;
  const role = session.user.role ?? "STUDENT";
  if (role === "ADMIN") {
    redirect(`/dashboard/admin/attendance/${resolvedParams.sessionId}`);
  }
  redirect(`/dashboard/student/attendance/${resolvedParams.sessionId}`);
}
