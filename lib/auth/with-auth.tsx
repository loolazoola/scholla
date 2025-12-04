"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthorization } from "./use-authorization";
import type { UserRole } from "./authorization";

interface WithAuthOptions {
  requiredRole?: UserRole;
  requireRoleOrHigher?: boolean;
  redirectTo?: string;
}

/**
 * Higher-order component for protecting client components
 *
 * @example
 * ```tsx
 * const ProtectedComponent = withAuth(MyComponent, { requiredRole: "ADMIN" });
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isLoading, isAuthenticated, hasRole, hasRoleOrHigher } =
      useAuthorization();

    const {
      requiredRole,
      requireRoleOrHigher: requireHigher = false,
      redirectTo = "/unauthorized",
    } = options;

    useEffect(() => {
      if (isLoading) return;

      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Check role requirements
      if (requiredRole) {
        const hasRequiredRole = requireHigher
          ? hasRoleOrHigher(requiredRole)
          : hasRole(requiredRole);

        if (!hasRequiredRole) {
          router.push(redirectTo);
        }
      }
    }, [
      isLoading,
      isAuthenticated,
      requiredRole,
      requireHigher,
      redirectTo,
      router,
      hasRole,
      hasRoleOrHigher,
    ]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Don't render if not authenticated or doesn't have required role
    if (!isAuthenticated) {
      return null;
    }

    if (requiredRole) {
      const hasRequiredRole = requireHigher
        ? hasRoleOrHigher(requiredRole)
        : hasRole(requiredRole);

      if (!hasRequiredRole) {
        return null;
      }
    }

    return <Component {...props} />;
  };
}

/**
 * HOC for admin-only components
 */
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return withAuth(Component, { requiredRole: "ADMIN" });
}

/**
 * HOC for teacher-only components
 */
export function withTeacherAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return withAuth(Component, { requiredRole: "TEACHER" });
}

/**
 * HOC for student-only components
 */
export function withStudentAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return withAuth(Component, { requiredRole: "STUDENT" });
}

/**
 * HOC for teacher or admin components
 */
export function withTeacherOrAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return withAuth(Component, {
    requiredRole: "TEACHER",
    requireRoleOrHigher: true,
  });
}
