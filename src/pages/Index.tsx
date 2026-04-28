import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { InfiniteScrollSentinel } from "@/components/listings/InfiniteScrollSentinel";
import { useListings } from "@/hooks/useListings";

const CATEGORY_EMOJI: Record<string, string> = {
  phones: "📱",
  bikes: "🏍️",
  clothes: "👕",
  electronics: "💻",
  furniture: "🛋️",
  books: "📚",
};

const Index = () => {
  const { listings, loading, loadingMore, hasMore, error, loadMore, refresh } = useListings();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider opacity-90">Welcome</p>
        <h1 className="mt-1 font-heading text-2xl font-bold leading-tight">
          Buy & sell locally in Nepal
        </h1>
        <p className="mt-2 text-sm opacity-90">
          List in seconds. Chat instantly. Find great deals near you.
        </p>
        <Link
          to="/create-listing"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-background px-5 text-sm font-semibold text-foreground transition-transform active:scale-95"
        >
          Start selling
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Categories</h2>
          <Link to="/categories" className="text-sm font-medium text-primary">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-sm transition-colors hover:bg-muted"
            >
              <span className="text-2xl" aria-hidden>
                {CATEGORY_EMOJI[c.slug]}
              </span>
              <span className="text-xs font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Latest items</h2>
        <ListingGrid
          listings={listings}
          loading={loading}
          error={error}
          onRetry={refresh}
          empty="No listings yet. Be the first to post one!"
        />
        <InfiniteScrollSentinel onIntersect={loadMore} disabled={!hasMore || loading} />
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!hasMore && listings.length > 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            You've reached the end
          </p>
        )}
      </section>
    </div>
  );
};

export default Index;
