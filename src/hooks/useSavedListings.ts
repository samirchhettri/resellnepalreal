import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@/lib/types/listing";

/**
 * Hook for managing the current user's saved listings (wishlist).
 * Loads the set of saved listing IDs once, and exposes optimistic toggle.
 */
export const useSavedListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("saved_listings")
        .select("listing_id")
        .eq("user_id", user.id);
      if (cancelled) return;
      setSavedIds(new Set((data ?? []).map((r) => r.listing_id)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleSaved = useCallback(
    async (listingId: string) => {
      if (!user) {
        toast({ title: "Log in to save items" });
        return { saved: false, error: "not-authenticated" };
      }
      const wasSaved = savedIds.has(listingId);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      if (wasSaved) {
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);
        if (error) {
          // Revert
          setSavedIds((prev) => new Set(prev).add(listingId));
          toast({ title: "Could not remove", description: error.message, variant: "destructive" });
          return { saved: true, error: error.message };
        }
        return { saved: false };
      }

      const { error } = await supabase
        .from("saved_listings")
        .insert({ user_id: user.id, listing_id: listingId });
      if (error) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        toast({ title: "Could not save", description: error.message, variant: "destructive" });
        return { saved: false, error: error.message };
      }
      return { saved: true };
    },
    [user, savedIds, toast],
  );

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return { savedIds, isSaved, toggleSaved, loading };
};

/** Fetches the full listing rows for the user's saved items. */
export const useSavedListingsFeed = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_listings")
      .select("created_at, listing:listings(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setListings([]);
    } else {
      setError(null);
      setListings(
        (data ?? [])
          .map((r) => r.listing as Listing | null)
          .filter((l): l is Listing => !!l),
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { listings, loading, error, refetch };
};
