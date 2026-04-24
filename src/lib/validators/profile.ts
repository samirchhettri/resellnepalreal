import { z } from "zod";

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  location: z
    .string()
    .trim()
    .max(120, "Location is too long")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or less")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
