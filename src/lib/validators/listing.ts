import { z } from "zod";
import { CATEGORIES, CONDITIONS } from "@/lib/constants/listings";

const categoryValues: string[] = CATEGORIES.map((c) => c.slug);
const conditionValues: string[] = CONDITIONS.map((c) => c.value);

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  price: z
    .number({ message: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(100_000_000, "Price is too high"),
  is_negotiable: z.boolean(),
  category: z
    .string({ message: "Select a category" })
    .refine((v) => categoryValues.includes(v), { message: "Select a category" }),
  condition: z
    .string({ message: "Select a condition" })
    .refine((v) => conditionValues.includes(v), { message: "Select a condition" }),
  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(120, "Location is too long"),
});

export type ListingInput = z.infer<typeof listingSchema>;
