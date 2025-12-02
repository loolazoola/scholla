import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server
 * Returns null if not authenticated
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Require specific role - redirects to unauthorized if user doesn't have the role
 */
export async function requireRole(role: string | string[]) {
  const session = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(session.user.role)) {
    redirect("/unauthorized");
  }
  
  return session;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string | string[]) {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  return await hasRole("ADMIN");
}

/**
 * Check if user is teacher
 */
export async function isTeacher() {
  return await hasRole("TEACHER");
}

/**
 * Check if user is student
 */
export async function isStudent() {
  return await hasRole("STUDENT");
}
