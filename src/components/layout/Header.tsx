import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
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
            to="/notifications"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>
      </div>
    </header>
  );
};
