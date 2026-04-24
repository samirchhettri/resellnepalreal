import { z } from "zod";
import { CATEGORIES, CONDITIONS } from "@/lib/constants/listings";

const categoryValues = CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const conditionValues = CONDITIONS.map((c) => c.value) as [string, ...string[]];

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
    .number({ invalid_type_error: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(100_000_000, "Price is too high"),
  is_negotiable: z.boolean(),
  category: z.enum(categoryValues, { required_error: "Select a category" }),
  condition: z.enum(conditionValues, { required_error: "Select a condition" }),
  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(120, "Location is too long"),
});

export type ListingInput = z.infer<typeof listingSchema>;
