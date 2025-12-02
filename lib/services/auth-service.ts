import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Password complexity validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Login credentials validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// User creation validation schema
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  name: z.string().min(1, "Name is required"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  locale: z.string().optional().default("en"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Validate password complexity
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordComplexity(password: string) {
  return passwordSchema.safeParse(password);
}

/**
 * Authenticate user with email and password
 * @param credentials - Login credentials
 * @returns User object if authentication successful, null otherwise
 */
export async function authenticateUser(credentials: LoginCredentials) {
  // Validate credentials format
  const validation = loginSchema.safeParse(credentials);
  if (!validation.success) {
    return {
      success: false,
      error: "Invalid credentials format",
      user: null,
    };
  }

  const { email, password } = validation.data;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        active: true,
        locale: true,
      },
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
        user: null,
      };
    }

    // Check if user is active
    if (!user.active) {
      return {
        success: false,
        error: "Account has been deactivated",
        user: null,
      };
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return {
        success: false,
        error: "Invalid email or password",
        user: null,
      };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      error: null,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "An error occurred during authentication",
      user: null,
    };
  }
}

/**
 * Create a new user with hashed password
 * @param input - User creation data
 * @returns Created user object
 */
export async function createUser(input: CreateUserInput) {
  // Validate input
  const validation = createUserSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      user: null,
    };
  }

  const { email, password, name, role, locale } = validation.data;

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already in use",
        user: null,
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        locale,
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        locale: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      error: null,
      user,
    };
  } catch (error) {
    console.error("User creation error:", error);
    return {
      success: false,
      error: "An error occurred while creating the user",
      user: null,
    };
  }
}

/**
 * Change user password
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success status
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Verify current password
    const passwordMatch = await verifyPassword(currentPassword, user.password);
    if (!passwordMatch) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Validate new password complexity
    const validation = validatePasswordComplexity(newPassword);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Password change error:", error);
    return {
      success: false,
      error: "An error occurred while changing the password",
    };
  }
}

/**
 * Reset user password (admin function)
 * @param userId - User ID
 * @param newPassword - New password
 * @returns Success status
 */
export async function resetPassword(userId: string, newPassword: string) {
  try {
    // Validate new password complexity
    const validation = validatePasswordComplexity(newPassword);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "An error occurred while resetting the password",
    };
  }
}

/**
 * Validate session and get user
 * @param userId - User ID from session
 * @returns User object if valid, null otherwise
 */
export async function validateSession(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        locale: true,
      },
    });

    // Check if user exists and is active
    if (!user || !user.active) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}
