import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";
import { Button } from "@/components/ui/button";
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
  error?: string | null;
  onRetry?: () => void;
}

export const ListingGrid = ({
  listings,
  loading,
  skeletonCount = 6,
  empty,
  hideSaveButton,
  error,
  onRetry,
}: ListingGridProps) => {
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedListings();

  if (error && !loading && listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center animate-fade-in">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
        <p className="text-sm text-foreground">Couldn't load listings.</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!loading && listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground animate-fade-in">
        {empty ?? "No listings found."}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      role="list"
    >
      {listings.map((l) => (
        <div role="listitem" key={l.id}>
          <ListingCard
            listing={l}
            isSaved={isSaved(l.id)}
            onToggleSave={user && !hideSaveButton ? toggleSaved : undefined}
            showSaveButton={!hideSaveButton}
          />
        </div>
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ListingCardSkeleton key={`s-${i}`} />
        ))}
    </div>
  );
};
