"use client";

import { useState } from "react";
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
import { Loader2, Plus, Trash2, Copy } from "lucide-react";
import {
  createGradingPolicyAction,
  updateGradingPolicyAction,
} from "@/app/actions/grading-policies";

// Grade scale item schema
const gradeScaleItemSchema = z.object({
  letter: z.string().min(1, "Letter grade is required"),
  minValue: z.number().min(0).max(100),
  maxValue: z.number().min(0).max(100),
  gpaValue: z.number().min(0).max(4),
});

// Form validation schema
const gradingPolicyFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.enum(["LETTER", "NUMERIC", "PERCENTAGE"]),
  scale: z
    .array(gradeScaleItemSchema)
    .min(1, "At least one grade scale item is required"),
});

type GradingPolicyFormData = z.infer<typeof gradingPolicyFormSchema>;
type GradeScaleItem = z.infer<typeof gradeScaleItemSchema>;

interface GradingPolicyFormProps {
  policy?: {
    id: string;
    name: string;
    type: "LETTER" | "NUMERIC" | "PERCENTAGE";
    scale: GradeScaleItem[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Default templates
const TEMPLATES = {
  STANDARD: [
    { letter: "A", minValue: 90, maxValue: 100, gpaValue: 4.0 },
    { letter: "B", minValue: 80, maxValue: 89, gpaValue: 3.0 },
    { letter: "C", minValue: 70, maxValue: 79, gpaValue: 2.0 },
    { letter: "D", minValue: 60, maxValue: 69, gpaValue: 1.0 },
    { letter: "F", minValue: 0, maxValue: 59, gpaValue: 0.0 },
  ],
  PLUS_MINUS: [
    { letter: "A+", minValue: 97, maxValue: 100, gpaValue: 4.0 },
    { letter: "A", minValue: 93, maxValue: 96, gpaValue: 4.0 },
    { letter: "A-", minValue: 90, maxValue: 92, gpaValue: 3.7 },
    { letter: "B+", minValue: 87, maxValue: 89, gpaValue: 3.3 },
    { letter: "B", minValue: 83, maxValue: 86, gpaValue: 3.0 },
    { letter: "B-", minValue: 80, maxValue: 82, gpaValue: 2.7 },
    { letter: "C+", minValue: 77, maxValue: 79, gpaValue: 2.3 },
    { letter: "C", minValue: 73, maxValue: 76, gpaValue: 2.0 },
    { letter: "C-", minValue: 70, maxValue: 72, gpaValue: 1.7 },
    { letter: "D+", minValue: 67, maxValue: 69, gpaValue: 1.3 },
    { letter: "D", minValue: 63, maxValue: 66, gpaValue: 1.0 },
    { letter: "D-", minValue: 60, maxValue: 62, gpaValue: 0.7 },
    { letter: "F", minValue: 0, maxValue: 59, gpaValue: 0.0 },
  ],
  PASS_FAIL: [
    { letter: "Pass", minValue: 70, maxValue: 100, gpaValue: 4.0 },
    { letter: "Fail", minValue: 0, maxValue: 69, gpaValue: 0.0 },
  ],
};

export function GradingPolicyForm({
  policy,
  onSuccess,
  onCancel,
}: GradingPolicyFormProps) {
  const isEditMode = !!policy;

  const [formData, setFormData] = useState<GradingPolicyFormData>({
    name: policy?.name || "",
    type: policy?.type || "LETTER",
    scale: policy?.scale || TEMPLATES.STANDARD,
  });

  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors("");
    setSuccessMessage("");
  };

  const handleScaleItemChange = (
    index: number,
    field: keyof GradeScaleItem,
    value: string | number
  ) => {
    const newScale = [...formData.scale];
    newScale[index] = {
      ...newScale[index],
      [field]: field === "letter" ? value : Number(value),
    };
    setFormData((prev) => ({ ...prev, scale: newScale }));
    setErrors("");
  };

  const addScaleItem = () => {
    setFormData((prev) => ({
      ...prev,
      scale: [
        ...prev.scale,
        { letter: "", minValue: 0, maxValue: 100, gpaValue: 0 },
      ],
    }));
  };

  const removeScaleItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scale: prev.scale.filter((_, i) => i !== index),
    }));
  };

  const loadTemplate = (template: keyof typeof TEMPLATES) => {
    setFormData((prev) => ({
      ...prev,
      scale: TEMPLATES[template],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    setSuccessMessage("");

    // Validate form data
    const validation = gradingPolicyFormSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (isEditMode) {
        result = await updateGradingPolicyAction(policy.id, formData);
      } else {
        result = await createGradingPolicyAction(formData);
      }

      if (result.success) {
        setSuccessMessage(
          isEditMode
            ? "Grading policy updated successfully"
            : "Grading policy created successfully"
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

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Policy Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g., Standard Letter Grades"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Type field */}
      <div className="space-y-2">
        <Label htmlFor="type">Grading Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grading type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LETTER">Letter Grades (A, B, C...)</SelectItem>
            <SelectItem value="NUMERIC">Numeric (0-100)</SelectItem>
            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template selector */}
      {!isEditMode && (
        <div className="space-y-2">
          <Label>Load Template</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadTemplate("STANDARD")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Standard (A-F)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadTemplate("PLUS_MINUS")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Plus/Minus
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadTemplate("PASS_FAIL")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Pass/Fail
            </Button>
          </div>
        </div>
      )}

      {/* Grade scale editor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Grade Scale</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addScaleItem}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Grade
          </Button>
        </div>

        <div className="space-y-3 border rounded-lg p-4 max-h-96 overflow-y-auto">
          {formData.scale.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No grade scale items. Click "Add Grade" to create one.
            </p>
          ) : (
            formData.scale.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/50"
              >
                <div className="col-span-3">
                  <Label className="text-xs">Letter</Label>
                  <Input
                    type="text"
                    placeholder="A"
                    value={item.letter}
                    onChange={(e) =>
                      handleScaleItemChange(index, "letter", e.target.value)
                    }
                    disabled={isLoading}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Min %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.minValue}
                    onChange={(e) =>
                      handleScaleItemChange(index, "minValue", e.target.value)
                    }
                    disabled={isLoading}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Max %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.maxValue}
                    onChange={(e) =>
                      handleScaleItemChange(index, "maxValue", e.target.value)
                    }
                    disabled={isLoading}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">GPA</Label>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={item.gpaValue}
                    onChange={(e) =>
                      handleScaleItemChange(index, "gpaValue", e.target.value)
                    }
                    disabled={isLoading}
                    className="h-9"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScaleItem(index)}
                    disabled={isLoading || formData.scale.length === 1}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Define grade ranges from 0-100. Ranges should not overlap.
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
            "Update Policy"
          ) : (
            "Create Policy"
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
