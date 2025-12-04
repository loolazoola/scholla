import { PrismaClient, GradingPolicyType } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Grade scale item schema
export const gradeScaleItemSchema = z.object({
  letter: z.string().min(1, "Letter grade is required"),
  minValue: z.number().min(0).max(100),
  maxValue: z.number().min(0).max(100),
  gpaValue: z.number().min(0).max(4),
});

// Grading policy creation schema
export const createGradingPolicySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.enum(["LETTER", "NUMERIC", "PERCENTAGE"]),
  scale: z.array(gradeScaleItemSchema).min(1, "At least one grade scale item is required"),
});

// Grading policy update schema
export const updateGradingPolicySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  type: z.enum(["LETTER", "NUMERIC", "PERCENTAGE"]).optional(),
  scale: z.array(gradeScaleItemSchema).min(1, "At least one grade scale item is required").optional(),
});

export type GradeScaleItem = z.infer<typeof gradeScaleItemSchema>;
export type CreateGradingPolicyInput = z.infer<typeof createGradingPolicySchema>;
export type UpdateGradingPolicyInput = z.infer<typeof updateGradingPolicySchema>;

/**
 * Create a new grading policy
 */
export async function createGradingPolicy(input: CreateGradingPolicyInput) {
  // Validate input
  const validation = createGradingPolicySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      policy: null,
    };
  }

  const { name, type, scale } = validation.data;

  try {
    // Validate scale ranges don't overlap
    const sortedScale = [...scale].sort((a, b) => b.minValue - a.minValue);
    for (let i = 0; i < sortedScale.length - 1; i++) {
      if (sortedScale[i].minValue <= sortedScale[i + 1].maxValue) {
        return {
          success: false,
          error: "Grade scale ranges must not overlap",
          policy: null,
        };
      }
    }

    // Create grading policy
    const policy = await prisma.gradingPolicy.create({
      data: {
        name,
        type: type as GradingPolicyType,
        scale: scale as any, // Prisma Json type
      },
    });

    return {
      success: true,
      error: null,
      policy,
    };
  } catch (error) {
    console.error("Create grading policy error:", error);
    return {
      success: false,
      error: "An error occurred while creating the grading policy",
      policy: null,
    };
  }
}

/**
 * Get grading policy by ID
 */
export async function getGradingPolicyById(id: string) {
  try {
    const policy = await prisma.gradingPolicy.findUnique({
      where: { id },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    });

    return {
      success: true,
      error: null,
      policy,
    };
  } catch (error) {
    console.error("Get grading policy error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the grading policy",
      policy: null,
    };
  }
}

/**
 * List all grading policies
 */
export async function listGradingPolicies() {
  try {
    const policies = await prisma.gradingPolicy.findMany({
      include: {
        _count: {
          select: { classes: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      error: null,
      policies,
    };
  } catch (error) {
    console.error("List grading policies error:", error);
    return {
      success: false,
      error: "An error occurred while fetching grading policies",
      policies: [],
    };
  }
}

/**
 * Update grading policy
 */
export async function updateGradingPolicy(id: string, input: UpdateGradingPolicyInput) {
  // Validate input
  const validation = updateGradingPolicySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      policy: null,
    };
  }

  const updateData = validation.data;

  try {
    // Check if policy exists
    const existingPolicy = await prisma.gradingPolicy.findUnique({
      where: { id },
    });

    if (!existingPolicy) {
      return {
        success: false,
        error: "Grading policy not found",
        policy: null,
      };
    }

    // Validate scale ranges if scale is being updated
    if (updateData.scale) {
      const sortedScale = [...updateData.scale].sort((a, b) => b.minValue - a.minValue);
      for (let i = 0; i < sortedScale.length - 1; i++) {
        if (sortedScale[i].minValue <= sortedScale[i + 1].maxValue) {
          return {
            success: false,
            error: "Grade scale ranges must not overlap",
            policy: null,
          };
        }
      }
    }

    // Update grading policy
    const policy = await prisma.gradingPolicy.update({
      where: { id },
      data: {
        ...updateData,
        scale: updateData.scale as any, // Prisma Json type
      },
    });

    return {
      success: true,
      error: null,
      policy,
    };
  } catch (error) {
    console.error("Update grading policy error:", error);
    return {
      success: false,
      error: "An error occurred while updating the grading policy",
      policy: null,
    };
  }
}

/**
 * Delete grading policy
 */
export async function deleteGradingPolicy(id: string) {
  try {
    // Check if policy exists
    const existingPolicy = await prisma.gradingPolicy.findUnique({
      where: { id },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    });

    if (!existingPolicy) {
      return {
        success: false,
        error: "Grading policy not found",
      };
    }

    // Check if policy is in use
    if (existingPolicy._count.classes > 0) {
      return {
        success: false,
        error: `Cannot delete grading policy that is assigned to ${existingPolicy._count.classes} class(es)`,
      };
    }

    // Delete grading policy
    await prisma.gradingPolicy.delete({
      where: { id },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Delete grading policy error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the grading policy",
    };
  }
}

/**
 * Calculate letter grade from numeric value using grading policy
 */
export function calculateLetterGrade(numericValue: number, scale: GradeScaleItem[]): string | null {
  // Find the appropriate grade scale item
  for (const item of scale) {
    if (numericValue >= item.minValue && numericValue <= item.maxValue) {
      return item.letter;
    }
  }
  
  return null; // No matching grade found
}

/**
 * Calculate GPA value from numeric value using grading policy
 */
export function calculateGPA(numericValue: number, scale: GradeScaleItem[]): number | null {
  // Find the appropriate grade scale item
  for (const item of scale) {
    if (numericValue >= item.minValue && numericValue <= item.maxValue) {
      return item.gpaValue;
    }
  }
  
  return null; // No matching grade found
}

/**
 * Get letter grade and GPA from numeric value
 */
export function getGradeInfo(numericValue: number, scale: GradeScaleItem[]): {
  letter: string | null;
  gpa: number | null;
} {
  const letter = calculateLetterGrade(numericValue, scale);
  const gpa = calculateGPA(numericValue, scale);
  
  return { letter, gpa };
}

/**
 * Validate grading policy scale
 */
export function validateGradingScale(scale: GradeScaleItem[]): {
  valid: boolean;
  error?: string;
} {
  if (scale.length === 0) {
    return { valid: false, error: "Scale must have at least one grade" };
  }

  // Check for overlapping ranges
  const sortedScale = [...scale].sort((a, b) => b.minValue - a.minValue);
  for (let i = 0; i < sortedScale.length - 1; i++) {
    if (sortedScale[i].minValue <= sortedScale[i + 1].maxValue) {
      return { valid: false, error: "Grade scale ranges must not overlap" };
    }
  }

  // Check that all values are within 0-100
  for (const item of scale) {
    if (item.minValue < 0 || item.minValue > 100 || item.maxValue < 0 || item.maxValue > 100) {
      return { valid: false, error: "Grade values must be between 0 and 100" };
    }
    if (item.minValue > item.maxValue) {
      return { valid: false, error: "Min value cannot be greater than max value" };
    }
  }

  return { valid: true };
}

/**
 * Default grading policy templates
 */
export const DEFAULT_GRADING_POLICIES = {
  STANDARD_LETTER: {
    name: "Standard Letter Grades (A-F)",
    type: "LETTER" as GradingPolicyType,
    scale: [
      { letter: "A", minValue: 90, maxValue: 100, gpaValue: 4.0 },
      { letter: "B", minValue: 80, maxValue: 89, gpaValue: 3.0 },
      { letter: "C", minValue: 70, maxValue: 79, gpaValue: 2.0 },
      { letter: "D", minValue: 60, maxValue: 69, gpaValue: 1.0 },
      { letter: "F", minValue: 0, maxValue: 59, gpaValue: 0.0 },
    ],
  },
  PLUS_MINUS: {
    name: "Letter Grades with Plus/Minus",
    type: "LETTER" as GradingPolicyType,
    scale: [
      { letter: "A+", minValue: 97, maxValue: 100, gpaValue: 4.0 },
      { letter: "A", minValue: 93, maxValue: 96, gpaValue: 4.0 },
      { letter: "A-", minValue: 90, maxValue: 92, gpaValue: 3.7 },
      { letter: "B+", minValue: 87, maxValue: 89, gpaValue: 3.3 },
      { letter: "B", minValue: 83, maxValue: 86, gpaValue: 3.0 },
      { letter: "B-", minValue: 80, maxValue: 82, gpaValue: 2.7 },
      { letter: "C+", minValue: 77, maxValue: 79, gpaValue: 2.3 },
      { letter: "C", minValue: 73, maxValue: 76, gpaValue: 2.0 },
      { letter: "C-", minValue: 70, maxValue: 72, gpaValue: 1.7 },
      { letter: "D+", minValue: 67, maxValue: 69, gpaValue: 1.3 },
      { letter: "D", minValue: 63, maxValue: 66, gpaValue: 1.0 },
      { letter: "D-", minValue: 60, maxValue: 62, gpaValue: 0.7 },
      { letter: "F", minValue: 0, maxValue: 59, gpaValue: 0.0 },
    ],
  },
  LENIENT: {
    name: "Lenient Grading (85+ is A)",
    type: "LETTER" as GradingPolicyType,
    scale: [
      { letter: "A", minValue: 85, maxValue: 100, gpaValue: 4.0 },
      { letter: "B", minValue: 75, maxValue: 84, gpaValue: 3.0 },
      { letter: "C", minValue: 65, maxValue: 74, gpaValue: 2.0 },
      { letter: "D", minValue: 55, maxValue: 64, gpaValue: 1.0 },
      { letter: "F", minValue: 0, maxValue: 54, gpaValue: 0.0 },
    ],
  },
  STRICT: {
    name: "Strict Grading (93+ is A)",
    type: "LETTER" as GradingPolicyType,
    scale: [
      { letter: "A", minValue: 93, maxValue: 100, gpaValue: 4.0 },
      { letter: "B", minValue: 85, maxValue: 92, gpaValue: 3.0 },
      { letter: "C", minValue: 77, maxValue: 84, gpaValue: 2.0 },
      { letter: "D", minValue: 70, maxValue: 76, gpaValue: 1.0 },
      { letter: "F", minValue: 0, maxValue: 69, gpaValue: 0.0 },
    ],
  },
  PASS_FAIL: {
    name: "Pass/Fail (70+ is Pass)",
    type: "LETTER" as GradingPolicyType,
    scale: [
      { letter: "Pass", minValue: 70, maxValue: 100, gpaValue: 4.0 },
      { letter: "Fail", minValue: 0, maxValue: 69, gpaValue: 0.0 },
    ],
  },
};

/**
 * Create default grading policies
 * Useful for initial system setup or providing templates
 */
export async function createDefaultGradingPolicies() {
  const results = [];
  
  for (const [key, template] of Object.entries(DEFAULT_GRADING_POLICIES)) {
    try {
      // Check if policy with this name already exists
      const existing = await prisma.gradingPolicy.findFirst({
        where: { name: template.name },
      });
      
      if (existing) {
        results.push({
          template: key,
          success: false,
          error: "Policy already exists",
          policy: existing,
        });
        continue;
      }
      
      // Create the policy
      const result = await createGradingPolicy(template);
      results.push({
        template: key,
        ...result,
      });
    } catch (error) {
      console.error(`Error creating default policy ${key}:`, error);
      results.push({
        template: key,
        success: false,
        error: "Failed to create policy",
        policy: null,
      });
    }
  }
  
  return {
    success: true,
    results,
  };
}

/**
 * Get default grading policy templates
 * Returns the templates without creating them in the database
 */
export function getDefaultGradingPolicyTemplates() {
  return DEFAULT_GRADING_POLICIES;
}
