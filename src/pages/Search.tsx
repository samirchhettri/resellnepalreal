import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CATEGORIES, CONDITIONS } from "@/lib/constants/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { InfiniteScrollSentinel } from "@/components/listings/InfiniteScrollSentinel";
import { useListings, type ListingFilters } from "@/hooks/useListings";

const ANY = "__any__";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Live text input, debounced into the URL.
  const [text, setText] = useState(searchParams.get("q") ?? "");
  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const trimmed = text.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const filters: ListingFilters = useMemo(() => {
    const minPrice = Number(searchParams.get("min"));
    const maxPrice = Number(searchParams.get("max"));
    return {
      search: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      condition: searchParams.get("condition") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
    };
  }, [searchParams]);

  const activeFilterCount = [
    filters.category,
    filters.condition,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  const { listings, loading, loadingMore, hasMore, loadMore } = useListings(filters);

  const [draft, setDraft] = useState(filters);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    const set = (key: string, value?: string | number) => {
      if (value === undefined || value === "" || value === null) next.delete(key);
      else next.set(key, String(value));
    };
    set("category", draft.category);
    set("condition", draft.condition);
    set("location", draft.location);
    set("min", draft.minPrice);
    set("max", draft.maxPrice);
    setSearchParams(next, { replace: true });
    setOpen(false);
  };

  const clearAll = () => {
    setDraft({});
    const next = new URLSearchParams();
    if (text.trim()) next.set("q", text.trim());
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Search</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search items..."
            className="pl-9 pr-9"
            inputMode="search"
            autoFocus
          />
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={draft.category ?? ANY}
                  onValueChange={(v) =>
                    setDraft({ ...draft, category: v === ANY ? undefined : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any category</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select
                  value={draft.condition ?? ANY}
                  onValueChange={(v) =>
                    setDraft({ ...draft, condition: v === ANY ? undefined : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any condition</SelectItem>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc-filter">Location</Label>
                <Input
                  id="loc-filter"
                  placeholder="e.g. Kathmandu"
                  value={draft.location ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value || undefined })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="min-price">Min price (NPR)</Label>
                  <Input
                    id="min-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={draft.minPrice ?? ""}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDraft({
                        ...draft,
                        minPrice: Number.isFinite(v) && v > 0 ? v : undefined,
                      });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max-price">Max price (NPR)</Label>
                  <Input
                    id="max-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Any"
                    value={draft.maxPrice ?? ""}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDraft({
                        ...draft,
                        maxPrice: Number.isFinite(v) && v > 0 ? v : undefined,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="mt-6 flex-row gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft({})}
                className="flex-1"
              >
                Reset
              </Button>
              <Button type="button" onClick={applyFilters} className="flex-1">
                Show results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Clear all filters
        </button>
      )}

      <ListingGrid
        listings={listings}
        loading={loading}
        empty="No items match your search. Try different keywords or filters."
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

export default Search;
