import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated and has admin role
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
