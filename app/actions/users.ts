"use server";

import { revalidatePath } from "next/cache";
import { createUser } from "@/lib/services/auth-service";
import {
  updateUser,
  deactivateUser,
  activateUser,
  listUsers,
  getUserById,
  type UserFilters,
} from "@/lib/services/user-service";

/**
 * Server action to create a new user
 */
export async function createUserAction(formData: {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  locale?: string;
}) {
  try {
    const userData = {
      ...formData,
      locale: formData.locale || "en",
    };
    const result = await createUser(userData);

    if (result.success) {
      revalidatePath("/admin/users");
    }

    return result;
  } catch (error) {
    console.error("Create user action error:", error);
    return {
      success: false,
      error: "An error occurred while creating the user",
      user: null,
    };
  }
}

/**
 * Server action to update a user
 */
export async function updateUserAction(
  userId: string,
  formData: {
    email?: string;
    password?: string;
    name?: string;
    role?: "ADMIN" | "TEACHER" | "STUDENT";
    locale?: string;
    active?: boolean;
  }
) {
  try {
    const result = await updateUser(userId, formData);

    if (result.success) {
      revalidatePath("/admin/users");
    }

    return result;
  } catch (error) {
    console.error("Update user action error:", error);
    return {
      success: false,
      error: "An error occurred while updating the user",
      user: null,
    };
  }
}

/**
 * Server action to deactivate a user
 */
export async function deactivateUserAction(userId: string) {
  try {
    const result = await deactivateUser(userId);

    if (result.success) {
      revalidatePath("/admin/users");
    }

    return result;
  } catch (error) {
    console.error("Deactivate user action error:", error);
    return {
      success: false,
      error: "An error occurred while deactivating the user",
    };
  }
}

/**
 * Server action to activate a user
 */
export async function activateUserAction(userId: string) {
  try {
    const result = await activateUser(userId);

    if (result.success) {
      revalidatePath("/admin/users");
    }

    return result;
  } catch (error) {
    console.error("Activate user action error:", error);
    return {
      success: false,
      error: "An error occurred while activating the user",
    };
  }
}

/**
 * Server action to list users with filters
 */
export async function listUsersAction(filters?: Partial<UserFilters>) {
  try {
    return await listUsers(filters);
  } catch (error) {
    console.error("List users action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching users",
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
}

/**
 * Server action to get a user by ID
 */
export async function getUserByIdAction(userId: string) {
  try {
    return await getUserById(userId);
  } catch (error) {
    console.error("Get user action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the user",
      user: null,
    };
  }
}
