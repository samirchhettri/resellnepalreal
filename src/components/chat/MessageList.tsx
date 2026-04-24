import { useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatParticipant, Message } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  other: ChatParticipant;
}

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
};

const initials = (name: string | null) =>
  (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const MessageList = ({ messages, currentUserId, other }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          No messages yet. Say hello to start the conversation.
        </p>
      </div>
    );
  }

  let lastDay = "";
  return (
    <div className="space-y-3 px-3 py-4">
      {messages.map((m) => {
        const isMine = m.sender_id === currentUserId;
        const day = dayLabel(m.created_at);
        const showDay = day !== lastDay;
        lastDay = day;

        return (
          <div key={m.id}>
            {showDay && (
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {day}
                </span>
              </div>
            )}
            <div className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
              {!isMine && (
                <Avatar className="h-7 w-7 shrink-0">
                  {other.avatar_url && <AvatarImage src={other.avatar_url} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {initials(other.full_name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                  isMine
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-card text-card-foreground border border-border",
                )}
              >
                {m.image_url && (
                  <a href={m.image_url} target="_blank" rel="noreferrer">
                    <img
                      src={m.image_url}
                      alt="attachment"
                      className="mb-1 max-h-64 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </a>
                )}
                {m.content && (
                  <p className="whitespace-pre-wrap break-words leading-snug">{m.content}</p>
                )}
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[10px]",
                    isMine ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  <span>{format(new Date(m.created_at), "h:mm a")}</span>
                  {isMine &&
                    (m.is_read ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
