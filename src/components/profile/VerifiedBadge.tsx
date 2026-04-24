import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  label?: string;
}

export const VerifiedBadge = ({ className, label = "Verified" }: VerifiedBadgeProps) => {
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent",
        className,
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};
