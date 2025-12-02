import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { validatePasswordComplexity, passwordSchema } from "../auth-service";

/**
 * Feature: school-management-system, Property 37: Password complexity is enforced
 * Validates: Requirements 10.5
 * 
 * For any password not meeting complexity requirements (minimum length and character variety),
 * user creation or password update should be rejected.
 */
describe("Property 37: Password complexity is enforced", () => {
  it("should accept passwords that meet all complexity requirements", async () => {
    await fc.assert(
      fc.property(
        // Generate valid passwords: at least 8 chars with lowercase, uppercase, number, and special char
        fc
          .tuple(
            fc.stringMatching(/^[a-z]+$/), // lowercase letters only
            fc.stringMatching(/^[A-Z]+$/), // uppercase letters only
            fc.integer({ min: 0, max: 9 }), // number
            fc.constantFrom("!", "@", "#", "$", "%", "^", "&", "*"), // special char
            fc.stringMatching(/^[a-zA-Z0-9]*$/) // additional alphanumeric
          )
          .map(([lower, upper, num, special, extra]) => {
            return `${lower}${upper}${num}${special}${extra}`;
          })
          .filter((pwd) => pwd.length >= 8),
        (password) => {
          const result = validatePasswordComplexity(password);
          
          // Should pass validation
          expect(result.success).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it("should reject passwords that are too short", async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 7 }),
        (password) => {
          const result = validatePasswordComplexity(password);
          
          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain("at least 8 characters");
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("should reject passwords without lowercase letters", async () => {
    await fc.assert(
      fc.property(
        // Generate passwords with uppercase, numbers, special chars but NO lowercase
        fc
          .tuple(
            fc.string({ minLength: 2, maxLength: 10 }).map((s) => s.toUpperCase()),
            fc.integer({ min: 0, max: 9 }),
            fc.constantFrom("!", "@", "#", "$", "%")
          )
          .map(([upper, num, special]) => `${upper}${num}${special}`)
          .filter((pwd) => pwd.length >= 8 && !/[a-z]/.test(pwd)),
        (password) => {
          const result = validatePasswordComplexity(password);
          
          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain("lowercase");
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("should reject passwords without uppercase letters", async () => {
    await fc.assert(
      fc.property(
        // Generate passwords with lowercase, numbers, special chars but NO uppercase
        fc
          .tuple(
            fc.string({ minLength: 2, maxLength: 10 }).map((s) => s.toLowerCase()),
            fc.integer({ min: 0, max: 9 }),
            fc.constantFrom("!", "@", "#", "$", "%")
          )
          .map(([lower, num, special]) => `${lower}${num}${special}`)
          .filter((pwd) => pwd.length >= 8 && !/[A-Z]/.test(pwd)),
        (password) => {
          const result = validatePasswordComplexity(password);
          
          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain("uppercase");
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("should reject passwords without numbers", async () => {
    await fc.assert(
      fc.property(
        // Generate passwords with letters and special chars but NO numbers
        fc
          .tuple(
            fc.stringMatching(/^[a-z]{2,5}$/), // lowercase only
            fc.stringMatching(/^[A-Z]{2,5}$/), // uppercase only
            fc.constantFrom("!", "@", "#", "$", "%")
          )
          .map(([lower, upper, special]) => `${lower}${upper}${special}`)
          .filter((pwd) => pwd.length >= 8 && !/[0-9]/.test(pwd)),
        (password) => {
          const result = validatePasswordComplexity(password);
          
          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            // Check that it fails for missing number (might fail for other reasons first)
            const hasError = result.error.issues.some(issue => 
              issue.message.includes("number")
            );
            // If it has 8+ chars, lowercase, uppercase, and special, it should fail for number
            if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
              expect(hasError).toBe(true);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("should reject passwords without special characters", async () => {
    await fc.assert(
      fc.property(
        // Generate passwords with letters and numbers but NO special chars
        fc
          .tuple(
            fc.string({ minLength: 2, maxLength: 5 }).map((s) => s.toLowerCase()),
            fc.string({ minLength: 2, maxLength: 5 }).map((s) => s.toUpperCase()),
            fc.integer({ min: 0, max: 9 })
          )
          .map(([lower, upper, num]) => `${lower}${upper}${num}`)
          .filter((pwd) => pwd.length >= 8 && !/[^a-zA-Z0-9]/.test(pwd)),
        (password) => {
          const result = validatePasswordComplexity(password);
          
          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain("special character");
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("should handle edge cases correctly", () => {
    // Exactly 8 characters with all requirements
    const minValid = "Aa1!bcde";
    expect(validatePasswordComplexity(minValid).success).toBe(true);

    // 7 characters (too short)
    const tooShort = "Aa1!bcd";
    expect(validatePasswordComplexity(tooShort).success).toBe(false);

    // Empty string
    const empty = "";
    expect(validatePasswordComplexity(empty).success).toBe(false);

    // Only special characters
    const onlySpecial = "!@#$%^&*";
    expect(validatePasswordComplexity(onlySpecial).success).toBe(false);

    // Very long valid password
    const longValid = "Aa1!" + "x".repeat(100);
    expect(validatePasswordComplexity(longValid).success).toBe(true);
  });
});

/**
 * Additional property: Password validation is consistent
 */
describe("Password validation consistency", () => {
  it("should give the same result for the same password", async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (password) => {
          const result1 = validatePasswordComplexity(password);
          const result2 = validatePasswordComplexity(password);
          
          // Results should be identical
          expect(result1.success).toBe(result2.success);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
