import { Bell, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

export const Header = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const showBadge = !!user && unreadCount > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md safe-top">
      <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold">
            र
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            reSell <span className="text-primary">Nepal</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/search"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            to="/help"
            aria-label="Help & AI assistant"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Sparkles className="h-5 w-5" />
          </Link>
          <Link
            to="/notifications"
            aria-label={
              showBadge ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            {showBadge && (
              <span className="absolute right-1 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
