export const CATEGORIES = [
  { slug: "phones", label: "Phones" },
  { slug: "bikes", label: "Bikes" },
  { slug: "clothes", label: "Clothes" },
  { slug: "electronics", label: "Electronics" },
  { slug: "furniture", label: "Furniture" },
  { slug: "books", label: "Books" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For parts" },
] as const;

export type ConditionValue = (typeof CONDITIONS)[number]["value"];
