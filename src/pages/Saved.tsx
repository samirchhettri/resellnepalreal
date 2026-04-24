import { Link } from "react-router-dom";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useSavedListings, useSavedListingsFeed } from "@/hooks/useSavedListings";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { useToast } from "@/hooks/use-toast";

const Saved = () => {
  const { user } = useAuth();
  const { listings, loading, refetch } = useSavedListingsFeed();
  const { isSaved, toggleSaved } = useSavedListings();
  const { toast } = useToast();

  const handleRemove = async (id: string, title: string) => {
    const res = await toggleSaved(id);
    if (!res.error) {
      toast({ title: "Removed", description: `"${title}" removed from saved.` });
      refetch();
    }
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">Saved</h1>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading font-semibold">Log in to view saved items</p>
          <Button asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold">Saved</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {listings.length} {listings.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center animate-fade-in">
          <Bookmark className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading font-semibold">No saved items yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tap the bookmark icon on any listing to save it for later.
          </p>
          <Button asChild variant="outline">
            <Link to="/browse">Browse listings</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="group relative animate-fade-in transition-opacity"
            >
              <ListingCard
                listing={listing}
                isSaved={isSaved(listing.id)}
                onToggleSave={(id) => handleRemove(id, listing.title)}
              />
              <button
                type="button"
                onClick={() => handleRemove(listing.id, listing.title)}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium text-destructive opacity-0 shadow-sm transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 sm:text-xs"
                aria-label={`Remove ${listing.title} from saved`}
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
