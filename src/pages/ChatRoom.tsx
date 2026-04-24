import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChatRoom } from "@/hooks/useChatRoom";
import { MessageList } from "@/components/chat/MessageList";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { PresenceDot } from "@/components/chat/PresenceDot";

const initials = (name: string | null) =>
  (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ChatRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, notFound, conversation, other, messages, sendMessage } = useChatRoom(id);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !conversation || !other || !user) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-heading text-lg font-semibold">Conversation not found</p>
        <Button asChild variant="outline">
          <Link to="/chat">Back to messages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100dvh-4rem)] flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-2 py-2 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/chat")}
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative">
          <Avatar className="h-10 w-10">
            {other.avatar_url && <AvatarImage src={other.avatar_url} />}
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initials(other.full_name)}
            </AvatarFallback>
          </Avatar>
          <PresenceDot userId={other.id} className="absolute bottom-0 right-0" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">
            {other.full_name ?? "Seller"}
          </p>
          <PresenceDot userId={other.id} showLabel />
        </div>
        {conversation.listing_id && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/listing/${conversation.listing_id}`}>View listing</Link>
          </Button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto bg-muted/20">
        <MessageList messages={messages} currentUserId={user.id} other={other} />
      </main>

      <MessageComposer conversationId={conversation.id} onSend={sendMessage} />
    </div>
  );
};

export default ChatRoom;
