import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut } from "lucide-react";

interface ProfileRow {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  email: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, location, avatar_url, email")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setProfile(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const name = profile?.full_name ?? user?.email ?? "User";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold truncate">{name}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {profile?.location ?? "Add your location"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {["My Listings", "Settings", "Help & Support", "Safety Tips"].map((item) => (
          <button
            key={item}
            className="flex h-12 items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            {item}
            <span className="text-muted-foreground">›</span>
          </button>
        ))}

        <Button
          variant="outline"
          onClick={handleLogout}
          className="mt-2 h-12 w-full justify-start text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
