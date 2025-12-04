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
import { ScheduleForm } from "@/components/admin/schedule-form";
import {
  listSchedulesAction,
  deleteScheduleAction,
} from "@/app/actions/schedules";
import { listClassCohortsAction } from "@/app/actions/class-cohorts";
import { Loader2, Plus, Edit, Trash2, Calendar } from "lucide-react";

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

interface Schedule {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string | null;
  class: {
    id: string;
    name: string;
    level: string;
    grade: number;
  };
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

interface ClassCohort {
  id: string;
  name: string;
  level: string;
  grade: number;
}

export function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<DayOfWeek | "ALL">("ALL");

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Load schedules and classes
  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load classes for filter
      const classesResult = await listClassCohortsAction();
      if (classesResult.success) {
        setClasses(classesResult.classes as ClassCohort[]);
      }

      // Load schedules with filters
      const filters: any = {};
      if (classFilter !== "ALL") {
        filters.classId = classFilter;
      }
      if (dayFilter !== "ALL") {
        filters.dayOfWeek = dayFilter;
      }

      const result = await listSchedulesAction(filters);

      if (result.success) {
        setSchedules(result.schedules as Schedule[]);
      } else {
        setError(result.error || "Failed to load schedules");
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
  }, [classFilter, dayFilter]);

  const handleDelete = async () => {
    if (!deletingSchedule) return;

    setIsDeleting(true);
    try {
      const result = await deleteScheduleAction(deletingSchedule.id);

      if (result.success) {
        await loadData();
        setDeletingSchedule(null);
      } else {
        setError(result.error || "Failed to delete schedule");
        setDeletingSchedule(null);
      }
    } catch (err) {
      console.error("Delete schedule error:", err);
      setError("An error occurred while deleting schedule");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDayLabel = (day: DayOfWeek) => {
    const labels = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };
    return labels[day];
  };

  const getDayBadgeVariant = (day: DayOfWeek) => {
    const variants: Record<
      DayOfWeek,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      MONDAY: "default",
      TUESDAY: "secondary",
      WEDNESDAY: "outline",
      THURSDAY: "default",
      FRIDAY: "secondary",
      SATURDAY: "outline",
      SUNDAY: "destructive",
    };
    return variants[day];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedules</h2>
          <p className="text-muted-foreground">
            Manage when teachers teach subjects to class cohorts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
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
          value={dayFilter}
          onValueChange={(value) => setDayFilter(value as DayOfWeek | "ALL")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Days</SelectItem>
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

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Schedules table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No schedules found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <Badge variant={getDayBadgeVariant(schedule.dayOfWeek)}>
                      {getDayLabel(schedule.dayOfWeek)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {schedule.startTime} - {schedule.endTime}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{schedule.class.name}</div>
                      <div className="text-muted-foreground">
                        {schedule.class.level} - Grade {schedule.class.grade}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{schedule.subject.name}</div>
                      {schedule.subject.code && (
                        <div className="text-muted-foreground">
                          {schedule.subject.code}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{schedule.teacher.name}</div>
                      <div className="text-muted-foreground">
                        {schedule.teacher.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.room ? (
                      <span className="text-sm">{schedule.room}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not specified
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSchedule(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingSchedule(schedule)}
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

      {/* Create schedule dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
            <DialogDescription>
              Define when a teacher teaches a subject to a class cohort
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            onSuccess={() => {
              setShowCreateDialog(false);
              loadData();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit schedule dialog */}
      <Dialog
        open={!!editingSchedule}
        onOpenChange={() => setEditingSchedule(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>Update schedule information</DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <ScheduleForm
              schedule={editingSchedule}
              onSuccess={() => {
                setEditingSchedule(null);
                loadData();
              }}
              onCancel={() => setEditingSchedule(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingSchedule}
        onOpenChange={() => setDeletingSchedule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot
              be undone.
              {deletingSchedule && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <div className="font-medium">
                    {getDayLabel(deletingSchedule.dayOfWeek)}{" "}
                    {deletingSchedule.startTime} - {deletingSchedule.endTime}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {deletingSchedule.teacher.name} teaching{" "}
                    {deletingSchedule.subject.name} to{" "}
                    {deletingSchedule.class.name}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingSchedule(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
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
