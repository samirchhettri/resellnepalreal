import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(255),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password is too long"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password is too long"),
});
export type SignupInput = z.infer<typeof signupSchema>;
