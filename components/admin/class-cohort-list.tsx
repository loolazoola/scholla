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
import { Input } from "@/components/ui/input";
import { ClassCohortForm } from "@/components/admin/class-cohort-form";
import {
  listClassCohortsAction,
  deleteClassCohortAction,
} from "@/app/actions/class-cohorts";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type SchoolLevel = "SD" | "SMP" | "SMA" | "SMK";

interface ClassCohort {
  id: string;
  name: string;
  level: SchoolLevel;
  grade: number;
  academicYear: string;
  capacity: number | null;
  homeroomTeacher: {
    id: string;
    name: string;
    email: string;
  } | null;
  gradingPolicy: {
    id: string;
    name: string;
  };
  _count: {
    enrollments: number;
  };
}

export function ClassCohortList() {
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [levelFilter, setLevelFilter] = useState<SchoolLevel | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassCohort | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassCohort | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load class cohorts
  const loadClasses = async () => {
    setIsLoading(true);
    setError("");

    try {
      const filters: any = {};
      if (levelFilter !== "ALL") {
        filters.level = levelFilter;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const result = await listClassCohortsAction(filters);

      if (result.success) {
        setClasses(result.classes as ClassCohort[]);
      } else {
        setError(result.error || "Failed to load class cohorts");
      }
    } catch (err) {
      console.error("Load classes error:", err);
      setError("An error occurred while loading class cohorts");
    } finally {
      setIsLoading(false);
    }
  };

  // Load classes on mount and when filters change
  useEffect(() => {
    loadClasses();
  }, [levelFilter, searchQuery]);

  const handleDelete = async () => {
    if (!deletingClass) return;

    setIsDeleting(true);
    try {
      const result = await deleteClassCohortAction(deletingClass.id);

      if (result.success) {
        await loadClasses();
        setDeletingClass(null);
      } else {
        setError(result.error || "Failed to delete class cohort");
        setDeletingClass(null);
      }
    } catch (err) {
      console.error("Delete class error:", err);
      setError("An error occurred while deleting class cohort");
    } finally {
      setIsDeleting(false);
    }
  };

  const getLevelBadgeVariant = (level: SchoolLevel) => {
    switch (level) {
      case "SD":
        return "default";
      case "SMP":
        return "secondary";
      case "SMA":
        return "outline";
      case "SMK":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getLevelLabel = (level: SchoolLevel) => {
    const labels = {
      SD: "SD (Elementary)",
      SMP: "SMP (Junior High)",
      SMA: "SMA (Senior High)",
      SMK: "SMK (Vocational)",
    };
    return labels[level];
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Class Cohorts</h2>
            <p className="text-muted-foreground">
              Manage fixed student groups (e.g., X-A, XII IPA 1)
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Class Cohort
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by class name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={levelFilter}
            onValueChange={(value) =>
              setLevelFilter(value as SchoolLevel | "ALL")
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="SD">SD (Elementary)</SelectItem>
              <SelectItem value="SMP">SMP (Junior High)</SelectItem>
              <SelectItem value="SMA">SMA (Senior High)</SelectItem>
              <SelectItem value="SMK">SMK (Vocational)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Classes table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Homeroom Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Grading Policy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No class cohorts found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classCohort) => (
                  <TableRow key={classCohort.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/class-cohorts/${classCohort.id}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {classCohort.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLevelBadgeVariant(classCohort.level)}>
                        {classCohort.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{classCohort.grade}</TableCell>
                    <TableCell>{classCohort.academicYear}</TableCell>
                    <TableCell>
                      {classCohort.homeroomTeacher ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {classCohort.homeroomTeacher.name}
                          </div>
                          <div className="text-muted-foreground">
                            {classCohort.homeroomTeacher.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {classCohort.capacity ? (
                        (() => {
                          const enrolled = classCohort._count.enrollments;
                          const capacity = classCohort.capacity;
                          const percentage = (enrolled / capacity) * 100;
                          const isFull = enrolled >= capacity;
                          const isNearFull = percentage >= 90 && !isFull;

                          return (
                            <Badge
                              variant={
                                isFull
                                  ? "destructive"
                                  : isNearFull
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {enrolled} / {capacity}
                              {isFull && " (Full)"}
                              {isNearFull && " (Near Full)"}
                            </Badge>
                          );
                        })()
                      ) : (
                        <Badge variant="outline">
                          {classCohort._count.enrollments}
                        </Badge>
                      )}
                    </TableCell>{" "}
                    <TableCell>
                      <span className="text-sm">
                        {classCohort.gradingPolicy.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingClass(classCohort)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit class cohort</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingClass(classCohort)}
                                disabled={classCohort._count.enrollments > 0}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {classCohort._count.enrollments > 0 ? (
                              <p>
                                Cannot delete: {classCohort._count.enrollments}{" "}
                                student
                                {classCohort._count.enrollments !== 1
                                  ? "s"
                                  : ""}{" "}
                                enrolled
                              </p>
                            ) : (
                              <p>Delete class cohort</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create class dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Class Cohort</DialogTitle>
              <DialogDescription>
                Create a new fixed student group (e.g., X-A, XII IPA 1)
              </DialogDescription>
            </DialogHeader>
            <ClassCohortForm
              onSuccess={() => {
                setShowCreateDialog(false);
                loadClasses();
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit class dialog */}
        <Dialog
          open={!!editingClass}
          onOpenChange={() => setEditingClass(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Class Cohort</DialogTitle>
              <DialogDescription>
                Update class cohort information
              </DialogDescription>
            </DialogHeader>
            {editingClass && (
              <ClassCohortForm
                classCohort={editingClass}
                onSuccess={() => {
                  setEditingClass(null);
                  loadClasses();
                }}
                onCancel={() => setEditingClass(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog
          open={!!deletingClass}
          onOpenChange={() => setDeletingClass(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Class Cohort</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingClass?.name}"? This
                action cannot be undone.
                {deletingClass && deletingClass._count.enrollments > 0 && (
                  <span className="block mt-2 text-destructive">
                    This class has {deletingClass._count.enrollments} enrolled
                    students and cannot be deleted.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingClass(null)}
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
    </TooltipProvider>
  );
}
