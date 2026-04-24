import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { Image as ImageIcon, Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/hooks/useConversations";
import { PresenceDot } from "@/components/chat/PresenceDot";
import { cn } from "@/lib/utils";

const initials = (name: string | null) =>
  (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Chat = () => {
  const { items, loading } = useConversations();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Messages</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading font-semibold">No conversations yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Start chatting with sellers from any listing — your conversations will appear here.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {items.map(({ conversation, other, lastMessage, unreadCount, listingTitle }) => {
            const time = lastMessage
              ? formatDistanceToNowStrict(new Date(lastMessage.created_at), { addSuffix: false })
              : "";
            const preview =
              lastMessage?.content ??
              (lastMessage?.image_url ? "📷 Photo" : "Say hello");
            return (
              <li key={conversation.id} className="border-b border-border last:border-b-0">
                <Link
                  to={`/chat/${conversation.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      {other.avatar_url && <AvatarImage src={other.avatar_url} />}
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {initials(other.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <PresenceDot
                      userId={other.id}
                      className="absolute bottom-0 right-0"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">
                        {other.full_name ?? "Seller"}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{time}</span>
                    </div>
                    {listingTitle && (
                      <p className="truncate text-[11px] font-medium text-primary">
                        Re: {listingTitle}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "flex items-center gap-1 truncate text-sm",
                          unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {lastMessage?.image_url && !lastMessage?.content && (
                          <ImageIcon className="h-3.5 w-3.5" />
                        )}
                        {preview}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Chat;
