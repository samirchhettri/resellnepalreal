// Basic content moderation: flag listings/messages with banned or suspicious words.
// Keep list short and conservative — false positives hurt UX.

const BANNED_KEYWORDS = [
  // scams / fraud
  "western union",
  "money transfer",
  "send otp",
  "share otp",
  "bitcoin only",
  "advance payment",
  "wire transfer",
  // illegal / restricted
  "weapon",
  "gun for sale",
  "drugs",
  "cocaine",
  "heroin",
  "fake id",
  "counterfeit",
  // adult
  "escort",
  "sex service",
];

export interface ModerationResult {
  flagged: boolean;
  matched: string[];
}

export const moderateText = (...texts: (string | null | undefined)[]): ModerationResult => {
  const haystack = texts.filter(Boolean).join(" ").toLowerCase();
  const matched = BANNED_KEYWORDS.filter((kw) => haystack.includes(kw));
  return { flagged: matched.length > 0, matched };
};
