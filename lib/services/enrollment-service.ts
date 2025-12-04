import { PrismaClient, EnrollmentStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Enrollment schemas
export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY"),
});

export const updateEnrollmentSchema = z.object({
  status: z.enum(["ACTIVE", "WITHDRAWN"]),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;

/**
 * Create a new enrollment
 */
export async function createEnrollment(input: CreateEnrollmentInput) {
  const validation = createEnrollmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      enrollment: null,
    };
  }

  try {
    // Verify student exists and is a student
    const student = await prisma.user.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.role !== "STUDENT") {
      return {
        success: false,
        error: "Invalid student",
        enrollment: null,
      };
    }

    if (!student.active) {
      return {
        success: false,
        error: "Student account is not active",
        enrollment: null,
      };
    }

    // Verify class exists
    const classCohort = await prisma.class.findUnique({
      where: { id: input.classId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!classCohort) {
      return {
        success: false,
        error: "Class not found",
        enrollment: null,
      };
    }

    // Check capacity
    if (
      classCohort.capacity &&
      classCohort._count.enrollments >= classCohort.capacity
    ) {
      return {
        success: false,
        error: "Class is at full capacity",
        enrollment: null,
      };
    }

    // Check for duplicate enrollment (same student, class, academic year)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId_academicYear: {
          studentId: input.studentId,
          classId: input.classId,
          academicYear: input.academicYear,
        },
      },
    });

    if (existingEnrollment) {
      return {
        success: false,
        error: "Student is already enrolled in this class for this academic year",
        enrollment: null,
      };
    }

    // Check if student is already enrolled in another class for the same academic year
    // In Indonesian system, students can only be in ONE class cohort per academic year
    const otherEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: input.studentId,
        academicYear: input.academicYear,
        status: "ACTIVE",
        classId: { not: input.classId },
      },
      include: {
        class: {
          select: { name: true },
        },
      },
    });

    if (otherEnrollment) {
      return {
        success: false,
        error: `Student is already enrolled in ${otherEnrollment.class.name} for ${input.academicYear}`,
        enrollment: null,
      };
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: validation.data,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            grade: true,
            academicYear: true,
          },
        },
      },
    });

    return { success: true, error: null, enrollment };
  } catch (error) {
    console.error("Create enrollment error:", error);
    return {
      success: false,
      error: "An error occurred while creating the enrollment",
      enrollment: null,
    };
  }
}

/**
 * List enrollments with filters
 */
export async function listEnrollments(filters?: {
  studentId?: string;
  classId?: string;
  academicYear?: string;
  status?: EnrollmentStatus;
}) {
  try {
    const where: any = {};

    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.classId) where.classId = filters.classId;
    if (filters?.academicYear) where.academicYear = filters.academicYear;
    if (filters?.status) where.status = filters.status;

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            grade: true,
            academicYear: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return { success: true, error: null, enrollments };
  } catch (error) {
    console.error("List enrollments error:", error);
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
export async function getEnrollmentById(id: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            grade: true,
            academicYear: true,
          },
        },
      },
    });

    return { success: true, error: null, enrollment };
  } catch (error) {
    console.error("Get enrollment error:", error);
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
export async function getStudentEnrollment(
  studentId: string,
  academicYear: string
) {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        academicYear,
        status: "ACTIVE",
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            grade: true,
            academicYear: true,
          },
        },
      },
    });

    return { success: true, error: null, enrollment };
  } catch (error) {
    console.error("Get student enrollment error:", error);
    return {
      success: false,
      error: "An error occurred while fetching student enrollment",
      enrollment: null,
    };
  }
}

/**
 * Withdraw from enrollment
 */
export async function withdrawEnrollment(id: string) {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { status: "WITHDRAWN" },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            grade: true,
          },
        },
      },
    });

    return { success: true, error: null, enrollment };
  } catch (error) {
    console.error("Withdraw enrollment error:", error);
    return {
      success: false,
      error: "An error occurred while withdrawing the enrollment",
      enrollment: null,
    };
  }
}

/**
 * Delete enrollment
 */
export async function deleteEnrollment(id: string) {
  try {
    await prisma.enrollment.delete({
      where: { id },
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the enrollment",
    };
  }
}

/**
 * Bulk create enrollments (for multiple students)
 */
export async function bulkCreateEnrollments(
  studentIds: string[],
  classId: string,
  academicYear: string
) {
  try {
    // Validate inputs
    if (studentIds.length === 0) {
      return {
        success: false,
        error: "No students selected",
        results: [],
      };
    }

    // Verify class exists
    const classCohort = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!classCohort) {
      return {
        success: false,
        error: "Class not found",
        results: [],
      };
    }

    // Process each student
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const studentId of studentIds) {
      const result = await createEnrollment({
        studentId,
        classId,
        academicYear,
      });

      results.push({
        studentId,
        success: result.success,
        error: result.error,
        enrollment: result.enrollment,
      });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return {
      success: true,
      error: null,
      results,
      summary: {
        total: studentIds.length,
        successful: successCount,
        failed: errorCount,
      },
    };
  } catch (error) {
    console.error("Bulk create enrollments error:", error);
    return {
      success: false,
      error: "An error occurred while creating bulk enrollments",
      results: [],
    };
  }
}

/**
 * Copy enrollments from previous academic year
 */
export async function copyEnrollmentsFromPreviousYear(
  fromAcademicYear: string,
  toAcademicYear: string
) {
  try {
    // Get all active enrollments from previous year
    const previousEnrollments = await prisma.enrollment.findMany({
      where: {
        academicYear: fromAcademicYear,
        status: "ACTIVE",
      },
      include: {
        student: {
          select: { id: true, name: true, active: true },
        },
        class: {
          select: { id: true, name: true },
        },
      },
    });

    if (previousEnrollments.length === 0) {
      return {
        success: false,
        error: `No active enrollments found for ${fromAcademicYear}`,
        results: [],
      };
    }

    // Process each enrollment
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const prevEnrollment of previousEnrollments) {
      // Skip inactive students
      if (!prevEnrollment.student.active) {
        results.push({
          studentId: prevEnrollment.studentId,
          studentName: prevEnrollment.student.name,
          className: prevEnrollment.class.name,
          success: false,
          error: "Student is inactive",
          skipped: true,
        });
        skippedCount++;
        continue;
      }

      // Try to create enrollment for new year
      const result = await createEnrollment({
        studentId: prevEnrollment.studentId,
        classId: prevEnrollment.classId,
        academicYear: toAcademicYear,
      });

      results.push({
        studentId: prevEnrollment.studentId,
        studentName: prevEnrollment.student.name,
        className: prevEnrollment.class.name,
        success: result.success,
        error: result.error,
        enrollment: result.enrollment,
        skipped: false,
      });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return {
      success: true,
      error: null,
      results,
      summary: {
        total: previousEnrollments.length,
        successful: successCount,
        failed: errorCount,
        skipped: skippedCount,
      },
    };
  } catch (error) {
    console.error("Copy enrollments error:", error);
    return {
      success: false,
      error: "An error occurred while copying enrollments",
      results: [],
    };
  }
}
