import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Lock, LogOut, Pencil, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const items = [
    { label: "Edit profile", to: "/edit-profile", icon: Pencil },
    { label: "Notifications", to: "/notifications", icon: Bell },
    { label: "Safety tips", to: "/safety", icon: Shield },
    { label: "Help & support", to: "/help", icon: HelpCircle },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back">
          <Link to="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-lg font-bold">Settings</h1>
      </div>

      <section className="mt-4 grid grid-cols-1 gap-2">
        {items.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex h-12 items-center gap-3 rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">{label}</span>
            <span className="text-muted-foreground">›</span>
          </Link>
        ))}

        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Account
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Password and account changes coming soon.
          </p>
        </div>

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

export default Settings;
