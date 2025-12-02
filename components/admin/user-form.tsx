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
import { createUserAction, updateUserAction } from "@/app/actions/users";

// Form validation schema
const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    )
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || "",
    password: "",
    name: user?.name || "",
    role: user?.role || "STUDENT",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    // For edit mode, password is optional
    const schemaToUse = isEditMode
      ? userFormSchema.partial({ password: true })
      : userFormSchema;

    // Validate form data
    const validation = schemaToUse.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof UserFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof UserFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (isEditMode) {
        // Update existing user
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
        };

        // Only include password if it was provided
        if (formData.password && formData.password.length > 0) {
          updateData.password = formData.password;
        }

        result = await updateUserAction(user.id, updateData);
      } else {
        // Create new user
        if (!formData.password) {
          setErrorMessage("Password is required for new users");
          setIsLoading(false);
          return;
        }

        result = await createUserAction({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });
      }

      if (result.success) {
        setSuccessMessage(
          isEditMode ? "User updated successfully" : "User created successfully"
        );
        // Reset form if creating new user
        if (!isEditMode) {
          setFormData({
            email: "",
            password: "",
            name: "",
            role: "STUDENT",
          });
        }
        // Call onSuccess callback
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1000);
        }
      } else {
        setErrorMessage(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage("An error occurred. Please try again.");
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
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password {isEditMode && "(leave blank to keep current)"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isEditMode ? "new-password" : "new-password"}
          required={!isEditMode}
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
        {!isEditMode && (
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, number, and
            special character
          </p>
        )}
      </div>

      {/* Role field */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            handleChange({ name: "role", value: value as UserFormData["role"] })
          }
          disabled={isLoading}
        >
          <SelectTrigger className={errors.role ? "border-destructive" : ""}>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role}</p>
        )}
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
            "Update User"
          ) : (
            "Create User"
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
