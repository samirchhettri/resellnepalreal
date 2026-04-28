import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Listing } from "@/lib/types/listing";

export interface ListingFilters {
  category?: string;
  condition?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

const PAGE_SIZE = 12;

export const useListings = (filters: ListingFilters = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  // Stringify filters so the effect only re-runs when values actually change.
  const filtersKey = JSON.stringify(filters);

  const buildQuery = useCallback(
    (from: number, to: number) => {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.condition) query = query.eq("condition", filters.condition);
      if (filters.location)
        query = query.ilike("location", `%${filters.location.trim()}%`);
      if (typeof filters.minPrice === "number")
        query = query.gte("price", filters.minPrice);
      if (typeof filters.maxPrice === "number")
        query = query.lte("price", filters.maxPrice);
      if (filters.search?.trim()) {
        const term = filters.search.trim().replace(/[%,]/g, " ");
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
      }
      return query;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [filtersKey],
  );

  const loadPage = useCallback(
    async (page: number, replace: boolean) => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await buildQuery(from, to);
      if (error) {
        setError(error.message);
        return;
      }
      setError(null);
      const rows = (data ?? []) as Listing[];
      setListings((prev) => (replace ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      pageRef.current = page;
    },
    [buildQuery],
  );

  // Reset and reload on filter change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    pageRef.current = 0;
    setHasMore(true);
    (async () => {
      await loadPage(0, true);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadPage(pageRef.current + 1, false);
    setLoadingMore(false);
  }, [hasMore, loading, loadingMore, loadPage]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    pageRef.current = 0;
    setHasMore(true);
    await loadPage(0, true);
    setLoading(false);
  }, [loadPage]);

  return { listings, loading, loadingMore, hasMore, error, loadMore, refresh };
};
