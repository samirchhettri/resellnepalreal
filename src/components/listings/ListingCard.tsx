import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ImageOff, MapPin } from "lucide-react";
import { formatPrice, type Listing } from "@/lib/types/listing";
import { CATEGORIES } from "@/lib/constants/listings";
import { cn } from "@/lib/utils";

const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

interface ListingCardProps {
  listing: Listing;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showSaveButton?: boolean;
}

const ListingCardComponent = ({
  listing,
  isSaved = false,
  onToggleSave,
  showSaveButton = true,
}: ListingCardProps) => {
  const cover = listing.images?.[0];
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave?.(listing.id);
  };

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`${listing.title}, ${formatPrice(listing.price)}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {cover && !imgError ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
            <img
              src={cover}
              alt={listing.title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={cn(
                "h-full w-full object-cover transition-all duration-300 group-hover:scale-105",
                imgLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageOff className="h-5 w-5" aria-hidden />
            <span className="text-[10px]">No image</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground backdrop-blur-sm">
          {categoryLabel(listing.category)}
        </span>
        {showSaveButton && onToggleSave && (
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label={isSaved ? "Remove from saved" : "Save item"}
            aria-pressed={isSaved}
            className={cn(
              "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSaved && "text-primary",
            )}
          >
            <Bookmark
              className={cn(
                "h-4 w-4 transition-all",
                isSaved && "fill-primary text-primary",
              )}
            />
          </button>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="font-semibold text-foreground">{formatPrice(listing.price)}</p>
        <p className="line-clamp-2 text-sm text-foreground">{listing.title}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" aria-hidden />
          <span className="truncate">{listing.location}</span>
        </p>
      </div>
    </Link>
  );
};

export const ListingCard = memo(ListingCardComponent, (prev, next) =>
  prev.listing.id === next.listing.id &&
  prev.isSaved === next.isSaved &&
  prev.showSaveButton === next.showSaveButton &&
  prev.onToggleSave === next.onToggleSave,
);

export const ListingCardSkeleton = () => (
  <div
    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    aria-hidden
  >
    <div className="aspect-square animate-pulse bg-muted" />
    <div className="space-y-2 p-3">
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  </div>
);
