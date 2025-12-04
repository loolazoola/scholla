"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  createSubjectAction,
  updateSubjectAction,
} from "@/app/actions/subjects";

// Form validation schema
const subjectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Subject name is required")
    .max(100, "Name is too long"),
  code: z.string().max(20, "Code is too long").optional().nullable(),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .nullable(),
});

type SubjectFormData = z.infer<typeof subjectFormSchema>;

interface SubjectFormProps {
  subject?: {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SubjectForm({
  subject,
  onSuccess,
  onCancel,
}: SubjectFormProps) {
  const isEditMode = !!subject;

  const [formData, setFormData] = useState<SubjectFormData>({
    name: subject?.name || "",
    code: subject?.code || "",
    description: subject?.description || "",
  });

  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      code: formData.code || null,
      description: formData.description || null,
    };

    // Validate form data
    const validation = subjectFormSchema.safeParse(submitData);
    if (!validation.success) {
      setErrors(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (isEditMode) {
        result = await updateSubjectAction(subject.id, validation.data);
      } else {
        result = await createSubjectAction(validation.data);
      }

      if (result.success) {
        setSuccessMessage(
          isEditMode
            ? "Subject updated successfully"
            : "Subject created successfully"
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

      {/* Subject name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Subject Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g., Matematika, Biologi, Bahasa Indonesia"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Enter the full name of the subject
        </p>
      </div>

      {/* Subject code field */}
      <div className="space-y-2">
        <Label htmlFor="code">Subject Code (Optional)</Label>
        <Input
          id="code"
          name="code"
          type="text"
          placeholder="e.g., MAT, BIO, BIND"
          value={formData.code || ""}
          onChange={(e) => handleChange("code", e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Short code for the subject (e.g., MAT for Matematika)
        </p>
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description of the subject..."
          value={formData.description || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleChange("description", e.target.value)
          }
          disabled={isLoading}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Optional description of what this subject covers
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update Subject"
          ) : (
            "Create Subject"
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
