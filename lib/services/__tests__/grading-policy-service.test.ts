import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  calculateLetterGrade,
  calculateGPA,
  validateGradingScale,
  type GradeScaleItem,
} from "../grading-policy-service";

// Generator for valid grade scale items
const gradeScaleItemArb = fc
  .record({
    letter: fc.string({ minLength: 1, maxLength: 3 }),
    minValue: fc.integer({ min: 0, max: 100 }),
    maxValue: fc.integer({ min: 0, max: 100 }),
    gpaValue: fc.float({ min: 0, max: 4, noNaN: true }),
  })
  .filter((item) => item.minValue <= item.maxValue);

// Generator for valid grading scales (non-overlapping ranges)
const validGradeScaleArb = fc
  .array(gradeScaleItemArb, { minLength: 1, maxLength: 10 })
  .filter((scale) => {
    // Ensure no overlapping ranges
    const sortedScale = [...scale].sort((a, b) => b.minValue - a.minValue);
    for (let i = 0; i < sortedScale.length - 1; i++) {
      if (sortedScale[i].minValue <= sortedScale[i + 1].maxValue) {
        return false;
      }
    }
    return true;
  });

/**
 * Feature: school-management-system, Property 17a: Grading policy consistency
 * Validates: Requirements 5a.3
 *
 * For any class with a grading policy, all grade letter values should be
 * computed using that policy's scale mapping from numeric values.
 */
describe("Property 17a: Grading policy consistency", () => {
  it("should consistently map numeric values to letter grades", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        validGradeScaleArb,
        (numericValue, scale) => {
          // Calculate letter grade twice with same inputs
          const grade1 = calculateLetterGrade(numericValue, scale);
          const grade2 = calculateLetterGrade(numericValue, scale);

          // Same input should always return same result (deterministic)
          expect(grade1).toBe(grade2);

          // If a grade is found, it should match the scale definition
          if (grade1 !== null) {
            const matchingItem = scale.find(
              (item) =>
                numericValue >= item.minValue && numericValue <= item.maxValue
            );
            expect(matchingItem).toBeDefined();
            expect(grade1).toBe(matchingItem!.letter);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should consistently map numeric values to GPA values", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        validGradeScaleArb,
        (numericValue, scale) => {
          // Calculate GPA twice with same inputs
          const gpa1 = calculateGPA(numericValue, scale);
          const gpa2 = calculateGPA(numericValue, scale);

          // Same input should always return same result (deterministic)
          expect(gpa1).toBe(gpa2);

          // If a GPA is found, it should match the scale definition
          if (gpa1 !== null) {
            const matchingItem = scale.find(
              (item) =>
                numericValue >= item.minValue && numericValue <= item.maxValue
            );
            expect(matchingItem).toBeDefined();
            expect(gpa1).toBe(matchingItem!.gpaValue);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return consistent letter and GPA for the same numeric value", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        validGradeScaleArb,
        (numericValue, scale) => {
          const letter = calculateLetterGrade(numericValue, scale);
          const gpa = calculateGPA(numericValue, scale);

          // Both should be null or both should be non-null
          if (letter === null) {
            expect(gpa).toBeNull();
          } else {
            expect(gpa).not.toBeNull();

            // They should come from the same scale item
            const matchingItem = scale.find(
              (item) =>
                numericValue >= item.minValue && numericValue <= item.maxValue
            );
            expect(matchingItem).toBeDefined();
            expect(letter).toBe(matchingItem!.letter);
            expect(gpa).toBe(matchingItem!.gpaValue);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return null for values outside all scale ranges", () => {
    fc.assert(
      fc.property(validGradeScaleArb, (scale) => {
        // Find gaps in the scale
        const sortedScale = [...scale].sort((a, b) => a.minValue - b.minValue);

        // Test value below minimum range
        const minRange = Math.min(...scale.map((item) => item.minValue));
        if (minRange > 0) {
          const belowMin = minRange - 1;
          expect(calculateLetterGrade(belowMin, scale)).toBeNull();
          expect(calculateGPA(belowMin, scale)).toBeNull();
        }

        // Test value above maximum range
        const maxRange = Math.max(...scale.map((item) => item.maxValue));
        if (maxRange < 100) {
          const aboveMax = maxRange + 1;
          expect(calculateLetterGrade(aboveMax, scale)).toBeNull();
          expect(calculateGPA(aboveMax, scale)).toBeNull();
        }

        // Test values in gaps between ranges
        for (let i = 0; i < sortedScale.length - 1; i++) {
          const gapStart = sortedScale[i].maxValue + 1;
          const gapEnd = sortedScale[i + 1].minValue - 1;

          if (gapStart <= gapEnd) {
            // There's a gap, test a value in it
            const gapValue = Math.floor((gapStart + gapEnd) / 2);
            expect(calculateLetterGrade(gapValue, scale)).toBeNull();
            expect(calculateGPA(gapValue, scale)).toBeNull();
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should respect boundary values exactly", () => {
    fc.assert(
      fc.property(validGradeScaleArb, (scale) => {
        // Test that boundary values are included in their ranges
        for (const item of scale) {
          // Test minimum boundary
          const letterAtMin = calculateLetterGrade(item.minValue, scale);
          const gpaAtMin = calculateGPA(item.minValue, scale);
          expect(letterAtMin).toBe(item.letter);
          expect(gpaAtMin).toBe(item.gpaValue);

          // Test maximum boundary
          const letterAtMax = calculateLetterGrade(item.maxValue, scale);
          const gpaAtMax = calculateGPA(item.maxValue, scale);
          expect(letterAtMax).toBe(item.letter);
          expect(gpaAtMax).toBe(item.gpaValue);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should validate that scale validation is consistent", () => {
    fc.assert(
      fc.property(validGradeScaleArb, (scale) => {
        // Valid scales should pass validation
        const result = validateGradingScale(scale);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();

        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional edge case tests for grading policy consistency
 */
describe("Grading policy edge cases", () => {
  it("should handle empty scale gracefully", () => {
    const emptyScale: GradeScaleItem[] = [];

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (value) => {
        expect(calculateLetterGrade(value, emptyScale)).toBeNull();
        expect(calculateGPA(value, emptyScale)).toBeNull();
        return true;
      }),
      { numRuns: 50 }
    );

    // Validation should reject empty scale
    const validation = validateGradingScale(emptyScale);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("at least one grade");
  });

  it("should handle single-grade scale (Pass/Fail)", () => {
    const passFailScale: GradeScaleItem[] = [
      { letter: "Pass", minValue: 0, maxValue: 100, gpaValue: 4.0 },
    ];

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (value) => {
        expect(calculateLetterGrade(value, passFailScale)).toBe("Pass");
        expect(calculateGPA(value, passFailScale)).toBe(4.0);
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it("should handle scale with gaps", () => {
    const gappedScale: GradeScaleItem[] = [
      { letter: "A", minValue: 90, maxValue: 100, gpaValue: 4.0 },
      { letter: "C", minValue: 70, maxValue: 79, gpaValue: 2.0 },
      { letter: "F", minValue: 0, maxValue: 59, gpaValue: 0.0 },
    ];

    // Values in the gap (80-89, 60-69) should return null
    for (let i = 80; i <= 89; i++) {
      expect(calculateLetterGrade(i, gappedScale)).toBeNull();
      expect(calculateGPA(i, gappedScale)).toBeNull();
    }

    for (let i = 60; i <= 69; i++) {
      expect(calculateLetterGrade(i, gappedScale)).toBeNull();
      expect(calculateGPA(i, gappedScale)).toBeNull();
    }

    // Values in ranges should work normally
    expect(calculateLetterGrade(95, gappedScale)).toBe("A");
    expect(calculateLetterGrade(75, gappedScale)).toBe("C");
    expect(calculateLetterGrade(50, gappedScale)).toBe("F");
  });

  it("should reject overlapping ranges", () => {
    const overlappingScale: GradeScaleItem[] = [
      { letter: "A", minValue: 90, maxValue: 100, gpaValue: 4.0 },
      { letter: "B", minValue: 85, maxValue: 92, gpaValue: 3.0 }, // Overlaps with A
    ];

    const validation = validateGradingScale(overlappingScale);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("must not overlap");
  });

  it("should reject invalid value ranges", () => {
    const invalidScale: GradeScaleItem[] = [
      { letter: "A", minValue: 90, maxValue: 80, gpaValue: 4.0 }, // min > max
    ];

    const validation = validateGradingScale(invalidScale);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("Min value cannot be greater than max value");
  });

  it("should reject values outside 0-100 range", () => {
    const outOfRangeScale: GradeScaleItem[] = [
      { letter: "A", minValue: -10, maxValue: 100, gpaValue: 4.0 },
    ];

    const validation = validateGradingScale(outOfRangeScale);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("between 0 and 100");
  });

  it("should handle standard grading scale correctly", () => {
    const standardScale: GradeScaleItem[] = [
      { letter: "A", minValue: 90, maxValue: 100, gpaValue: 4.0 },
      { letter: "B", minValue: 80, maxValue: 89, gpaValue: 3.0 },
      { letter: "C", minValue: 70, maxValue: 79, gpaValue: 2.0 },
      { letter: "D", minValue: 60, maxValue: 69, gpaValue: 1.0 },
      { letter: "F", minValue: 0, maxValue: 59, gpaValue: 0.0 },
    ];

    // Test specific known values
    expect(calculateLetterGrade(95, standardScale)).toBe("A");
    expect(calculateGPA(95, standardScale)).toBe(4.0);

    expect(calculateLetterGrade(85, standardScale)).toBe("B");
    expect(calculateGPA(85, standardScale)).toBe(3.0);

    expect(calculateLetterGrade(75, standardScale)).toBe("C");
    expect(calculateGPA(75, standardScale)).toBe(2.0);

    expect(calculateLetterGrade(65, standardScale)).toBe("D");
    expect(calculateGPA(65, standardScale)).toBe(1.0);

    expect(calculateLetterGrade(55, standardScale)).toBe("F");
    expect(calculateGPA(55, standardScale)).toBe(0.0);

    // Test boundary values
    expect(calculateLetterGrade(90, standardScale)).toBe("A");
    expect(calculateLetterGrade(89, standardScale)).toBe("B");
    expect(calculateLetterGrade(80, standardScale)).toBe("B");
    expect(calculateLetterGrade(79, standardScale)).toBe("C");
  });
});
