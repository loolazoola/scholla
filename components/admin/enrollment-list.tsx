"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnrollmentForm } from "@/components/admin/enrollment-form";
import { BulkEnrollmentCopy } from "@/components/admin/bulk-enrollment-copy";
import {
  listEnrollmentsAction,
  withdrawEnrollmentAction,
  deleteEnrollmentAction,
} from "@/app/actions/enrollments";
import { listClassCohortsAction } from "@/app/actions/class-cohorts";
import {
  Loader2,
  Plus,
  UserMinus,
  Trash2,
  Copy,
  ArrowRightLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EnrollmentStatus = "ACTIVE" | "WITHDRAWN";

interface Enrollment {
  id: string;
  enrolledAt: Date;
  status: EnrollmentStatus;
  academicYear: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
    level: string;
    grade: number;
    academicYear: string;
  };
}

interface ClassCohort {
  id: string;
  name: string;
  level: string;
  grade: number;
}

export function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">(
    "ALL"
  );

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [withdrawingEnrollment, setWithdrawingEnrollment] =
    useState<Enrollment | null>(null);
  const [deletingEnrollment, setDeletingEnrollment] =
    useState<Enrollment | null>(null);
  const [transferringEnrollment, setTransferringEnrollment] =
    useState<Enrollment | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load classes for filter
      const classesResult = await listClassCohortsAction();
      if (classesResult.success) {
        setClasses(classesResult.classes as ClassCohort[]);
      }

      // Load enrollments with filters
      const filters: any = {};
      if (classFilter !== "ALL") {
        filters.classId = classFilter;
      }
      if (statusFilter !== "ALL") {
        filters.status = statusFilter;
      }

      const result = await listEnrollmentsAction(filters);

      if (result.success) {
        setEnrollments(result.enrollments as Enrollment[]);
      } else {
        setError(result.error || "Failed to load enrollments");
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError("An error occurred while loading data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [classFilter, statusFilter]);

  const handleWithdraw = async () => {
    if (!withdrawingEnrollment) return;

    setIsProcessing(true);
    try {
      const result = await withdrawEnrollmentAction(withdrawingEnrollment.id);

      if (result.success) {
        await loadData();
        setWithdrawingEnrollment(null);
      } else {
        setError(result.error || "Failed to withdraw enrollment");
        setWithdrawingEnrollment(null);
      }
    } catch (err) {
      console.error("Withdraw enrollment error:", err);
      setError("An error occurred while withdrawing enrollment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEnrollment) return;

    setIsProcessing(true);
    try {
      const result = await deleteEnrollmentAction(deletingEnrollment.id);

      if (result.success) {
        await loadData();
        setDeletingEnrollment(null);
      } else {
        setError(result.error || "Failed to delete enrollment");
        setDeletingEnrollment(null);
      }
    } catch (err) {
      console.error("Delete enrollment error:", err);
      setError("An error occurred while deleting enrollment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferringEnrollment || !targetClassId) return;

    setIsProcessing(true);
    try {
      // First delete the old enrollment
      const deleteResult = await deleteEnrollmentAction(
        transferringEnrollment.id
      );

      if (!deleteResult.success) {
        setError(deleteResult.error || "Failed to remove old enrollment");
        setIsProcessing(false);
        return;
      }

      // Then create new enrollment in target class
      const { bulkCreateEnrollmentsAction } = await import(
        "@/app/actions/enrollments"
      );
      const createResult = await bulkCreateEnrollmentsAction(
        [transferringEnrollment.student.id],
        targetClassId,
        transferringEnrollment.academicYear
      );

      if (createResult.success) {
        await loadData();
        setTransferringEnrollment(null);
        setTargetClassId("");
      } else {
        setError(createResult.error || "Failed to create new enrollment");
        setTransferringEnrollment(null);
        setTargetClassId("");
      }
    } catch (err) {
      console.error("Transfer enrollment error:", err);
      setError("An error occurred while transferring enrollment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enrollments</h2>
          <p className="text-muted-foreground">
            Manage student enrollments in class cohorts
          </p>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Enrollment List</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Enroll button */}
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Enroll Students
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level} - Grade {cls.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as EnrollmentStatus | "ALL")
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Enrollments table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class Cohort</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No enrollments found. Enroll students to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {enrollment.student.name}
                          </div>
                          <div className="text-muted-foreground">
                            {enrollment.student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {enrollment.class.name}
                          </div>
                          <div className="text-muted-foreground">
                            {enrollment.class.level} - Grade{" "}
                            {enrollment.class.grade}
                          </div>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {enrollment.status === "ACTIVE" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setTransferringEnrollment(enrollment)
                                }
                                title="Transfer to another class"
                              >
                                <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setWithdrawingEnrollment(enrollment)
                                }
                                title="Withdraw enrollment"
                              >
                                <UserMinus className="h-4 w-4 text-orange-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingEnrollment(enrollment)}
                            title="Delete enrollment"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkEnrollmentCopy onSuccess={loadData} />
        </TabsContent>
      </Tabs>

      {/* Create enrollment dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>
              Assign a student to a class cohort
            </DialogDescription>
          </DialogHeader>
          <EnrollmentForm
            onSuccess={() => {
              setShowCreateDialog(false);
              loadData();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Withdraw confirmation dialog */}
      <Dialog
        open={!!withdrawingEnrollment}
        onOpenChange={() => setWithdrawingEnrollment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this enrollment?
            </DialogDescription>
          </DialogHeader>
          {withdrawingEnrollment && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <div className="font-medium">
                {withdrawingEnrollment.student.name}
              </div>
              <div className="text-muted-foreground mt-1">
                from {withdrawingEnrollment.class.name}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawingEnrollment(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer enrollment dialog */}
      <Dialog
        open={!!transferringEnrollment}
        onOpenChange={() => {
          setTransferringEnrollment(null);
          setTargetClassId("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student to Another Class</DialogTitle>
            <DialogDescription>
              Move this student to a different class cohort for the same
              academic year.
            </DialogDescription>
          </DialogHeader>
          {transferringEnrollment && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <div className="font-medium">
                {transferringEnrollment.student.name}
              </div>
              <div className="text-muted-foreground mt-1">
                Currently in: {transferringEnrollment.class.name}
              </div>
              <div className="text-muted-foreground">
                Academic Year: {transferringEnrollment.academicYear}
              </div>
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transfer to Class:</label>
              <Select value={targetClassId} onValueChange={setTargetClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter(
                      (cls) => cls.id !== transferringEnrollment?.class.id
                    )
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.level} - Grade {cls.grade})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                This will remove the student from their current class and enroll
                them in the selected class.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferringEnrollment(null);
                setTargetClassId("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isProcessing || !targetClassId}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transfer Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingEnrollment}
        onOpenChange={() => setDeletingEnrollment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enrollment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingEnrollment && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <div className="font-medium">
                {deletingEnrollment.student.name}
              </div>
              <div className="text-muted-foreground mt-1">
                from {deletingEnrollment.class.name}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingEnrollment(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
