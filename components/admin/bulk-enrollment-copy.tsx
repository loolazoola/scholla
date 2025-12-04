"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { copyEnrollmentsFromPreviousYearAction } from "@/app/actions/enrollments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Form validation schema
const copyEnrollmentSchema = z.object({
  fromAcademicYear: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY (e.g., 2024/2025)"),
  toAcademicYear: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY (e.g., 2024/2025)"),
});

type CopyEnrollmentFormData = z.infer<typeof copyEnrollmentSchema>;

interface BulkEnrollmentCopyProps {
  onSuccess?: () => void;
}

export function BulkEnrollmentCopy({ onSuccess }: BulkEnrollmentCopyProps) {
  const [formData, setFormData] = useState<CopyEnrollmentFormData>({
    fromAcademicYear: "",
    toAcademicYear: "",
  });

  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors("");
    setResults(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    setResults(null);

    // Validate form data
    const validation = copyEnrollmentSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    // Check that years are different
    if (validation.data.fromAcademicYear === validation.data.toAcademicYear) {
      setErrors("Source and target academic years must be different");
      setIsLoading(false);
      return;
    }

    try {
      const result = await copyEnrollmentsFromPreviousYearAction(
        validation.data.fromAcademicYear,
        validation.data.toAcademicYear
      );

      if (result.success) {
        setResults(result);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 3000);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Copy Enrollments from Previous Year
        </CardTitle>
        <CardDescription>
          Automatically enroll students from a previous academic year into the
          same classes for a new academic year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {errors && (
            <Alert variant="destructive">
              <AlertDescription>{errors}</AlertDescription>
            </Alert>
          )}

          {/* Results summary */}
          {results && results.summary && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Copy Complete</div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        {results.summary.successful} student(s) enrolled
                        successfully
                      </span>
                    </div>
                    {results.summary.failed > 0 && (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>
                          {results.summary.failed} enrollment(s) failed
                        </span>
                      </div>
                    )}
                    {results.summary.skipped > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span>
                          {results.summary.skipped} student(s) skipped
                          (inactive)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Results details */}
          {results && results.results && results.results.length > 0 && (
            <div className="border rounded-md max-h-64 overflow-y-auto">
              <div className="divide-y">
                {results.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium">{result.studentName}</div>
                      <div className="text-muted-foreground text-xs">
                        {result.className}
                      </div>
                    </div>
                    <div>
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : result.skipped ? (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* From academic year */}
            <div className="space-y-2">
              <Label htmlFor="fromAcademicYear">From Academic Year</Label>
              <Input
                id="fromAcademicYear"
                name="fromAcademicYear"
                type="text"
                required
                placeholder="2023/2024"
                value={formData.fromAcademicYear}
                onChange={(e) =>
                  handleChange("fromAcademicYear", e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            {/* To academic year */}
            <div className="space-y-2">
              <Label htmlFor="toAcademicYear">To Academic Year</Label>
              <Input
                id="toAcademicYear"
                name="toAcademicYear"
                type="text"
                required
                placeholder="2024/2025"
                value={formData.toAcademicYear}
                onChange={(e) => handleChange("toAcademicYear", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This will copy all active enrollments from the source year to the
            target year. Students will be enrolled in the same class cohorts.
            Inactive students will be skipped.
          </p>

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copying Enrollments...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Enrollments
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
