import { ReactNode } from "react";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";
import type { Listing } from "@/lib/types/listing";

interface ListingGridProps {
  listings: Listing[];
  loading?: boolean;
  skeletonCount?: number;
  empty?: ReactNode;
}

export const ListingGrid = ({
  listings,
  loading,
  skeletonCount = 6,
  empty,
}: ListingGridProps) => {
  if (!loading && listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {empty ?? "No listings found."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ListingCardSkeleton key={`s-${i}`} />
        ))}
    </div>
  );
};
