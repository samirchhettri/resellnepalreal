import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBlockedIds(new Set());
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("blocked_users")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    setBlockedIds(new Set((data ?? []).map((r) => r.blocked_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isBlocked = useCallback((id: string) => blockedIds.has(id), [blockedIds]);

  const block = useCallback(
    async (id: string) => {
      if (!user) return { error: "Not signed in" };
      if (id === user.id) return { error: "You cannot block yourself" };
      const { error } = await supabase
        .from("blocked_users")
        .insert({ blocker_id: user.id, blocked_id: id });
      if (error && !error.message.includes("duplicate")) return { error: error.message };
      setBlockedIds((prev) => new Set(prev).add(id));
      return {};
    },
    [user],
  );

  const unblock = useCallback(
    async (id: string) => {
      if (!user) return { error: "Not signed in" };
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", id);
      if (error) return { error: error.message };
      setBlockedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return {};
    },
    [user],
  );

  return { blockedIds, isBlocked, block, unblock, loading, refresh };
};
