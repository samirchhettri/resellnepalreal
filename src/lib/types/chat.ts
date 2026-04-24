export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  listing_id: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ChatParticipant {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ConversationListItem {
  conversation: Conversation;
  other: ChatParticipant;
  lastMessage: Message | null;
  unreadCount: number;
  listingTitle?: string | null;
  listingImage?: string | null;
}

/** Build a deterministic ordered participant pair for the unique constraint. */
export const orderParticipants = (a: string, b: string): [string, string] =>
  a < b ? [a, b] : [b, a];
