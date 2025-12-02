import { describe, it, expect, afterAll } from "vitest";
import * as fc from "fast-check";
import { createUser } from "../auth-service";
import { updateUser, getUserById } from "../user-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Clean up test users after tests
afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "@test-user-",
      },
    },
  });
  await prisma.$disconnect();
});

/**
 * Feature: school-management-system, Property 1: User creation assigns correct role
 * Validates: Requirements 1.1
 *
 * For any valid user data with a specified role, creating a user account
 * should result in a user with that exact role assigned.
 */
describe("Property 1: User creation assigns correct role", () => {
  it("should create users with the correct role assigned", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-role-${Date.now()}-${Math.random()}.com`
            ),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom("ADMIN", "TEACHER", "STUDENT"),
        }),
        async (userData) => {
          // Create user with specified role
          const createResult = await createUser({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: userData.role as "ADMIN" | "TEACHER" | "STUDENT",
          });

          // Skip if creation failed (e.g., duplicate email)
          if (!createResult.success || !createResult.user) {
            return true;
          }

          // Verify the role was assigned correctly
          expect(createResult.user.role).toBe(userData.role);

          // Also verify by fetching the user
          const fetchResult = await getUserById(createResult.user.id);
          expect(fetchResult.success).toBe(true);
          expect(fetchResult.user?.role).toBe(userData.role);

          // Clean up
          await prisma.user.delete({
            where: { id: createResult.user.id },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Feature: school-management-system, Property 2: User updates persist correctly
 * Validates: Requirements 1.2
 *
 * For any existing user and valid update data, updating the user should
 * result in the new data being retrievable from the system.
 */
describe("Property 2: User updates persist correctly", () => {
  it("should persist user updates correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Initial user data
          initialEmail: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-update-${Date.now()}-${Math.random()}.com`
            ),
          initialPassword: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          initialName: fc.string({ minLength: 1, maxLength: 50 }),
          initialRole: fc.constantFrom("ADMIN", "TEACHER", "STUDENT"),
          // Update data
          newName: fc.string({ minLength: 1, maxLength: 50 }),
          newRole: fc.constantFrom("ADMIN", "TEACHER", "STUDENT"),
        }),
        async (data) => {
          // Create initial user
          const createResult = await createUser({
            email: data.initialEmail,
            password: data.initialPassword,
            name: data.initialName,
            role: data.initialRole as "ADMIN" | "TEACHER" | "STUDENT",
          });

          if (!createResult.success || !createResult.user) {
            return true;
          }

          const userId = createResult.user.id;

          // Update the user
          const updateResult = await updateUser(userId, {
            name: data.newName,
            role: data.newRole as "ADMIN" | "TEACHER" | "STUDENT",
          });

          expect(updateResult.success).toBe(true);
          expect(updateResult.user).not.toBeNull();

          // Verify updates persisted by fetching the user
          const fetchResult = await getUserById(userId);
          expect(fetchResult.success).toBe(true);
          expect(fetchResult.user?.name).toBe(data.newName);
          expect(fetchResult.user?.role).toBe(data.newRole);
          expect(fetchResult.user?.email).toBe(data.initialEmail); // Email unchanged

          // Clean up
          await prisma.user.delete({
            where: { id: userId },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should persist email updates correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialEmail: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-email-${Date.now()}-${Math.random()}.com`
            ),
          newEmail: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-email-new-${Date.now()}-${Math.random()}.com`
            ),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (data) => {
          // Create initial user
          const createResult = await createUser({
            email: data.initialEmail,
            password: data.password,
            name: data.name,
            role: "STUDENT",
          });

          if (!createResult.success || !createResult.user) {
            return true;
          }

          const userId = createResult.user.id;

          // Update email
          const updateResult = await updateUser(userId, {
            email: data.newEmail,
          });

          expect(updateResult.success).toBe(true);

          // Verify email was updated
          const fetchResult = await getUserById(userId);
          expect(fetchResult.success).toBe(true);
          expect(fetchResult.user?.email).toBe(data.newEmail);

          // Clean up
          await prisma.user.delete({
            where: { id: userId },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should persist active status updates correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-active-${Date.now()}-${Math.random()}.com`
            ),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          newActiveStatus: fc.boolean(),
        }),
        async (data) => {
          // Create user (starts as active)
          const createResult = await createUser({
            email: data.email,
            password: data.password,
            name: data.name,
            role: "STUDENT",
          });

          if (!createResult.success || !createResult.user) {
            return true;
          }

          const userId = createResult.user.id;

          // Update active status
          const updateResult = await updateUser(userId, {
            active: data.newActiveStatus,
          });

          expect(updateResult.success).toBe(true);

          // Verify active status was updated
          const fetchResult = await getUserById(userId);
          expect(fetchResult.success).toBe(true);
          expect(fetchResult.user?.active).toBe(data.newActiveStatus);

          // Clean up
          await prisma.user.delete({
            where: { id: userId },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Feature: school-management-system, Property 4: Email uniqueness is enforced
 * Validates: Requirements 1.5
 *
 * For any email address already associated with a user, attempting to create
 * another user with the same email should be rejected.
 */
describe("Property 4: Email uniqueness is enforced", () => {
  it("should reject duplicate email on user creation", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-unique-${Date.now()}-${Math.random()}.com`
            ),
          password1: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          password2: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name1: fc.string({ minLength: 1, maxLength: 50 }),
          name2: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (data) => {
          // Create first user
          const firstResult = await createUser({
            email: data.email,
            password: data.password1,
            name: data.name1,
            role: "STUDENT",
          });

          if (!firstResult.success || !firstResult.user) {
            return true;
          }

          // Try to create second user with same email
          const secondResult = await createUser({
            email: data.email, // Same email
            password: data.password2,
            name: data.name2,
            role: "TEACHER",
          });

          // Second creation should fail
          expect(secondResult.success).toBe(false);
          expect(secondResult.error).toContain("already in use");
          expect(secondResult.user).toBeNull();

          // Clean up
          await prisma.user.delete({
            where: { id: firstResult.user.id },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should reject duplicate email on user update", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email1: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-dup1-${Date.now()}-${Math.random()}.com`
            ),
          email2: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-dup2-${Date.now()}-${Math.random()}.com`
            ),
          password1: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          password2: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name1: fc.string({ minLength: 1, maxLength: 50 }),
          name2: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (data) => {
          // Create two users with different emails
          const user1Result = await createUser({
            email: data.email1,
            password: data.password1,
            name: data.name1,
            role: "STUDENT",
          });

          const user2Result = await createUser({
            email: data.email2,
            password: data.password2,
            name: data.name2,
            role: "TEACHER",
          });

          if (
            !user1Result.success ||
            !user1Result.user ||
            !user2Result.success ||
            !user2Result.user
          ) {
            // Clean up any created users
            if (user1Result.user) {
              await prisma.user.delete({ where: { id: user1Result.user.id } });
            }
            if (user2Result.user) {
              await prisma.user.delete({ where: { id: user2Result.user.id } });
            }
            return true;
          }

          // Try to update user2's email to user1's email
          const updateResult = await updateUser(user2Result.user.id, {
            email: data.email1, // Try to use user1's email
          });

          // Update should fail due to duplicate email
          expect(updateResult.success).toBe(false);
          expect(updateResult.error).toContain("already in use");

          // Verify user2's email didn't change
          const fetchResult = await getUserById(user2Result.user.id);
          expect(fetchResult.user?.email).toBe(data.email2);

          // Clean up
          await prisma.user.delete({ where: { id: user1Result.user.id } });
          await prisma.user.delete({ where: { id: user2Result.user.id } });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Feature: school-management-system, Property 3: Deactivated users cannot authenticate
 * Validates: Requirements 1.3
 *
 * For any deactivated user account, authentication attempts should be rejected
 * regardless of correct credentials.
 */
describe("Property 3: Deactivated users cannot authenticate", () => {
  it("should reject authentication for deactivated users with correct credentials", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-deactivated-${Date.now()}-${Math.random()}.com`
            ),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom("ADMIN", "TEACHER", "STUDENT"),
        }),
        async (userData) => {
          // Import authenticateUser here to avoid circular dependency issues
          const { authenticateUser } = await import("../auth-service");

          // Create user
          const createResult = await createUser({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: userData.role as "ADMIN" | "TEACHER" | "STUDENT",
          });

          if (!createResult.success || !createResult.user) {
            return true;
          }

          const userId = createResult.user.id;

          // Verify user can authenticate when active
          const activeAuthResult = await authenticateUser({
            email: userData.email,
            password: userData.password,
          });

          expect(activeAuthResult.success).toBe(true);
          expect(activeAuthResult.user).not.toBeNull();

          // Deactivate the user
          const deactivateResult = await updateUser(userId, {
            active: false,
          });

          expect(deactivateResult.success).toBe(true);
          expect(deactivateResult.user?.active).toBe(false);

          // Try to authenticate with correct credentials
          const deactivatedAuthResult = await authenticateUser({
            email: userData.email,
            password: userData.password,
          });

          // Authentication should fail for deactivated user
          expect(deactivatedAuthResult.success).toBe(false);
          expect(deactivatedAuthResult.user).toBeNull();
          expect(deactivatedAuthResult.error).toBeTruthy();
          expect(deactivatedAuthResult.error).toContain("deactivated");

          // Clean up
          await prisma.user.delete({
            where: { id: userId },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should allow authentication after reactivating a user", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map(
              (email) =>
                `${email.split("@")[0]}@test-user-reactivate-${Date.now()}-${Math.random()}.com`
            ),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (userData) => {
          const { authenticateUser } = await import("../auth-service");

          // Create user
          const createResult = await createUser({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: "STUDENT",
          });

          if (!createResult.success || !createResult.user) {
            return true;
          }

          const userId = createResult.user.id;

          // Deactivate the user
          await updateUser(userId, { active: false });

          // Verify authentication fails when deactivated
          const deactivatedAuth = await authenticateUser({
            email: userData.email,
            password: userData.password,
          });

          expect(deactivatedAuth.success).toBe(false);

          // Reactivate the user
          const reactivateResult = await updateUser(userId, {
            active: true,
          });

          expect(reactivateResult.success).toBe(true);
          expect(reactivateResult.user?.active).toBe(true);

          // Authentication should now succeed
          const reactivatedAuth = await authenticateUser({
            email: userData.email,
            password: userData.password,
          });

          expect(reactivatedAuth.success).toBe(true);
          expect(reactivatedAuth.user).not.toBeNull();
          expect(reactivatedAuth.user?.email).toBe(userData.email);

          // Clean up
          await prisma.user.delete({
            where: { id: userId },
          });

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
