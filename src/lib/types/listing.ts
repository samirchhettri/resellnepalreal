export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  category: string;
  condition: string;
  location: string;
  images: string[];
  status: "active" | "sold" | "inactive";
  created_at: string;
  updated_at: string;
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(price);
