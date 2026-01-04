import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role ?? "STUDENT";
  if (role === "ADMIN") redirect("/dashboard/admin");
  redirect("/dashboard/student");
}

