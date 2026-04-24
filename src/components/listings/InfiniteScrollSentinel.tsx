import { useEffect, useRef } from "react";

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  disabled?: boolean;
}

export const InfiniteScrollSentinel = ({
  onIntersect,
  disabled,
}: InfiniteScrollSentinelProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, disabled]);

  return <div ref={ref} aria-hidden className="h-px w-full" />;
};
