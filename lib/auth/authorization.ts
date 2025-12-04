import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * User roles in the system
 */
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

/**
 * Role hierarchy - higher roles have access to lower role features
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  TEACHER: 2,
  STUDENT: 1,
};

/**
 * Check if a user has a specific role
 */
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return userRole === requiredRole;
}

/**
 * Check if a user has at least the required role level (including higher roles)
 */
export function hasRoleOrHigher(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user is an admin
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, "ADMIN");
}

/**
 * Check if a user is a teacher
 */
export function isTeacher(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, "TEACHER");
}

/**
 * Check if a user is a student
 */
export function isStudent(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, "STUDENT");
}

/**
 * Check if a user is a teacher or admin
 */
export function isTeacherOrAdmin(userRole: UserRole | undefined): boolean {
  return hasRoleOrHigher(userRole, "TEACHER");
}

/**
 * Get current session or redirect to login
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Require a specific role or redirect to unauthorized
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await requireAuth();
  
  if (!hasRole(session.user.role as UserRole, requiredRole)) {
    redirect("/unauthorized");
  }
  
  return session;
}

/**
 * Require at least a specific role level or redirect to unauthorized
 */
export async function requireRoleOrHigher(requiredRole: UserRole) {
  const session = await requireAuth();
  
  if (!hasRoleOrHigher(session.user.role as UserRole, requiredRole)) {
    redirect("/unauthorized");
  }
  
  return session;
}

/**
 * Require admin role or redirect to unauthorized
 */
export async function requireAdmin() {
  return requireRole("ADMIN");
}

/**
 * Require teacher role or redirect to unauthorized
 */
export async function requireTeacher() {
  return requireRole("TEACHER");
}

/**
 * Require student role or redirect to unauthorized
 */
export async function requireStudent() {
  return requireRole("STUDENT");
}

/**
 * Require teacher or admin role or redirect to unauthorized
 */
export async function requireTeacherOrAdmin() {
  return requireRoleOrHigher("TEACHER");
}

/**
 * Check if the current user owns a resource
 */
export function isResourceOwner(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

/**
 * Check if the current user can access a resource
 * Admins can access all resources, others must be the owner
 */
export async function canAccessResource(resourceOwnerId: string): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }
  
  // Admins can access all resources
  if (isAdmin(session.user.role as UserRole)) {
    return true;
  }
  
  // Others must be the owner
  return isResourceOwner(session.user.id, resourceOwnerId);
}

/**
 * Require resource ownership or admin role
 */
export async function requireResourceAccess(resourceOwnerId: string) {
  const session = await requireAuth();
  
  const hasAccess = await canAccessResource(resourceOwnerId);
  
  if (!hasAccess) {
    redirect("/unauthorized");
  }
  
  return session;
}

/**
 * Check if a teacher can access a class
 * Admins can access all classes, teachers can only access their assigned classes
 */
export async function canAccessClass(classTeacherId: string): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }
  
  // Admins can access all classes
  if (isAdmin(session.user.role as UserRole)) {
    return true;
  }
  
  // Teachers can only access their assigned classes
  if (isTeacher(session.user.role as UserRole)) {
    return isResourceOwner(session.user.id, classTeacherId);
  }
  
  return false;
}

/**
 * Require class access (teacher of the class or admin)
 */
export async function requireClassAccess(classTeacherId: string) {
  const session = await requireAuth();
  
  const hasAccess = await canAccessClass(classTeacherId);
  
  if (!hasAccess) {
    redirect("/unauthorized");
  }
  
  return session;
}

/**
 * Check if a student is enrolled in a class
 */
export function isEnrolledInClass(studentId: string, enrolledStudentIds: string[]): boolean {
  return enrolledStudentIds.includes(studentId);
}

/**
 * Check if a user can grade students in a class
 * Only the class teacher or admin can grade
 */
export async function canGradeClass(classTeacherId: string): Promise<boolean> {
  return canAccessClass(classTeacherId);
}

/**
 * Require grading permission for a class
 */
export async function requireGradingAccess(classTeacherId: string) {
  return requireClassAccess(classTeacherId);
}

/**
 * Authorization error messages
 */
export const AUTH_ERRORS = {
  NOT_AUTHENTICATED: "You must be logged in to access this resource",
  INSUFFICIENT_PERMISSIONS: "You do not have permission to access this resource",
  NOT_RESOURCE_OWNER: "You can only access your own resources",
  NOT_CLASS_TEACHER: "You can only access classes you teach",
  NOT_ENROLLED: "You must be enrolled in this class to access it",
  ADMIN_ONLY: "This action requires administrator privileges",
  TEACHER_ONLY: "This action requires teacher privileges",
  STUDENT_ONLY: "This action requires student privileges",
} as const;
