import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { ChatParticipant, Conversation, Message } from "@/lib/types/chat";

interface State {
  loading: boolean;
  notFound: boolean;
  conversation: Conversation | null;
  other: ChatParticipant | null;
  messages: Message[];
}

export const useChatRoom = (conversationId?: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<State>({
    loading: true,
    notFound: false,
    conversation: null,
    other: null,
    messages: [],
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initial load
  useEffect(() => {
    if (!conversationId || !user) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, notFound: false }));

    (async () => {
      const { data: convo, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .maybeSingle();

      if (cancelled) return;
      if (error || !convo) {
        setState((s) => ({ ...s, loading: false, notFound: true }));
        return;
      }

      const c = convo as Conversation;
      const otherId =
        c.participant_one === user.id ? c.participant_two : c.participant_one;

      const [{ data: profile }, { data: msgs }] = await Promise.all([
        supabase
          .from("profiles_public" as any)
          .select("id, full_name, avatar_url")
          .eq("id", otherId)
          .maybeSingle(),
        supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;
      setState({
        loading: false,
        notFound: false,
        conversation: c,
        other: (profile as ChatParticipant) ?? {
          id: otherId,
          full_name: null,
          avatar_url: null,
        },
        messages: (msgs ?? []) as Message[],
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, user]);

  // Mark incoming messages as read
  const markRead = useCallback(async () => {
    if (!conversationId || !user) return;
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  }, [conversationId, user]);

  useEffect(() => {
    if (!state.loading && state.messages.length > 0) {
      markRead();
    }
  }, [state.loading, state.messages.length, markRead]);

  // Realtime subscription for this conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`room:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setState((s) =>
            s.messages.some((m) => m.id === msg.id)
              ? s
              : { ...s, messages: [...s.messages, msg] },
          );
          if (msg.sender_id !== user.id) markRead();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) => (m.id === updated.id ? updated : m)),
          }));
        },
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, user, markRead]);

  const sendMessage = useCallback(
    async (content: string, imageUrl?: string | null) => {
      if (!user || !conversationId) return { error: "Not ready" };
      const trimmed = content.trim();
      if (!trimmed && !imageUrl) return { error: "Empty message" };

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimmed || null,
        image_url: imageUrl ?? null,
      });
      return { error: error?.message };
    },
    [conversationId, user],
  );

  return { ...state, sendMessage };
};
