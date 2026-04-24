import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { Bell, CheckCheck, Loader2, MessageCircle, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const iconFor = (type: string) => {
  switch (type) {
    case "message":
      return MessageCircle;
    case "listing_update":
      return Tag;
    default:
      return Bell;
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useNotifications();

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading font-semibold">Log in to see notifications</p>
          <Button asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleClick = async (n: AppNotification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold">Notifications</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1.5">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center animate-fade-in">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading font-semibold">No notifications yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            We'll let you know when sellers reply or your listings get attention.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {notifications.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <li
                key={n.id}
                className={cn(
                  "group relative border-b border-border last:border-b-0 transition-colors animate-fade-in",
                  !n.is_read && "bg-primary/5",
                )}
              >
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      n.type === "message"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          !n.is_read ? "font-semibold text-foreground" : "text-foreground",
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(n.created_at), { addSuffix: false })}
                      </span>
                    </div>
                    {n.body && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                  </div>
                  {!n.is_read && (
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                      aria-label="Unread"
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => remove(n.id)}
                  aria-label="Delete notification"
                  className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
