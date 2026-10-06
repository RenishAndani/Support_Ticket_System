import { z } from "zod";

export const newTicketSchema = z.object({
  // Must be a string and cannot be empty (at least 1 character)
  subject: z.string().min(1, { message: "Subject is required" }),

  // Must be a string and cannot be empty
  description: z.string().min(1, { message: "Description is required" }),
});

export const updateSchema = z.object({
  // Must be a string and cannot be empty (at least 1 character)
  subject: z.string().min(1, { message: "Subject is required" }),

  // Must be a string and cannot be empty
  description: z.string().min(1, { message: "Description is required" }),

  // Must be a boolean
  closed: z.boolean({ message: "Closed must be a boolean" }),
});
