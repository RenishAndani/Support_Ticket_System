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
