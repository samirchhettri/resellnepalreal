import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

/** Maintains the current user's presence row and a global "online" heartbeat. */
export const usePresenceHeartbeat = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setOnline = async (online: boolean) => {
      await supabase
        .from("user_presence")
        .upsert(
          {
            user_id: user.id,
            is_online: online,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
    };

    setOnline(true);
    const heartbeat = window.setInterval(() => setOnline(true), 30_000);

    const handleVisibility = () => {
      setOnline(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleUnload = () => {
      // best-effort offline marker
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`,
      );
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
      setOnline(false);
    };
  }, [user]);
};

interface PresenceState {
  isOnline: boolean;
  lastSeenAt: string | null;
}

/** Subscribes to a single user's presence and returns derived online state. */
export const useUserPresence = (userId?: string | null): PresenceState => {
  const [state, setState] = useState<PresenceState>({
    isOnline: false,
    lastSeenAt: null,
  });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const compute = (row: { is_online: boolean; last_seen_at: string }) => {
      const last = new Date(row.last_seen_at).getTime();
      const fresh = Date.now() - last < 75_000; // ~2.5x heartbeat
      setState({
        isOnline: row.is_online && fresh,
        lastSeenAt: row.last_seen_at,
      });
    };

    (async () => {
      const { data } = await supabase
        .from("user_presence")
        .select("is_online, last_seen_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (!cancelled && data) compute(data);
    })();

    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { is_online: boolean; last_seen_at: string };
          if (row) compute(row);
        },
      )
      .subscribe();

    const tick = window.setInterval(() => {
      setState((prev) => {
        if (!prev.lastSeenAt) return prev;
        const fresh = Date.now() - new Date(prev.lastSeenAt).getTime() < 75_000;
        return prev.isOnline === fresh ? prev : { ...prev, isOnline: fresh };
      });
    }, 30_000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      window.clearInterval(tick);
    };
  }, [userId]);

  return state;
};
