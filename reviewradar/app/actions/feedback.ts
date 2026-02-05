'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is exported from here, if not I'll fix
import { revalidatePath } from "next/cache";
import { z } from "zod";

const feedbackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["Bug", "Feature", "UX", "Performance", "Other"]),
  rating: z.coerce.number().min(1).max(5).default(0),
});

export type FeedbackState = {
  errors?: {
    title?: string[];
    description?: string[];
    category?: string[];
    rating?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

export async function createFeedback(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      message: "You must be logged in to submit feedback.",
      success: false,
    };
  }

  const validatedFields = feedbackSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    rating: formData.get('rating'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      success: false,
    };
  }

  try {
    await prisma.feedback.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        category: validatedFields.data.category,
        rating: validatedFields.data.rating,
        sentiment: "Pending", // Default, or calculate if we had an AI service
        userId: userId,
      },
    });

    revalidatePath('/dashboard/user');
    return {
      message: "Feedback submitted successfully!",
      success: true,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Failed to submit feedback. Please try again.",
      success: false,
    };
  }
}
