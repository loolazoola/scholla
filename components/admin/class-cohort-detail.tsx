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
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import { getClassCohortByIdAction } from "@/app/actions/class-cohorts";
import { listEnrollmentsAction } from "@/app/actions/enrollments";

type SortField = "name" | "email" | "enrolledAt" | "status";
type SortDirection = "asc" | "desc";

interface ClassCohortDetailProps {
  classId: string;
}

export function ClassCohortDetail({ classId }: ClassCohortDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [classData, setClassData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    loadData();
  }, [classId]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedEnrollments = () => {
    return [...enrollments].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.student.name.toLowerCase();
          bValue = b.student.name.toLowerCase();
          break;
        case "email":
          aValue = a.student.email.toLowerCase();
          bValue = b.student.email.toLowerCase();
          break;
        case "enrolledAt":
          aValue = new Date(a.enrolledAt).getTime();
          bValue = new Date(b.enrolledAt).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load class details
      const classResult = await getClassCohortByIdAction(classId);
      if (!classResult.success || !classResult.class) {
        setError(classResult.error || "Class not found");
        setIsLoading(false);
        return;
      }
      setClassData(classResult.class);

      // Load enrollments for this class
      const enrollmentsResult = await listEnrollmentsAction({
        classId: classId,
        status: "ACTIVE",
      });
      if (enrollmentsResult.success) {
        setEnrollments(enrollmentsResult.enrollments);
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError("An error occurred while loading class details");
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

  if (error || !classData) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || "Class not found"}</AlertDescription>
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
              {classData.name}
            </h2>
            <p className="text-muted-foreground">
              {classData.level} - Grade {classData.grade} •{" "}
              {classData.academicYear}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/enrollments?classId=${classId}`)}
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Manage Enrollments
          </Button>
          <Button onClick={() => router.push(`/admin/enrollments`)}>
            <Plus className="mr-2 h-4 w-4" />
            Enroll Students
          </Button>
        </div>
      </div>

      {/* Class Information Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Homeroom Teacher Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Homeroom Teacher
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {classData.homeroomTeacher ? (
              <div>
                <div className="text-2xl font-bold">
                  {classData.homeroomTeacher.name}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Mail className="mr-1 h-3 w-3" />
                  {classData.homeroomTeacher.email}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Not assigned</div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Count Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData._count.enrollments}
              {classData.capacity && (
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {classData.capacity}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {classData.capacity
                ? `${Math.round(
                    (classData._count.enrollments / classData.capacity) * 100
                  )}% capacity`
                : "No capacity limit"}
            </p>
          </CardContent>
        </Card>

        {/* Grading Policy Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grading Policy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.gradingPolicy.name}
            </div>
            {classData.gradingPolicy.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {classData.gradingPolicy.description}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students enrolled in this class yet.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="h-auto p-0 hover:bg-transparent font-medium"
                      >
                        Student Name
                        <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("email")}
                        className="h-auto p-0 hover:bg-transparent font-medium"
                      >
                        Email
                        <SortIcon field="email" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("enrolledAt")}
                        className="h-auto p-0 hover:bg-transparent font-medium"
                      >
                        Enrolled Date
                        <SortIcon field="enrolledAt" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("status")}
                        className="h-auto p-0 hover:bg-transparent font-medium"
                      >
                        Status
                        <SortIcon field="status" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedEnrollments().map((enrollment: any) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/students/${enrollment.student.id}`}
                          className="text-primary hover:underline"
                        >
                          {enrollment.student.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {enrollment.student.email}
                      </TableCell>
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
