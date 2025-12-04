"use server";

import { auth } from "@/lib/auth";
import {
  createSchedule,
  listSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from "@/lib/services/schedule-service";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

/**
 * Create a new schedule (Admin only)
 */
export async function createScheduleAction(input: CreateScheduleInput) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        schedule: null,
      };
    }

    // Only admins can create schedules
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create schedules",
        schedule: null,
      };
    }

    const result = await createSchedule(input);
    return result;
  } catch (error) {
    console.error("Create schedule action error:", error);
    return {
      success: false,
      error: "An error occurred while creating the schedule",
      schedule: null,
    };
  }
}

/**
 * List schedules with optional filters
 */
export async function listSchedulesAction(filters?: {
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  dayOfWeek?: DayOfWeek;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        schedules: [],
      };
    }

    const result = await listSchedules(filters);
    return result;
  } catch (error) {
    console.error("List schedules action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching schedules",
      schedules: [],
    };
  }
}

/**
 * Get schedule by ID
 */
export async function getScheduleByIdAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        schedule: null,
      };
    }

    const result = await getScheduleById(id);
    return result;
  } catch (error) {
    console.error("Get schedule action error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the schedule",
      schedule: null,
    };
  }
}

/**
 * Update schedule (Admin only)
 */
export async function updateScheduleAction(
  id: string,
  input: UpdateScheduleInput
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        schedule: null,
      };
    }

    // Only admins can update schedules
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update schedules",
        schedule: null,
      };
    }

    const result = await updateSchedule(id, input);
    return result;
  } catch (error) {
    console.error("Update schedule action error:", error);
    return {
      success: false,
      error: "An error occurred while updating the schedule",
      schedule: null,
    };
  }
}

/**
 * Delete schedule (Admin only)
 */
export async function deleteScheduleAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can delete schedules
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete schedules",
      };
    }

    const result = await deleteSchedule(id);
    return result;
  } catch (error) {
    console.error("Delete schedule action error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the schedule",
    };
  }
}
