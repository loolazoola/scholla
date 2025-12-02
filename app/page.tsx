import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login");
  }

  // Redirect to appropriate dashboard based on role
  const dashboardMap: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/dashboard",
  };

  const dashboard = dashboardMap[session.user.role] || "/login";
  redirect(dashboard);
}
