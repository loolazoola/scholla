"use server";

import { auth } from "@/lib/auth";
import {
  createSubject,
  listSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  type CreateSubjectInput,
  type UpdateSubjectInput,
} from "@/lib/services/subject-service";

/**
 * Create a new subject (Admin only)
 */
export async function createSubjectAction(input: CreateSubjectInput) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        subject: null,
      };
    }

    // Only admins can create subjects
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create subjects",
        subject: null,
      };
    }

    const result = await createSubject(input);
    return result;
  } catch (error) {
    console.error("Create subject action error:", error);
    return {
      success: false,
      error: "An error occurred while creating the subject",
      subject: null,
    };
  }
}

/**
 * List all subjects
 */
export async function listSubjectsAction() {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        subjects: [],
      };
    }

    const result = await listSubjects();
    return result;
  } catch (error) {
    console.error("List subjects action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching subjects",
      subjects: [],
    };
  }
}

/**
 * Get subject by ID
 */
export async function getSubjectByIdAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        subject: null,
      };
    }

    const result = await getSubjectById(id);
    return result;
  } catch (error) {
    console.error("Get subject action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the subject",
      subject: null,
    };
  }
}

/**
 * Update subject (Admin only)
 */
export async function updateSubjectAction(
  id: string,
  input: UpdateSubjectInput
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        subject: null,
      };
    }

    // Only admins can update subjects
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update subjects",
        subject: null,
      };
    }

    const result = await updateSubject(id, input);
    return result;
  } catch (error) {
    console.error("Update subject action error:", error);
    return {
      success: false,
      error: "An error occurred while updating the subject",
      subject: null,
    };
  }
}

/**
 * Delete subject (Admin only)
 */
export async function deleteSubjectAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can delete subjects
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete subjects",
      };
    }

    const result = await deleteSubject(id);
    return result;
  } catch (error) {
    console.error("Delete subject action error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the subject",
    };
  }
}
