import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type {
  ChatParticipant,
  Conversation,
  ConversationListItem,
  Message,
} from "@/lib/types/chat";

export const useConversations = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convos || convos.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const otherIds = Array.from(
      new Set(
        convos.map((c) =>
          c.participant_one === user.id ? c.participant_two : c.participant_one,
        ),
      ),
    );
    const listingIds = Array.from(
      new Set(convos.map((c) => c.listing_id).filter(Boolean) as string[]),
    );
    const convoIds = convos.map((c) => c.id);

    const [{ data: profiles }, { data: listings }, { data: msgs }] = await Promise.all([
      supabase
        .from("profiles_public" as any)
        .select("id, full_name, avatar_url")
        .in("id", otherIds),
      listingIds.length
        ? supabase.from("listings").select("id, title, images").in("id", listingIds)
        : Promise.resolve({ data: [] as { id: string; title: string; images: string[] }[] }),
      supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convoIds)
        .order("created_at", { ascending: false }),
    ]);

    const profileMap = new Map<string, ChatParticipant>(
      (profiles ?? []).map((p) => [p.id, p as ChatParticipant]),
    );
    const listingMap = new Map(
      (listings ?? []).map((l) => [l.id, l as { id: string; title: string; images: string[] }]),
    );

    const lastByConvo = new Map<string, Message>();
    const unreadByConvo = new Map<string, number>();
    (msgs ?? []).forEach((m) => {
      const msg = m as Message;
      if (!lastByConvo.has(msg.conversation_id)) lastByConvo.set(msg.conversation_id, msg);
      if (!msg.is_read && msg.sender_id !== user.id) {
        unreadByConvo.set(
          msg.conversation_id,
          (unreadByConvo.get(msg.conversation_id) ?? 0) + 1,
        );
      }
    });

    const list: ConversationListItem[] = (convos as Conversation[]).map((c) => {
      const otherId = c.participant_one === user.id ? c.participant_two : c.participant_one;
      const listing = c.listing_id ? listingMap.get(c.listing_id) : null;
      return {
        conversation: c,
        other:
          profileMap.get(otherId) ??
          { id: otherId, full_name: null, avatar_url: null },
        lastMessage: lastByConvo.get(c.id) ?? null,
        unreadCount: unreadByConvo.get(c.id) ?? 0,
        listingTitle: listing?.title ?? null,
        listingImage: listing?.images?.[0] ?? null,
      };
    });

    setItems(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh on any new/updated message or conversation involving the user
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`conversations:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const totalUnread = items.reduce((sum, i) => sum + i.unreadCount, 0);

  return { items, loading, totalUnread, refetch: load };
};
