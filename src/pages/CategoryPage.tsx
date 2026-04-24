import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { InfiniteScrollSentinel } from "@/components/listings/InfiniteScrollSentinel";
import { useListings } from "@/hooks/useListings";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) return <Navigate to="/categories" replace />;

  const { listings, loading, loadingMore, hasMore, loadMore } = useListings({
    category: category.slug,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-xl font-bold">{category.label}</h1>
      </div>

      <ListingGrid
        listings={listings}
        loading={loading}
        empty={`No ${category.label.toLowerCase()} listed yet.`}
      />
      <InfiniteScrollSentinel onIntersect={loadMore} disabled={!hasMore || loading} />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
