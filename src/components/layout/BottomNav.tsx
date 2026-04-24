import { Bookmark, Compass, Home, MessageCircle, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/browse", label: "Browse", icon: Compass },
  { to: "/chat", label: "Messages", icon: MessageCircle, badgeKey: "messages" as const },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];

export const BottomNav = () => {
  const { user } = useAuth();
  const { totalUnread } = useConversations();
  const showBadge = !!user && totalUnread > 0;

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-bottom"
    >
      <ul className="mx-auto flex max-w-screen-md items-stretch justify-around px-2">
        {items.map(({ to, label, icon: Icon, end, badgeKey }) => (
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
              <span className="relative">
                <Icon className="h-5 w-5" />
                {badgeKey === "messages" && showBadge && (
                  <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
