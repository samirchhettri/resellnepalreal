import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Bookmark,
  Flag,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { CATEGORIES, CONDITIONS } from "@/lib/constants/listings";
import { formatPrice, type Listing } from "@/lib/types/listing";
import { startConversation } from "@/lib/chat/startConversation";
import { useSavedListings } from "@/hooks/useSavedListings";
import { cn } from "@/lib/utils";

interface SellerSummary {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
}

const labelFor = (
  list: ReadonlyArray<{ slug?: string; value?: string; label: string }>,
  key: string,
) => list.find((i) => (i.slug ?? i.value) === key)?.label ?? key;

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<SellerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setListing(data as Listing);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, location, is_verified, created_at")
        .eq("id", data.user_id)
        .maybeSingle();
      if (cancelled) return;
      setSeller(profile as SellerSummary | null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const requireAuth = (action: string) => {
    if (user) return true;
    toast({
      title: "Log in required",
      description: `Please log in to ${action}.`,
    });
    navigate("/login", { state: { from: { pathname: `/listing/${id}` } } });
    return false;
  };

  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    if (!requireAuth("message the seller")) return;
    if (!listing || !user) return;
    if (listing.user_id === user.id) {
      toast({ title: "This is your listing" });
      return;
    }
    setChatLoading(true);
    const { id: convoId, error } = await startConversation(
      user.id,
      listing.user_id,
      listing.id,
    );
    setChatLoading(false);
    if (error || !convoId) {
      toast({
        title: "Could not start chat",
        description: error ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/chat/${convoId}`);
  };

  const handleSave = async () => {
    if (!requireAuth("save items")) return;
    if (!listing) return;
    const res = await toggleSaved(listing.id);
    if (!res.error) {
      toast({ title: res.saved ? "Saved to your wishlist" : "Removed from saved" });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied to clipboard" });
      }
    } catch {
      /* user cancelled */
    }
  };

  const submitReport = () => {
    setReportOpen(false);
    toast({
      title: "Report submitted",
      description: "Thanks — our team will review this listing.",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-heading text-lg font-semibold">Listing not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been removed or the link is incorrect.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const isSold = listing.status !== "active";
  const isOwner = user?.id === listing.user_id;
  const sellerName = seller?.full_name ?? "Seller";
  const sellerInitials = sellerName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sellerSince = seller?.created_at
    ? format(new Date(seller.created_at), "MMM yyyy")
    : null;

  return (
    <div className="space-y-5 pb-24">
      <div className="-mx-4 -mt-4 flex items-center justify-between border-b border-border bg-background/95 px-2 py-2 backdrop-blur-md sm:mx-0 sm:mt-0 sm:rounded-t-xl sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative">
        <ImageGallery images={listing.images} alt={listing.title} />
        {isSold && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-foreground shadow-md">
              {listing.status === "sold" ? "Sold" : "Inactive"}
            </span>
          </div>
        )}
      </div>

      <section className="space-y-2">
        <p className="text-2xl font-heading font-bold text-foreground">
          {formatPrice(listing.price)}
          {listing.is_negotiable && (
            <span className="ml-2 align-middle text-xs font-medium text-muted-foreground">
              · Negotiable
            </span>
          )}
        </p>
        <h1 className="font-heading text-xl font-semibold leading-snug">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
            {labelFor(CATEGORIES, listing.category)}
          </span>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">
            {labelFor(CONDITIONS, listing.condition)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {listing.location}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Posted {format(new Date(listing.created_at), "MMM d, yyyy")}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Description
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {listing.description}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Seller
        </h2>
        <Link
          to={`/profile`}
          className="flex items-center gap-3"
          onClick={(e) => {
            if (!isOwner) e.preventDefault();
          }}
        >
          <Avatar className="h-12 w-12">
            {seller?.avatar_url && (
              <AvatarImage src={seller.avatar_url} alt={sellerName} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {sellerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{sellerName}</p>
              {seller?.is_verified && <VerifiedBadge />}
            </div>
            <p className="text-xs text-muted-foreground">
              {seller?.location ?? "Location not set"}
              {sellerSince && ` · Member since ${sellerSince}`}
            </p>
          </div>
        </Link>
      </section>

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Flag className="h-3.5 w-3.5" />
        Report this listing
      </button>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-screen-md items-center gap-2 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSave}
            aria-label={saved ? "Remove from saved" : "Save item"}
            className="h-11 w-11 shrink-0"
          >
            <Bookmark
              className={cn("h-5 w-5", saved && "fill-primary text-primary")}
            />
          </Button>
          <Button
            type="button"
            onClick={handleChat}
            disabled={isSold || isOwner || chatLoading}
            className="h-11 flex-1 gap-2"
          >
            {chatLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            {isOwner
              ? "Your listing"
              : isSold
                ? "No longer available"
                : "Chat with seller"}
          </Button>
        </div>
      </div>

      <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Let us know if this listing looks like spam, a scam, or violates our
              community guidelines. Our team will review it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitReport}>
              Submit report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingDetail;
