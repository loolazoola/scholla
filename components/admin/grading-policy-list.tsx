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
import { GradingPolicyForm } from "./grading-policy-form";
import {
  listGradingPoliciesAction,
  deleteGradingPolicyAction,
} from "@/app/actions/grading-policies";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";

interface GradingPolicy {
  id: string;
  name: string;
  type: "LETTER" | "NUMERIC" | "PERCENTAGE";
  scale: Array<{
    letter: string;
    minValue: number;
    maxValue: number;
    gpaValue: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    classes: number;
  };
}

export function GradingPolicyList() {
  const [policies, setPolicies] = useState<GradingPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<GradingPolicy | null>(
    null
  );
  const [deletingPolicy, setDeletingPolicy] = useState<GradingPolicy | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Load policies
  const loadPolicies = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await listGradingPoliciesAction();

      if (result.success) {
        setPolicies(result.policies as GradingPolicy[]);
      } else {
        setError(result.error || "Failed to load grading policies");
      }
    } catch (err) {
      console.error("Load policies error:", err);
      setError("An error occurred while loading grading policies");
    } finally {
      setIsLoading(false);
    }
  };

  // Load policies on mount
  useEffect(() => {
    loadPolicies();
  }, []);

  const handleDelete = async () => {
    if (!deletingPolicy) return;

    setIsDeleting(true);
    try {
      const result = await deleteGradingPolicyAction(deletingPolicy.id);

      if (result.success) {
        await loadPolicies();
        setDeletingPolicy(null);
      } else {
        setError(result.error || "Failed to delete grading policy");
        setDeletingPolicy(null);
      }
    } catch (err) {
      console.error("Delete policy error:", err);
      setError("An error occurred while deleting grading policy");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "LETTER":
        return "default";
      case "NUMERIC":
        return "secondary";
      case "PERCENTAGE":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Grading Policies
          </h2>
          <p className="text-muted-foreground">
            Manage grading scales and grade calculation policies
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Policies table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Grade Scale</TableHead>
              <TableHead>Classes Using</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No grading policies found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(policy.type)}>
                      {policy.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {policy.scale.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {item.letter} ({item.minValue}-{item.maxValue})
                        </span>
                      ))}
                      {policy.scale.length > 3 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{policy.scale.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {policy._count?.classes || 0} classes
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPolicy(policy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPolicy(policy)}
                        disabled={(policy._count?.classes || 0) > 0}
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

      {/* Create policy dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Grading Policy</DialogTitle>
            <DialogDescription>
              Define a new grading scale for calculating letter grades and GPA
              values.
            </DialogDescription>
          </DialogHeader>
          <GradingPolicyForm
            onSuccess={() => {
              setShowCreateDialog(false);
              loadPolicies();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit policy dialog */}
      <Dialog
        open={!!editingPolicy}
        onOpenChange={() => setEditingPolicy(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Grading Policy</DialogTitle>
            <DialogDescription>
              Update the grading scale and calculation settings.
            </DialogDescription>
          </DialogHeader>
          {editingPolicy && (
            <GradingPolicyForm
              policy={editingPolicy}
              onSuccess={() => {
                setEditingPolicy(null);
                loadPolicies();
              }}
              onCancel={() => setEditingPolicy(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingPolicy}
        onOpenChange={() => setDeletingPolicy(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Grading Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingPolicy?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingPolicy(null)}
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
