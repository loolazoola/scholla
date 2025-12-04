import { PrismaClient, SchoolLevel } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Class cohort schemas
export const createClassCohortSchema = z.object({
  name: z.string().min(1, "Class name is required").max(50),
  level: z.enum(["SD", "SMP", "SMA", "SMK"]),
  grade: z.number().int().min(1).max(12),
  homeroomTeacherId: z.string().optional().nullable(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY"),
  capacity: z.number().int().positive().optional().nullable(),
  gradingPolicyId: z.string().min(1, "Grading policy is required"),
});

export const updateClassCohortSchema = createClassCohortSchema.partial();

export type CreateClassCohortInput = z.infer<typeof createClassCohortSchema>;
export type UpdateClassCohortInput = z.infer<typeof updateClassCohortSchema>;

export async function createClassCohort(input: CreateClassCohortInput) {
  const validation = createClassCohortSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      class: null,
    };
  }

  try {
    // Verify homeroom teacher if provided
    if (input.homeroomTeacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: input.homeroomTeacherId },
      });

      if (!teacher || teacher.role !== "TEACHER" || !teacher.active) {
        return {
          success: false,
          error: "Invalid homeroom teacher",
          class: null,
        };
      }
    }

    // Prepare data, removing null values for optional fields
    const data: any = {
      name: validation.data.name,
      level: validation.data.level,
      grade: validation.data.grade,
      academicYear: validation.data.academicYear,
      gradingPolicyId: validation.data.gradingPolicyId,
    };

    // Only add optional fields if they have values
    if (validation.data.homeroomTeacherId) {
      data.homeroomTeacherId = validation.data.homeroomTeacherId;
    }
    if (validation.data.capacity) {
      data.capacity = validation.data.capacity;
    }

    const classCohort = await prisma.class.create({
      data,
      include: {
        homeroomTeacher: {
          select: { id: true, name: true, email: true },
        },
        gradingPolicy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return { success: true, error: null, class: classCohort };
  } catch (error) {
    console.error("Create class cohort error:", error);
    return {
      success: false,
      error: "An error occurred while creating the class",
      class: null,
    };
  }
}

export async function listClassCohorts(filters?: {
  level?: SchoolLevel;
  academicYear?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    if (filters?.level) {
      where.level = filters.level;
    }

    if (filters?.academicYear) {
      where.academicYear = filters.academicYear;
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        homeroomTeacher: {
          select: { id: true, name: true, email: true },
        },
        gradingPolicy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: [{ level: "asc" }, { grade: "asc" }, { name: "asc" }],
    });

    return { success: true, error: null, classes };
  } catch (error) {
    console.error("List class cohorts error:", error);
    return {
      success: false,
      error: "An error occurred while fetching classes",
      classes: [],
    };
  }
}

export async function getClassCohortById(id: string) {
  try {
    const classCohort = await prisma.class.findUnique({
      where: { id },
      include: {
        homeroomTeacher: {
          select: { id: true, name: true, email: true },
        },
        gradingPolicy: true,
        _count: {
          select: { enrollments: true, schedules: true },
        },
      },
    });

    return { success: true, error: null, class: classCohort };
  } catch (error) {
    console.error("Get class cohort error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the class",
      class: null,
    };
  }
}

export async function updateClassCohort(
  id: string,
  input: UpdateClassCohortInput
) {
  const validation = updateClassCohortSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      class: null,
    };
  }

  try {
    // Prepare data, removing undefined values
    const data: any = {};
    
    if (validation.data.name !== undefined) data.name = validation.data.name;
    if (validation.data.level !== undefined) data.level = validation.data.level;
    if (validation.data.grade !== undefined) data.grade = validation.data.grade;
    if (validation.data.academicYear !== undefined) data.academicYear = validation.data.academicYear;
    if (validation.data.gradingPolicyId !== undefined) data.gradingPolicyId = validation.data.gradingPolicyId;
    
    // Handle optional fields - explicitly set to null if needed
    if (validation.data.homeroomTeacherId !== undefined) {
      data.homeroomTeacherId = validation.data.homeroomTeacherId || null;
    }
    if (validation.data.capacity !== undefined) {
      data.capacity = validation.data.capacity || null;
    }

    const classCohort = await prisma.class.update({
      where: { id },
      data,
      include: {
        homeroomTeacher: {
          select: { id: true, name: true, email: true },
        },
        gradingPolicy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return { success: true, error: null, class: classCohort };
  } catch (error) {
    console.error("Update class cohort error:", error);
    return {
      success: false,
      error: "An error occurred while updating the class",
      class: null,
    };
  }
}

export async function deleteClassCohort(id: string) {
  try {
    await prisma.class.delete({
      where: { id },
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete class cohort error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the class",
    };
  }
}
