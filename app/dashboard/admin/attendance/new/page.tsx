import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CreateSessionForm from "@/components/dashboard/attendance/create-session-form";
import AccessDenied from "@/components/shared/access-denied";

export default async function NewAttendanceSessionPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (session.user.role !== "ADMIN") {
    return <AccessDenied backHref="/dashboard" backLabel="Kembali" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm">
        <Link
          href="/dashboard/admin/attendance"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <CreateSessionForm />
      </div>
    </main>
  );
}

