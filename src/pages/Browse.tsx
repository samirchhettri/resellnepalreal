import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { InfiniteScrollSentinel } from "@/components/listings/InfiniteScrollSentinel";
import { useListings } from "@/hooks/useListings";
import { Loader2 } from "lucide-react";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") ?? undefined;
  const { listings, loading, loadingMore, hasMore, loadMore } = useListings({ search });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Browse</h1>
        <Link
          to="/search"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted"
        >
          <SearchIcon className="h-3.5 w-3.5" />
          Search & filter
        </Link>
      </div>
      <ListingGrid listings={listings} loading={loading} empty="Nothing here yet." />
      <InfiniteScrollSentinel onIntersect={loadMore} disabled={!hasMore || loading} />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default Browse;
