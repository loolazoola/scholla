import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TeacherDashboardClient } from "./teacher-dashboard-client";

export default async function TeacherDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/unauthorized");
  }

  return <TeacherDashboardClient session={session} />;
}
