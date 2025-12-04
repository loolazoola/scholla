"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  createClassCohortAction,
  updateClassCohortAction,
} from "@/app/actions/class-cohorts";
import { listGradingPoliciesAction } from "@/app/actions/grading-policies";
import { listUsersAction } from "@/app/actions/users";
type SchoolLevel = "SD" | "SMP" | "SMA" | "SMK";

// Form validation schema
const classCohortFormSchema = z.object({
  name: z.string().min(1, "Class name is required").max(50, "Name is too long"),
  level: z.enum(["SD", "SMP", "SMA", "SMK"]),
  grade: z.number().int().min(1).max(12),
  homeroomTeacherId: z.string().optional().nullable(),
  academicYear: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY (e.g., 2024/2025)"),
  capacity: z.number().int().positive().optional().nullable(),
  gradingPolicyId: z.string().min(1, "Grading policy is required"),
});

type ClassCohortFormData = z.infer<typeof classCohortFormSchema>;

interface ClassCohortFormProps {
  classCohort?: {
    id: string;
    name: string;
    level: SchoolLevel;
    grade: number;
    academicYear: string;
    capacity: number | null;
    homeroomTeacher: {
      id: string;
      name: string;
    } | null;
    gradingPolicy: {
      id: string;
      name: string;
    };
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClassCohortForm({
  classCohort,
  onSuccess,
  onCancel,
}: ClassCohortFormProps) {
  const isEditMode = !!classCohort;

  const [formData, setFormData] = useState<ClassCohortFormData>({
    name: classCohort?.name || "",
    level: classCohort?.level || "SMA",
    grade: classCohort?.grade || 10,
    homeroomTeacherId: classCohort?.homeroomTeacher?.id || null,
    academicYear: classCohort?.academicYear || "",
    capacity: classCohort?.capacity || null,
    gradingPolicyId: classCohort?.gradingPolicy?.id || "",
  });

  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load options
  const [gradingPolicies, setGradingPolicies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [teachers, setTeachers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setIsLoadingOptions(true);
    try {
      // Load grading policies
      const policiesResult = await listGradingPoliciesAction();
      if (policiesResult.success) {
        setGradingPolicies(policiesResult.policies);
      }

      // Load active teachers
      const teachersResult = await listUsersAction({
        role: "TEACHER",
        active: true,
        limit: 100,
      });
      if (teachersResult.success) {
        setTeachers(
          teachersResult.users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
          }))
        );
      }
    } catch (error) {
      console.error("Load options error:", error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    setSuccessMessage("");

    // Convert empty strings to null for optional fields
    const submitData = {
      ...formData,
      homeroomTeacherId: formData.homeroomTeacherId || null,
      capacity: formData.capacity || null,
    };

    // Validate form data
    const validation = classCohortFormSchema.safeParse(submitData);
    if (!validation.success) {
      setErrors(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (isEditMode) {
        result = await updateClassCohortAction(classCohort.id, validation.data);
      } else {
        result = await createClassCohortAction(validation.data);
      }

      if (result.success) {
        setSuccessMessage(
          isEditMode
            ? "Class cohort updated successfully"
            : "Class cohort created successfully"
        );
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1000);
        }
      } else {
        setErrors(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeOptions = (level: SchoolLevel) => {
    switch (level) {
      case "SD":
        return [1, 2, 3, 4, 5, 6];
      case "SMP":
        return [7, 8, 9];
      case "SMA":
      case "SMK":
        return [10, 11, 12];
      default:
        return [10, 11, 12];
    }
  };

  if (isLoadingOptions) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success message */}
      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {errors && (
        <Alert variant="destructive">
          <AlertDescription>{errors}</AlertDescription>
        </Alert>
      )}

      {/* Class name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Class Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g., X-A, XII IPA 1"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Enter the class cohort name (e.g., X-A for grade 10 class A)
        </p>
      </div>

      {/* Level and Grade */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">School Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => {
              handleChange("level", value);
              // Reset grade when level changes
              const newGrades = getGradeOptions(value as SchoolLevel);
              handleChange("grade", newGrades[0]);
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SD">SD (Elementary)</SelectItem>
              <SelectItem value="SMP">SMP (Junior High)</SelectItem>
              <SelectItem value="SMA">SMA (Senior High)</SelectItem>
              <SelectItem value="SMK">SMK (Vocational)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade.toString()}
            onValueChange={(value) => handleChange("grade", parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {getGradeOptions(formData.level).map((grade) => (
                <SelectItem key={grade} value={grade.toString()}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Academic year field */}
      <div className="space-y-2">
        <Label htmlFor="academicYear">Academic Year</Label>
        <Input
          id="academicYear"
          name="academicYear"
          type="text"
          required
          placeholder="2024/2025"
          value={formData.academicYear}
          onChange={(e) => handleChange("academicYear", e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Format: YYYY/YYYY (e.g., 2024/2025)
        </p>
      </div>

      {/* Capacity field */}
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity (Optional)</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          placeholder="e.g., 30"
          value={formData.capacity || ""}
          onChange={(e) =>
            handleChange(
              "capacity",
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of students in this class
        </p>
      </div>

      {/* Homeroom teacher field */}
      <div className="space-y-2">
        <Label htmlFor="homeroomTeacherId">Homeroom Teacher (Optional)</Label>
        <Select
          value={formData.homeroomTeacherId || "none"}
          onValueChange={(value) =>
            handleChange("homeroomTeacherId", value === "none" ? null : value)
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select homeroom teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No homeroom teacher</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {teachers.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No teachers available. Create teacher accounts first.
          </p>
        )}
      </div>

      {/* Grading policy field */}
      <div className="space-y-2">
        <Label htmlFor="gradingPolicyId">Grading Policy</Label>
        <Select
          value={formData.gradingPolicyId}
          onValueChange={(value) => handleChange("gradingPolicyId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grading policy" />
          </SelectTrigger>
          <SelectContent>
            {gradingPolicies.map((policy) => (
              <SelectItem key={policy.id} value={policy.id}>
                {policy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {gradingPolicies.length === 0 && (
          <p className="text-xs text-destructive">
            No grading policies available. Create one first.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || gradingPolicies.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update Class Cohort"
          ) : (
            "Create Class Cohort"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
