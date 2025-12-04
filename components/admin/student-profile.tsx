"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  User,
} from "lucide-react";
import { getUserByIdAction } from "@/app/actions/users";
import { listEnrollmentsAction } from "@/app/actions/enrollments";
import Link from "next/link";

interface StudentProfileProps {
  studentId: string;
}

export function StudentProfile({ studentId }: StudentProfileProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load student details
      const studentResult = await getUserByIdAction(studentId);
      if (!studentResult.success || !studentResult.user) {
        setError(studentResult.error || "Student not found");
        setIsLoading(false);
        return;
      }

      if (studentResult.user.role !== "STUDENT") {
        setError("User is not a student");
        setIsLoading(false);
        return;
      }

      setStudent(studentResult.user);

      // Load student's enrollments
      const enrollmentsResult = await listEnrollmentsAction({
        studentId: studentId,
      });
      if (enrollmentsResult.success) {
        setEnrollments(enrollmentsResult.enrollments);
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError("An error occurred while loading student profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || "Student not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {student.name}
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {student.email}
            </p>
          </div>
        </div>
        <Badge variant={student.active ? "default" : "secondary"}>
          {student.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Student Information Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Role Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.role}</div>
          </CardContent>
        </Card>

        {/* Total Enrollments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {enrollments.filter((e) => e.status === "ACTIVE").length} active
            </p>
          </CardContent>
        </Card>

        {/* Account Created Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Created
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(student.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment History */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment History</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No enrollment history found.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Cohort</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment: any) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/class-cohorts/${enrollment.class.id}`}
                          className="text-primary hover:underline"
                        >
                          {enrollment.class.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {enrollment.class.level} - Grade{" "}
                          {enrollment.class.grade}
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.academicYear}</TableCell>
                      <TableCell>
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enrollment.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {enrollment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
