"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { bulkCreateEnrollmentsAction } from "@/app/actions/enrollments";
import { listClassCohortsAction } from "@/app/actions/class-cohorts";
import { listUsersAction } from "@/app/actions/users";

// Form validation schema
const enrollmentFormSchema = z.object({
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
  classId: z.string().min(1, "Class is required"),
  academicYear: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY (e.g., 2024/2025)"),
});

type EnrollmentFormData = z.infer<typeof enrollmentFormSchema>;

interface EnrollmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EnrollmentForm({ onSuccess, onCancel }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    studentIds: [],
    classId: "",
    academicYear: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load options
  const [classes, setClasses] = useState<
    Array<{
      id: string;
      name: string;
      level: string;
      grade: number;
      capacity: number | null;
      _count: { enrollments: number };
    }>
  >([]);
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [allStudents, setAllStudents] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  // Load enrolled students when academic year changes
  useEffect(() => {
    if (formData.academicYear && allStudents.length > 0) {
      loadEnrolledStudents();
    } else if (!formData.academicYear) {
      setEnrolledStudentIds(new Set());
      setStudents(allStudents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.academicYear]);

  const loadOptions = async () => {
    setIsLoadingOptions(true);
    try {
      // Load classes
      const classesResult = await listClassCohortsAction();
      if (classesResult.success) {
        setClasses(classesResult.classes as any);
      }

      // Load active students
      const studentsResult = await listUsersAction({
        role: "STUDENT",
        active: true,
        limit: 100,
      });
      if (studentsResult.success) {
        const studentList = studentsResult.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }));
        setAllStudents(studentList);
        setStudents(studentList);
      }
    } catch (error) {
      console.error("Load options error:", error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const loadEnrolledStudents = async () => {
    try {
      const { listEnrollmentsAction } = await import(
        "@/app/actions/enrollments"
      );

      console.log("Loading enrollments for:");
      console.log("  academicYear:", formData.academicYear);
      console.log("  (checking ALL classes for this academic year)");

      // Query enrollments for the academic year across ALL classes
      const result = await listEnrollmentsAction({
        academicYear: formData.academicYear,
        status: "ACTIVE",
      });

      console.log("Enrollment result:", result);

      if (result.success) {
        const enrolledIds = new Set(
          result.enrollments.map((e: any) => e.student.id)
        );

        console.log("Enrolled student IDs:", Array.from(enrolledIds));
        console.log(
          "All students:",
          allStudents.map((s) => ({ id: s.id, name: s.name }))
        );

        setEnrolledStudentIds(enrolledIds);

        // Filter out already enrolled students (in ANY class for this academic year)
        const availableStudents = allStudents.filter(
          (student) => !enrolledIds.has(student.id)
        );

        console.log(
          "Available students after filter:",
          availableStudents.map((s) => ({ id: s.id, name: s.name }))
        );

        setStudents(availableStudents);

        // Remove any selected students that are already enrolled
        setFormData((prev) => ({
          ...prev,
          studentIds: prev.studentIds.filter((id) => !enrolledIds.has(id)),
        }));
      }
    } catch (error) {
      console.error("Load enrolled students error:", error);
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

    // Validate form data
    const validation = enrollmentFormSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const result = await bulkCreateEnrollmentsAction(
        validation.data.studentIds,
        validation.data.classId,
        validation.data.academicYear
      );

      if (result.success && "summary" in result && result.summary) {
        const { successful, failed, total } = result.summary;
        if (failed === 0) {
          setSuccessMessage(
            `Successfully enrolled ${successful} student${
              successful > 1 ? "s" : ""
            }`
          );
        } else {
          setSuccessMessage(
            `Enrolled ${successful} of ${total} students. ${failed} failed.`
          );
        }
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
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

  const toggleStudent = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  const toggleAll = () => {
    const filteredStudents = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (formData.studentIds.length === filteredStudents.length) {
      setFormData((prev) => ({ ...prev, studentIds: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        studentIds: filteredStudents.map((s) => s.id),
      }));
    }
  };

  const selectedClass = classes.find((c) => c.id === formData.classId);
  const isClassFull =
    selectedClass &&
    selectedClass.capacity &&
    selectedClass._count.enrollments >= selectedClass.capacity;

  // Calculate available seats
  const availableSeats = selectedClass?.capacity
    ? selectedClass.capacity - selectedClass._count.enrollments
    : null;

  // Check if selection exceeds available seats
  const exceedsCapacity =
    availableSeats !== null && formData.studentIds.length > availableSeats;

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

      {/* Class selection */}
      <div className="space-y-2">
        <Label htmlFor="classId">Class Cohort</Label>
        <Select
          value={formData.classId}
          onValueChange={(value) => handleChange("classId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class cohort" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} ({cls.level} - Grade {cls.grade})
                {cls.capacity &&
                  ` - ${cls._count.enrollments}/${cls.capacity} students`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {classes.length === 0 && (
          <p className="text-xs text-destructive">
            No class cohorts available. Create class cohorts first.
          </p>
        )}
        {isClassFull && (
          <p className="text-xs text-destructive">
            This class is at full capacity
          </p>
        )}
      </div>

      {/* Academic year */}
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

      {/* Student selection - only show after academic year is entered */}
      {formData.academicYear ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Select Students</Label>
            <div className="flex gap-2">
              {enrolledStudentIds.size > 0 && (
                <Badge variant="outline" className="text-xs">
                  {enrolledStudentIds.size} already enrolled
                </Badge>
              )}
              {availableSeats !== null && (
                <Badge variant="outline" className="text-xs">
                  {availableSeats} seats available
                </Badge>
              )}
              <Badge variant="secondary">
                {formData.studentIds.length} selected
              </Badge>
            </div>
          </div>

          {/* Capacity warning */}
          {exceedsCapacity && (
            <Alert variant="destructive">
              <AlertDescription>
                You have selected {formData.studentIds.length} students, but
                only {availableSeats} seats are available in this class. Please
                reduce your selection.
              </AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="space-y-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {students.length > 10 && (
              <p className="text-xs text-muted-foreground">
                Tip: Use search to quickly find students from {students.length}{" "}
                available
              </p>
            )}
          </div>

          {students.length === 0 ? (
            <Alert>
              <AlertDescription>
                {allStudents.length === 0
                  ? "No students available. Create student accounts first."
                  : "All students are already enrolled in a class for the selected academic year."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <Checkbox
                  id="select-all"
                  checked={
                    formData.studentIds.length > 0 &&
                    formData.studentIds.length ===
                      students.filter(
                        (s) =>
                          s.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          s.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ).length
                  }
                  onCheckedChange={toggleAll}
                  disabled={isLoading}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All (
                  {
                    students.filter(
                      (s) =>
                        s.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        s.email
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    ).length
                  }{" "}
                  {searchQuery ? "matching" : "available"})
                </label>
              </div>

              {/* Student list */}
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {students.filter(
                  (student) =>
                    student.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    student.email
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No students found matching "{searchQuery}"
                  </div>
                ) : (
                  students
                    .filter(
                      (student) =>
                        student.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        student.email
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2 p-3 hover:bg-muted border-b last:border-b-0"
                      >
                        <Checkbox
                          id={student.id}
                          checked={formData.studentIds.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={student.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="text-sm font-medium">
                            {student.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.email}
                          </div>
                        </label>
                      </div>
                    ))
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            Please enter an academic year first to see available students.
          </AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={
            isLoading ||
            classes.length === 0 ||
            students.length === 0 ||
            formData.studentIds.length === 0 ||
            !!isClassFull ||
            !!exceedsCapacity
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling {formData.studentIds.length} student(s)...
            </>
          ) : (
            `Enroll ${formData.studentIds.length} Student${
              formData.studentIds.length !== 1 ? "s" : ""
            }`
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
