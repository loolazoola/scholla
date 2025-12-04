import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Subject schemas
export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  code: z.string().min(1).max(20).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export async function createSubject(input: CreateSubjectInput) {
  const validation = createSubjectSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      subject: null,
    };
  }

  try {
    // Check code uniqueness if provided
    if (input.code) {
      const existing = await prisma.subject.findUnique({
        where: { code: input.code },
      });
      if (existing) {
        return {
          success: false,
          error: "A subject with this code already exists",
          subject: null,
        };
      }
    }

    const subject = await prisma.subject.create({
      data: validation.data,
    });

    return { success: true, error: null, subject };
  } catch (error) {
    console.error("Create subject error:", error);
    return {
      success: false,
      error: "An error occurred while creating the subject",
      subject: null,
    };
  }
}

export async function listSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, error: null, subjects };
  } catch (error) {
    console.error("List subjects error:", error);
    return {
      success: false,
      error: "An error occurred while fetching subjects",
      subjects: [],
    };
  }
}

export async function getSubjectById(id: string) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
    });
    return { success: true, error: null, subject };
  } catch (error) {
    console.error("Get subject error:", error);
    return {
      success: false,
      error: "An error occurred while fetching the subject",
      subject: null,
    };
  }
}

export async function updateSubject(id: string, input: UpdateSubjectInput) {
  const validation = updateSubjectSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      subject: null,
    };
  }

  try {
    const subject = await prisma.subject.update({
      where: { id },
      data: validation.data,
    });
    return { success: true, error: null, subject };
  } catch (error) {
    console.error("Update subject error:", error);
    return {
      success: false,
      error: "An error occurred while updating the subject",
      subject: null,
    };
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({
      where: { id },
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete subject error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the subject",
    };
  }
}
