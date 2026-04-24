import { Bookmark, Compass, Home, MessageCircle, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/browse", label: "Browse", icon: Compass },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];

export const BottomNav = () => {
  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-bottom"
    >
      <ul className="mx-auto flex max-w-screen-md items-stretch justify-around px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={cn(
                "flex h-16 min-h-[44px] flex-col items-center justify-center gap-1 text-xs font-medium",
                "text-muted-foreground transition-colors hover:text-foreground",
              )}
              activeClassName="text-primary"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
