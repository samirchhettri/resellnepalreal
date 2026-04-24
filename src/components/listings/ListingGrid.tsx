import { ReactNode } from "react";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";
import { useSavedListings } from "@/hooks/useSavedListings";
import { useAuth } from "@/context/AuthContext";
import type { Listing } from "@/lib/types/listing";

interface ListingGridProps {
  listings: Listing[];
  loading?: boolean;
  skeletonCount?: number;
  empty?: ReactNode;
  /** Hide the bookmark icon overlay (e.g. on the Saved page itself). */
  hideSaveButton?: boolean;
}

export const ListingGrid = ({
  listings,
  loading,
  skeletonCount = 6,
  empty,
  hideSaveButton,
}: ListingGridProps) => {
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedListings();

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
        <ListingCard
          key={l.id}
          listing={l}
          isSaved={isSaved(l.id)}
          onToggleSave={user && !hideSaveButton ? toggleSaved : undefined}
          showSaveButton={!hideSaveButton}
        />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ListingCardSkeleton key={`s-${i}`} />
        ))}
    </div>
  );
};
