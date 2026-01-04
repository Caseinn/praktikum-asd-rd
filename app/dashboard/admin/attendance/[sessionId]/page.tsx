import AttendanceSessionDetail from "@/components/dashboard/attendance/attendance-session-detail";

type AdminAttendanceSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function AdminAttendanceSessionPage({
  params,
}: AdminAttendanceSessionPageProps) {
  const resolvedParams = await params;
  return (
    <AttendanceSessionDetail
      params={resolvedParams}
      basePath="/dashboard/admin/attendance"
      allowedRole="ADMIN"
    />
  );
}
