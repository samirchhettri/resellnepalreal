import { Loader2 } from "lucide-react";

export const RouteFallback = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="flex h-[40vh] items-center justify-center"
  >
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);
