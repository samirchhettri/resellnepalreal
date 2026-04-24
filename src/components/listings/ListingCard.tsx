import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { formatPrice, type Listing } from "@/lib/types/listing";
import { CATEGORIES } from "@/lib/constants/listings";

const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export const ListingCard = ({ listing }: { listing: Listing }) => {
  const cover = listing.images?.[0];

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground">
          {categoryLabel(listing.category)}
        </span>
      </div>
      <div className="space-y-1 p-3">
        <p className="font-semibold text-foreground">{formatPrice(listing.price)}</p>
        <p className="line-clamp-2 text-sm text-foreground">{listing.title}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{listing.location}</span>
        </p>
      </div>
    </Link>
  );
};

export const ListingCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
    <div className="aspect-square animate-pulse bg-muted" />
    <div className="space-y-2 p-3">
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  </div>
);
