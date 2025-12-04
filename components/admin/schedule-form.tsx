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
  createScheduleAction,
  updateScheduleAction,
} from "@/app/actions/schedules";
import { listClassCohortsAction } from "@/app/actions/class-cohorts";
import { listSubjectsAction } from "@/app/actions/subjects";
import { listUsersAction } from "@/app/actions/users";

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

// Form validation schema
const scheduleFormSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  room: z.string().max(50).optional().nullable(),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  schedule?: {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string | null;
    class: { id: string; name: string };
    subject: { id: string; name: string };
    teacher: { id: string; name: string };
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ScheduleForm({
  schedule,
  onSuccess,
  onCancel,
}: ScheduleFormProps) {
  const isEditMode = !!schedule;

  const [formData, setFormData] = useState<ScheduleFormData>({
    classId: schedule?.class.id || "",
    subjectId: schedule?.subject.id || "",
    teacherId: schedule?.teacher.id || "",
    dayOfWeek: schedule?.dayOfWeek || "MONDAY",
    startTime: schedule?.startTime || "",
    endTime: schedule?.endTime || "",
    room: schedule?.room || "",
  });

  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load options
  const [classes, setClasses] = useState<
    Array<{ id: string; name: string; level: string; grade: number }>
  >([]);
  const [subjects, setSubjects] = useState<
    Array<{ id: string; name: string; code: string | null }>
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
      // Load classes
      const classesResult = await listClassCohortsAction();
      if (classesResult.success) {
        setClasses(classesResult.classes);
      }

      // Load subjects
      const subjectsResult = await listSubjectsAction();
      if (subjectsResult.success) {
        setSubjects(subjectsResult.subjects);
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
      room: formData.room || null,
    };

    // Validate form data
    const validation = scheduleFormSchema.safeParse(submitData);
    if (!validation.success) {
      setErrors(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (isEditMode) {
        result = await updateScheduleAction(schedule.id, validation.data);
      } else {
        result = await createScheduleAction(validation.data);
      }

      if (result.success) {
        setSuccessMessage(
          isEditMode
            ? "Schedule updated successfully"
            : "Schedule created successfully"
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
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject selection */}
      <div className="space-y-2">
        <Label htmlFor="subjectId">Subject</Label>
        <Select
          value={formData.subjectId}
          onValueChange={(value) => handleChange("subjectId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name} {subject.code && `(${subject.code})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teacher selection */}
      <div className="space-y-2">
        <Label htmlFor="teacherId">Teacher</Label>
        <Select
          value={formData.teacherId}
          onValueChange={(value) => handleChange("teacherId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day of week */}
      <div className="space-y-2">
        <Label htmlFor="dayOfWeek">Day of Week</Label>
        <Select
          value={formData.dayOfWeek}
          onValueChange={(value) => handleChange("dayOfWeek", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONDAY">Monday</SelectItem>
            <SelectItem value="TUESDAY">Tuesday</SelectItem>
            <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
            <SelectItem value="THURSDAY">Thursday</SelectItem>
            <SelectItem value="FRIDAY">Friday</SelectItem>
            <SelectItem value="SATURDAY">Saturday</SelectItem>
            <SelectItem value="SUNDAY">Sunday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Format: HH:MM (e.g., 08:00)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Format: HH:MM (e.g., 09:30)
          </p>
        </div>
      </div>

      {/* Room field */}
      <div className="space-y-2">
        <Label htmlFor="room">Room (Optional)</Label>
        <Input
          id="room"
          name="room"
          type="text"
          placeholder="e.g., Lab Biologi, Ruang 3A"
          value={formData.room || ""}
          onChange={(e) => handleChange("room", e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Optional room or location for this class
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={
            isLoading ||
            classes.length === 0 ||
            subjects.length === 0 ||
            teachers.length === 0
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update Schedule"
          ) : (
            "Create Schedule"
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

      {/* Warnings */}
      {(classes.length === 0 ||
        subjects.length === 0 ||
        teachers.length === 0) && (
        <Alert>
          <AlertDescription>
            {classes.length === 0 && (
              <div>
                • No class cohorts available. Create class cohorts first.
              </div>
            )}
            {subjects.length === 0 && (
              <div>• No subjects available. Create subjects first.</div>
            )}
            {teachers.length === 0 && (
              <div>• No teachers available. Create teacher accounts first.</div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
