import { z } from "zod";

export const newUserSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters").max(100),

  email: z.string().email("Invalid email"),

  password: z.string().min(6, "Password must contain at least 8 characters"),

  role: z.enum(["user", "admin", "staff"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters").max(100),

  email: z.string().email("Invalid email"),

  role: z.enum(["user", "admin", "staff"]),
});

export const newTicketSchema = z.object({
  // Must be a string and cannot be empty (at least 1 character)
  subject: z.string().min(1, { message: "Subject is required" }),

  // Must be a string and cannot be empty
  description: z.string().min(1, { message: "Description is required" }),

  // Must match one of your specific status values
  status: z.enum(["open", "in_progress", "waiting_for_user", "resolved", "closed"], {
    required_error: "Status is required",
  }),

  // Must match one of your specific priority values
  priority: z.enum(["Low", "Medium", "High"], { required_error: "Priority is required" }),

  // Must be an integer but is optional / can be empty (null or undefined)
  assignedTo: z.number().int().nullable().optional(),
});
