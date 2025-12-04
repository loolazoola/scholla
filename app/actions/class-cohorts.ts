"use server";

import { auth } from "@/lib/auth";
import {
  createClassCohort,
  listClassCohorts,
  getClassCohortById,
  updateClassCohort,
  deleteClassCohort,
  type CreateClassCohortInput,
  type UpdateClassCohortInput,
} from "@/lib/services/class-cohort-service";
type SchoolLevel = "SD" | "SMP" | "SMA" | "SMK";

/**
 * Create a new class cohort (Admin only)
 */
export async function createClassCohortAction(input: CreateClassCohortInput) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        class: null,
      };
    }

    // Only admins can create class cohorts
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create class cohorts",
        class: null,
      };
    }

    const result = await createClassCohort(input);
    return result;
  } catch (error) {
    console.error("Create class cohort action error:", error);
    return {
      success: false,
      error: "An error occurred while creating the class cohort",
      class: null,
    };
  }
}

/**
 * List all class cohorts with optional filters
 */
export async function listClassCohortsAction(filters?: {
  level?: SchoolLevel;
  academicYear?: string;
  search?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        classes: [],
      };
    }

    const result = await listClassCohorts(filters);
    return result;
  } catch (error) {
    console.error("List class cohorts action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching class cohorts",
      classes: [],
    };
  }
}

/**
 * Get class cohort by ID
 */
export async function getClassCohortByIdAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        class: null,
      };
    }

    const result = await getClassCohortById(id);
    return result;
  } catch (error) {
    console.error("Get class cohort action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the class cohort",
      class: null,
    };
  }
}

/**
 * Update class cohort (Admin only)
 */
export async function updateClassCohortAction(
  id: string,
  input: UpdateClassCohortInput
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        class: null,
      };
    }

    // Only admins can update class cohorts
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update class cohorts",
        class: null,
      };
    }

    const result = await updateClassCohort(id, input);
    return result;
  } catch (error) {
    console.error("Update class cohort action error:", error);
    return {
      success: false,
      error: "An error occurred while updating the class cohort",
      class: null,
    };
  }
}

/**
 * Delete class cohort (Admin only)
 */
export async function deleteClassCohortAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can delete class cohorts
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete class cohorts",
      };
    }

    const result = await deleteClassCohort(id);
    return result;
  } catch (error) {
    console.error("Delete class cohort action error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the class cohort",
    };
  }
}
