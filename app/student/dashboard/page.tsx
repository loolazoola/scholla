import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudentDashboardClient } from "./student-dashboard-client";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  return <StudentDashboardClient session={session} />;
}
