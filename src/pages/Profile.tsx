import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, LogOut, MapPin, Pencil, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const name = profile?.full_name ?? user?.email ?? "User";
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar className="h-20 w-20 border-2 border-border">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-heading text-xl font-bold">{name}</h1>
              {profile?.is_verified && <VerifiedBadge />}
            </div>

            <div className="mt-1 space-y-1 text-sm text-muted-foreground">
              {profile?.location && (
                <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </p>
              )}
              {profile?.phone && (
                <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <Phone className="h-3.5 w-3.5" />
                  {profile.phone}
                </p>
              )}
              {memberSince && <p className="text-xs">Member since {memberSince}</p>}
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/edit-profile">
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        {profile?.bio && (
          <p className="mt-4 whitespace-pre-line border-t border-border pt-4 text-sm text-foreground">
            {profile.bio}
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-2">
        {[
          { label: "My Listings", to: "/my-listings" },
          { label: "Settings", to: "/settings" },
          { label: "Help & Support", to: "/help" },
          { label: "Safety Tips", to: "/safety" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex h-12 items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            {item.label}
            <span className="text-muted-foreground">›</span>
          </Link>
        ))}

        <Button
          variant="outline"
          onClick={handleLogout}
          className="mt-2 h-12 w-full justify-start text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </section>
    </div>
  );
};

export default Profile;
