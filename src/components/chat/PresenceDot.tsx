import { useUserPresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface PresenceDotProps {
  userId?: string | null;
  className?: string;
  showLabel?: boolean;
}

const formatLastSeen = (iso: string | null) => {
  if (!iso) return "Offline";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `Last seen ${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Last seen ${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `Last seen ${day}d ago`;
};

export const PresenceDot = ({ userId, className, showLabel = false }: PresenceDotProps) => {
  const { isOnline, lastSeenAt } = useUserPresence(userId);

  if (showLabel) {
    return (
      <span className={cn("flex items-center gap-1.5 text-xs", className)}>
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isOnline ? "bg-accent" : "bg-muted-foreground/50",
          )}
          aria-hidden
        />
        <span className={isOnline ? "text-accent font-medium" : "text-muted-foreground"}>
          {isOnline ? "Online" : formatLastSeen(lastSeenAt)}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full ring-2 ring-background",
        isOnline ? "bg-accent" : "bg-muted-foreground/40",
        className,
      )}
      aria-label={isOnline ? "Online" : "Offline"}
    />
  );
};
