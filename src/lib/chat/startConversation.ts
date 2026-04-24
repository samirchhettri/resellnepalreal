import { supabase } from "@/integrations/supabase/client";
import { orderParticipants } from "@/lib/types/chat";

/**
 * Find or create a conversation between the current user and another user,
 * optionally tied to a listing. Returns the conversation id.
 */
export const startConversation = async (
  currentUserId: string,
  otherUserId: string,
  listingId: string | null,
): Promise<{ id?: string; error?: string }> => {
  if (currentUserId === otherUserId) {
    return { error: "Cannot start a conversation with yourself" };
  }
  const [p1, p2] = orderParticipants(currentUserId, otherUserId);

  let query = supabase
    .from("conversations")
    .select("id")
    .eq("participant_one", p1)
    .eq("participant_two", p2);
  query = listingId
    ? query.eq("listing_id", listingId)
    : query.is("listing_id", null);

  const { data: existing } = await query.maybeSingle();
  if (existing) return { id: existing.id };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      participant_one: p1,
      participant_two: p2,
      listing_id: listingId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: created.id };
};
