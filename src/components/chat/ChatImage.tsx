import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatImageProps {
  value: string; // either a storage path (e.g. "userId/convId/file.jpg") or a legacy public URL
}

export const ChatImage = ({ value }: ChatImageProps) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      if (/^https?:\/\//i.test(value)) {
        // Legacy: stored as a full URL. Try to extract the storage path and sign it.
        const marker = "/chat-images/";
        const idx = value.indexOf(marker);
        if (idx === -1) {
          if (!cancelled) setUrl(value);
          return;
        }
        const path = value.slice(idx + marker.length);
        const { data } = await supabase.storage
          .from("chat-images")
          .createSignedUrl(path, 60 * 60);
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      } else {
        const { data } = await supabase.storage
          .from("chat-images")
          .createSignedUrl(value, 60 * 60);
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      }
    };
    resolve();
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!url) {
    return <div className="mb-1 h-40 w-40 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={url}
        alt="attachment"
        className="mb-1 max-h-64 rounded-lg object-cover"
        loading="lazy"
      />
    </a>
  );
};
