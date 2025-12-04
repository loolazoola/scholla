"use server";

import { auth } from "@/lib/auth";
import {
  createGradingPolicy,
  listGradingPolicies,
  getGradingPolicyById,
  updateGradingPolicy,
  deleteGradingPolicy,
  type CreateGradingPolicyInput,
  type UpdateGradingPolicyInput,
} from "@/lib/services/grading-policy-service";

/**
 * Create a new grading policy (Admin only)
 */
export async function createGradingPolicyAction(
  input: CreateGradingPolicyInput
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        policy: null,
      };
    }

    // Only admins can create grading policies
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create grading policies",
        policy: null,
      };
    }

    const result = await createGradingPolicy(input);
    return result;
  } catch (error) {
    console.error("Create grading policy action error:", error);
    return {
      success: false,
      error: "An error occurred while creating the grading policy",
      policy: null,
    };
  }
}

/**
 * List all grading policies
 */
export async function listGradingPoliciesAction() {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        policies: [],
      };
    }

    const result = await listGradingPolicies();
    return result;
  } catch (error) {
    console.error("List grading policies action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching grading policies",
      policies: [],
    };
  }
}

/**
 * Get grading policy by ID
 */
export async function getGradingPolicyByIdAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        policy: null,
      };
    }

    const result = await getGradingPolicyById(id);
    return result;
  } catch (error) {
    console.error("Get grading policy action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the grading policy",
      policy: null,
    };
  }
}

/**
 * Update grading policy (Admin only)
 */
export async function updateGradingPolicyAction(
  id: string,
  input: UpdateGradingPolicyInput
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        policy: null,
      };
    }

    // Only admins can update grading policies
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update grading policies",
        policy: null,
      };
    }

    const result = await updateGradingPolicy(id, input);
    return result;
  } catch (error) {
    console.error("Update grading policy action error:", error);
    return {
      success: false,
      error: "An error occurred while updating the grading policy",
      policy: null,
    };
  }
}

/**
 * Delete grading policy (Admin only)
 */
export async function deleteGradingPolicyAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can delete grading policies
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete grading policies",
      };
    }

    const result = await deleteGradingPolicy(id);
    return result;
  } catch (error) {
    console.error("Delete grading policy action error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the grading policy",
    };
  }
}
