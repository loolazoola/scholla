import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

// Schedule schemas
export const createScheduleSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM (e.g., 08:00)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM (e.g., 09:30)"),
  room: z.string().max(50).optional().nullable(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

/**
 * Check for time conflicts
 */
async function checkTimeConflict(
  classId: string,
  teacherId: string,
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<{ hasConflict: boolean; conflictType?: string }> {
  const where: any = {
    dayOfWeek,
    OR: [
      { classId },
      { teacherId },
    ],
  };

  if (excludeScheduleId) {
    where.id = { not: excludeScheduleId };
  }

  const existingSchedules = await prisma.schedule.findMany({
    where,
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true } },
      teacher: { select: { name: true } },
    },
  });

  for (const schedule of existingSchedules) {
    // Check if times overlap
    const existingStart = schedule.startTime;
    const existingEnd = schedule.endTime;

    const hasOverlap =
      (startTime >= existingStart && startTime < existingEnd) ||
      (endTime > existingStart && endTime <= existingEnd) ||
      (startTime <= existingStart && endTime >= existingEnd);

    if (hasOverlap) {
      if (schedule.classId === classId) {
        return {
          hasConflict: true,
          conflictType: `Class ${schedule.class.name} already has ${schedule.subject.name} at this time`,
        };
      }
      if (schedule.teacherId === teacherId) {
        return {
          hasConflict: true,
          conflictType: `Teacher ${schedule.teacher.name} is already teaching ${schedule.subject.name} to ${schedule.class.name} at this time`,
        };
      }
    }
  }

  return { hasConflict: false };
}

export async function createSchedule(input: CreateScheduleInput) {
  const validation = createScheduleSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      schedule: null,
    };
  }

  try {
    // Validate time order
    if (validation.data.startTime >= validation.data.endTime) {
      return {
        success: false,
        error: "Start time must be before end time",
        schedule: null,
      };
    }

    // Check for conflicts
    const conflict = await checkTimeConflict(
      validation.data.classId,
      validation.data.teacherId,
      validation.data.dayOfWeek,
      validation.data.startTime,
      validation.data.endTime
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        error: conflict.conflictType || "Schedule conflict detected",
        schedule: null,
      };
    }

    // Prepare data
    const data: any = {
      classId: validation.data.classId,
      subjectId: validation.data.subjectId,
      teacherId: validation.data.teacherId,
      dayOfWeek: validation.data.dayOfWeek,
      startTime: validation.data.startTime,
      endTime: validation.data.endTime,
    };

    if (validation.data.room) {
      data.room = validation.data.room;
    }

    const schedule = await prisma.schedule.create({
      data,
      include: {
        class: { select: { id: true, name: true, level: true, grade: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    return { success: true, error: null, schedule };
  } catch (error) {
    console.error("Create schedule error:", error);
    return {
      success: false,
      error: "An error occurred while creating the schedule",
      schedule: null,
    };
  }
}

export async function listSchedules(filters?: {
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  dayOfWeek?: DayOfWeek;
}) {
  try {
    const where: any = {};

    if (filters?.classId) where.classId = filters.classId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.subjectId) where.subjectId = filters.subjectId;
    if (filters?.dayOfWeek) where.dayOfWeek = filters.dayOfWeek;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, level: true, grade: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return { success: true, error: null, schedules };
  } catch (error) {
    console.error("List schedules error:", error);
    return {
      success: false,
      error: "An error occurred while fetching schedules",
      schedules: [],
    };
  }
}

export async function getScheduleById(id: string) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, level: true, grade: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    return { success: true, error: null, schedule };
  } catch (error) {
    console.error("Get schedule error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the schedule",
      schedule: null,
    };
  }
}

export async function updateSchedule(id: string, input: UpdateScheduleInput) {
  const validation = updateScheduleSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      schedule: null,
    };
  }

  try {
    // Get existing schedule
    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        error: "Schedule not found",
        schedule: null,
      };
    }

    // Validate time order if both times are provided
    const startTime = validation.data.startTime || existing.startTime;
    const endTime = validation.data.endTime || existing.endTime;

    if (startTime >= endTime) {
      return {
        success: false,
        error: "Start time must be before end time",
        schedule: null,
      };
    }

    // Check for conflicts if relevant fields are being updated
    if (
      validation.data.classId ||
      validation.data.teacherId ||
      validation.data.dayOfWeek ||
      validation.data.startTime ||
      validation.data.endTime
    ) {
      const conflict = await checkTimeConflict(
        validation.data.classId || existing.classId,
        validation.data.teacherId || existing.teacherId,
        (validation.data.dayOfWeek || existing.dayOfWeek) as DayOfWeek,
        startTime,
        endTime,
        id
      );

      if (conflict.hasConflict) {
        return {
          success: false,
          error: conflict.conflictType || "Schedule conflict detected",
          schedule: null,
        };
      }
    }

    // Prepare update data
    const data: any = {};
    if (validation.data.classId !== undefined) data.classId = validation.data.classId;
    if (validation.data.subjectId !== undefined) data.subjectId = validation.data.subjectId;
    if (validation.data.teacherId !== undefined) data.teacherId = validation.data.teacherId;
    if (validation.data.dayOfWeek !== undefined) data.dayOfWeek = validation.data.dayOfWeek;
    if (validation.data.startTime !== undefined) data.startTime = validation.data.startTime;
    if (validation.data.endTime !== undefined) data.endTime = validation.data.endTime;
    if (validation.data.room !== undefined) data.room = validation.data.room || null;

    const schedule = await prisma.schedule.update({
      where: { id },
      data,
      include: {
        class: { select: { id: true, name: true, level: true, grade: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    return { success: true, error: null, schedule };
  } catch (error) {
    console.error("Update schedule error:", error);
    return {
      success: false,
      error: "An error occurred while updating the schedule",
      schedule: null,
    };
  }
}

export async function deleteSchedule(id: string) {
  try {
    await prisma.schedule.delete({
      where: { id },
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete schedule error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the schedule",
    };
  }
}
