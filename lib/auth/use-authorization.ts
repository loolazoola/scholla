"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "./authorization";

/**
 * Role hierarchy - higher roles have access to lower role features
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  TEACHER: 2,
  STUDENT: 1,
};

/**
 * Client-side authorization hook
 */
export function useAuthorization() {
  const { data: session, status } = useSession();
  
  const userRole = session?.user?.role as UserRole | undefined;
  const userId = session?.user?.id;
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  
  /**
   * Check if user has a specific role
   */
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!userRole) return false;
    return userRole === requiredRole;
  };
  
  /**
   * Check if user has at least the required role level
   */
  const hasRoleOrHigher = (requiredRole: UserRole): boolean => {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  };
  
  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole("ADMIN");
  };
  
  /**
   * Check if user is a teacher
   */
  const isTeacher = (): boolean => {
    return hasRole("TEACHER");
  };
  
  /**
   * Check if user is a student
   */
  const isStudent = (): boolean => {
    return hasRole("STUDENT");
  };
  
  /**
   * Check if user is a teacher or admin
   */
  const isTeacherOrAdmin = (): boolean => {
    return hasRoleOrHigher("TEACHER");
  };
  
  /**
   * Check if user owns a resource
   */
  const isResourceOwner = (resourceOwnerId: string): boolean => {
    if (!userId) return false;
    return userId === resourceOwnerId;
  };
  
  /**
   * Check if user can access a resource
   */
  const canAccessResource = (resourceOwnerId: string): boolean => {
    if (!isAuthenticated) return false;
    if (isAdmin()) return true;
    return isResourceOwner(resourceOwnerId);
  };
  
  /**
   * Check if user can access a class
   */
  const canAccessClass = (classTeacherId: string): boolean => {
    if (!isAuthenticated) return false;
    if (isAdmin()) return true;
    if (isTeacher()) return isResourceOwner(classTeacherId);
    return false;
  };
  
  /**
   * Check if user can grade a class
   */
  const canGradeClass = (classTeacherId: string): boolean => {
    return canAccessClass(classTeacherId);
  };
  
  return {
    // Session info
    session,
    userRole,
    userId,
    isLoading,
    isAuthenticated,
    
    // Role checks
    hasRole,
    hasRoleOrHigher,
    isAdmin,
    isTeacher,
    isStudent,
    isTeacherOrAdmin,
    
    // Resource access checks
    isResourceOwner,
    canAccessResource,
    canAccessClass,
    canGradeClass,
  };
}
