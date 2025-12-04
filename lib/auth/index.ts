// Server-side authorization utilities
export {
  type UserRole,
  hasRole,
  hasRoleOrHigher,
  isAdmin,
  isTeacher,
  isStudent,
  isTeacherOrAdmin,
  requireAuth,
  requireRole,
  requireRoleOrHigher,
  requireAdmin,
  requireTeacher,
  requireStudent,
  requireTeacherOrAdmin,
  isResourceOwner,
  canAccessResource,
  requireResourceAccess,
  canAccessClass,
  requireClassAccess,
  isEnrolledInClass,
  canGradeClass,
  requireGradingAccess,
  AUTH_ERRORS,
} from "./authorization";

// Client-side authorization utilities
export { useAuthorization } from "./use-authorization";

// Higher-order components
export {
  withAuth,
  withAdminAuth,
  withTeacherAuth,
  withStudentAuth,
  withTeacherOrAdminAuth,
} from "./with-auth";
