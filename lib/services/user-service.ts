import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword, passwordSchema } from "./auth-service";

const prisma = new PrismaClient();

// User update validation schema (all fields optional except for password complexity when provided)
export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: passwordSchema.optional(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
  locale: z.string().optional(),
  active: z.boolean().optional(),
});

// User listing filters
export const userFiltersSchema = z.object({
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;

/**
 * Get user by ID
 * @param id - User ID
 * @returns User object or null
 */
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      error: null,
      user,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the user",
      user: null,
    };
  }
}

/**
 * Update user
 * @param id - User ID
 * @param input - Update data
 * @returns Updated user object
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  // Validate input
  const validation = updateUserSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      user: null,
    };
  }

  const updateData = validation.data;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
        user: null,
      };
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return {
          success: false,
          error: "Email already in use",
          user: null,
        };
      }
    }

    // Hash password if provided
    const dataToUpdate: any = { ...updateData };
    if (updateData.password) {
      dataToUpdate.password = await hashPassword(updateData.password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      error: null,
      user,
    };
  } catch (error) {
    console.error("User update error:", error);
    return {
      success: false,
      error: "An error occurred while updating the user",
      user: null,
    };
  }
}

/**
 * Deactivate user (soft delete)
 * @param id - User ID
 * @returns Success status
 */
export async function deactivateUser(id: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Deactivate user
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("User deactivation error:", error);
    return {
      success: false,
      error: "An error occurred while deactivating the user",
    };
  }
}

/**
 * Activate user
 * @param id - User ID
 * @returns Success status
 */
export async function activateUser(id: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Activate user
    await prisma.user.update({
      where: { id },
      data: { active: true },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("User activation error:", error);
    return {
      success: false,
      error: "An error occurred while activating the user",
    };
  }
}

/**
 * List users with filtering and pagination
 * @param filters - Filter options
 * @returns Paginated user list
 */
export async function listUsers(filters: Partial<UserFilters> = {}) {
  // Validate filters
  const validation = userFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }

  const { role, active, search, page, limit } = validation.data;

  try {
    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      error: null,
      users,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("List users error:", error);
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
 * Get user statistics
 * @returns User count by role and status
 */
export async function getUserStats() {
  try {
    const [totalUsers, activeUsers, adminCount, teacherCount, studentCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { active: true } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.user.count({ where: { role: "STUDENT" } }),
      ]);

    return {
      success: true,
      error: null,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminCount,
        teachers: teacherCount,
        students: studentCount,
      },
    };
  } catch (error) {
    console.error("Get user stats error:", error);
    return {
      success: false,
      error: "An error occurred while fetching user statistics",
      stats: null,
    };
  }
}
