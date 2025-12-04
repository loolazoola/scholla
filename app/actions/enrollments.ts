"use server";

import { auth } from "@/lib/auth";
import {
  createEnrollment,
  listEnrollments,
  getEnrollmentById,
  getStudentEnrollment,
  withdrawEnrollment,
  deleteEnrollment,
  type CreateEnrollmentInput,
} from "@/lib/services/enrollment-service";

type EnrollmentStatus = "ACTIVE" | "WITHDRAWN";

/**
 * Create a new enrollment (Admin only)
 */
export async function createEnrollmentAction(input: CreateEnrollmentInput) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        enrollment: null,
      };
    }

    // Only admins can create enrollments
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create enrollments",
        enrollment: null,
      };
    }

    const result = await createEnrollment(input);
    return result;
  } catch (error) {
    console.error("Create enrollment action error:", error);
    return {
      success: false,
      error: "An error occurred while creating the enrollment",
      enrollment: null,
    };
  }
}

/**
 * List enrollments with optional filters
 */
export async function listEnrollmentsAction(filters?: {
  studentId?: string;
  classId?: string;
  academicYear?: string;
  status?: EnrollmentStatus;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        enrollments: [],
      };
    }

    const result = await listEnrollments(filters);
    return result;
  } catch (error) {
    console.error("List enrollments action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching enrollments",
      enrollments: [],
    };
  }
}

/**
 * Get enrollment by ID
 */
export async function getEnrollmentByIdAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        enrollment: null,
      };
    }

    const result = await getEnrollmentById(id);
    return result;
  } catch (error) {
    console.error("Get enrollment action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the enrollment",
      enrollment: null,
    };
  }
}

/**
 * Get student's current enrollment
 */
export async function getStudentEnrollmentAction(
  studentId: string,
  academicYear: string
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        enrollment: null,
      };
    }

    // Students can only view their own enrollment
    if (session.user.role === "STUDENT" && session.user.id !== studentId) {
      return {
        success: false,
        error: "You can only view your own enrollment",
        enrollment: null,
      };
    }

    const result = await getStudentEnrollment(studentId, academicYear);
    return result;
  } catch (error) {
    console.error("Get student enrollment action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching student enrollment",
      enrollment: null,
    };
  }
}

/**
 * Withdraw from enrollment (Admin only)
 */
export async function withdrawEnrollmentAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        enrollment: null,
      };
    }

    // Only admins can withdraw enrollments
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can withdraw enrollments",
        enrollment: null,
      };
    }

    const result = await withdrawEnrollment(id);
    return result;
  } catch (error) {
    console.error("Withdraw enrollment action error:", error);
    return {
      success: false,
      error: "An error occurred while withdrawing the enrollment",
      enrollment: null,
    };
  }
}

/**
 * Delete enrollment (Admin only)
 */
export async function deleteEnrollmentAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can delete enrollments
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete enrollments",
      };
    }

    const result = await deleteEnrollment(id);
    return result;
  } catch (error) {
    console.error("Delete enrollment action error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the enrollment",
    };
  }
}

/**
 * Bulk create enrollments (Admin only)
 */
export async function bulkCreateEnrollmentsAction(
  studentIds: string[],
  classId: string,
  academicYear: string
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        results: [],
      };
    }

    // Only admins can create enrollments
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create enrollments",
        results: [],
      };
    }

    const { bulkCreateEnrollments } = await import(
      "@/lib/services/enrollment-service"
    );
    const result = await bulkCreateEnrollments(
      studentIds,
      classId,
      academicYear
    );
    return result;
  } catch (error) {
    console.error("Bulk create enrollments action error:", error);
    return {
      success: false,
      error: "An error occurred while creating bulk enrollments",
      results: [],
    };
  }
}

/**
 * Copy enrollments from previous year (Admin only)
 */
export async function copyEnrollmentsFromPreviousYearAction(
  fromAcademicYear: string,
  toAcademicYear: string
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        results: [],
      };
    }

    // Only admins can copy enrollments
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can copy enrollments",
        results: [],
      };
    }

    const { copyEnrollmentsFromPreviousYear } = await import(
      "@/lib/services/enrollment-service"
    );
    const result = await copyEnrollmentsFromPreviousYear(
      fromAcademicYear,
      toAcademicYear
    );
    return result;
  } catch (error) {
    console.error("Copy enrollments action error:", error);
    return {
      success: false,
      error: "An error occurred while copying enrollments",
      results: [],
    };
  }
}
