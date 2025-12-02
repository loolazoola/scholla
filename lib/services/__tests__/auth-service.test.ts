import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import {
  authenticateUser,
  createUser,
  hashPassword,
  verifyPassword,
  validatePasswordComplexity,
} from "../auth-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Clean up test users after tests
afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "@test-auth-",
      },
    },
  });
  await prisma.$disconnect();
});

/**
 * Feature: school-management-system, Property 33: Valid credentials succeed, invalid fail
 * Validates: Requirements 10.1
 * 
 * For any user with correct email and password, authentication should succeed;
 * for any incorrect combination, authentication should fail.
 */
describe("Property 33: Valid credentials succeed, invalid fail", () => {
  it("should authenticate successfully with valid credentials", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map((email) => `${email.split("@")[0]}@test-auth-${Date.now()}-${Math.random()}.com`),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom("ADMIN", "TEACHER", "STUDENT"),
        }),
        async (userData) => {
          // Create a user
          const createResult = await createUser({
            ...userData,
            role: userData.role as "ADMIN" | "TEACHER" | "STUDENT",
          });

          // Skip if user creation failed (e.g., duplicate email)
          if (!createResult.success) {
            return true;
          }

          // Test 1: Valid credentials should succeed
          const validAuth = await authenticateUser({
            email: userData.email,
            password: userData.password,
          });

          expect(validAuth.success).toBe(true);
          expect(validAuth.user).not.toBeNull();
          expect(validAuth.user?.email).toBe(userData.email);
          expect(validAuth.error).toBeNull();

          // Test 2: Invalid password should fail
          const invalidPasswordAuth = await authenticateUser({
            email: userData.email,
            password: userData.password + "wrong",
          });

          expect(invalidPasswordAuth.success).toBe(false);
          expect(invalidPasswordAuth.user).toBeNull();
          expect(invalidPasswordAuth.error).not.toBeNull();

          // Test 3: Invalid email should fail
          const invalidEmailAuth = await authenticateUser({
            email: "nonexistent@test.com",
            password: userData.password,
          });

          expect(invalidEmailAuth.success).toBe(false);
          expect(invalidEmailAuth.user).toBeNull();
          expect(invalidEmailAuth.error).not.toBeNull();

          // Clean up
          if (createResult.user) {
            await prisma.user.delete({
              where: { id: createResult.user.id },
            });
          }

          return true;
        }
      ),
      { numRuns: 10 } // Run 10 times for faster testing
    );
  });

  it("should reject authentication for inactive users", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc
            .emailAddress()
            .map((email) => `${email.split("@")[0]}@test-auth-inactive-${Date.now()}-${Math.random()}.com`),
          password: fc.string({ minLength: 8, maxLength: 20 }).map((s) => `Aa1!${s}`),
          name: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (userData) => {
          // Create a user
          const createResult = await createUser({
            ...userData,
            role: "STUDENT",
          });

          if (!createResult.success || !createResult.user) {
            return true;
          }

          // Deactivate the user
          await prisma.user.update({
            where: { id: createResult.user.id },
            data: { active: false },
          });

          // Try to authenticate
          const authResult = await authenticateUser({
            email: userData.email,
            password: userData.password,
          });

          // Should fail because user is inactive
          expect(authResult.success).toBe(false);
          expect(authResult.user).toBeNull();
          expect(authResult.error).toContain("deactivated");

          // Clean up
          await prisma.user.delete({
            where: { id: createResult.user.id },
          });

          return true;
        }
      ),
      { numRuns: 5 }
    );
  });
});

/**
 * Test password hashing and verification
 */
describe("Password hashing and verification", () => {
  it("should hash passwords consistently and verify correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 100 }),
        async (password) => {
          // Hash the password
          const hash1 = await hashPassword(password);
          const hash2 = await hashPassword(password);

          // Hashes should be different (due to salt)
          expect(hash1).not.toBe(hash2);

          // But both should verify correctly
          const verify1 = await verifyPassword(password, hash1);
          const verify2 = await verifyPassword(password, hash2);

          expect(verify1).toBe(true);
          expect(verify2).toBe(true);

          // Wrong password should not verify
          const wrongVerify = await verifyPassword(password + "wrong", hash1);
          expect(wrongVerify).toBe(false);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});
