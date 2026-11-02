import type { Message } from "@/types";

export interface MessageCostInfo {
  amount: number;
  formatted: string;
  shortLabel: string;
  category: "free" | "utility" | "marketing" | "failed";
  description: string;
}

export interface ConversationCostSummary {
  totalCost: number;
  totalCostFormatted: string;
  billableMessagesCount: number;
  freeMessagesCount: number;
  isWindowActive: boolean;
  windowHoursRemaining: number;
  windowMinutesRemaining: number;
  nextMessageCostEstimate: string;
}

/**
 * Rates in AED based on official Meta WhatsApp Business Cloud API rate card for UAE (+971):
 * - Free: 0.00 AED (Inbound, and Outbound inside 24h customer reply window)
 * - Utility / Authentication: 0.0576 AED (~6 fils)
 * - Marketing / Broadcast: 0.2115 AED (~21 fils)
 */
export const META_RATES = {
  FREE: 0.0,
  UTILITY_AED: 0.0576,
  MARKETING_AED: 0.2115,
};

/**
 * Calculate the Meta delivery cost for a single message.
 */
export function calculateMessageCost(
  message: Message,
  prevCustomerMsgDate?: string | null
): MessageCostInfo {
  // 1) Failed messages are never billed by Meta
  if (message.status === "failed") {
    return {
      amount: 0,
      formatted: "0.00 AED",
      shortLabel: "0.00 AED",
      category: "failed",
      description: "Failed message: Meta never charges for undelivered messages (0.00 AED).",
    };
  }

  // 2) Inbound customer messages are always free
  if (message.sender_type === "customer") {
    return {
      amount: 0,
      formatted: "FREE (0.00 AED)",
      shortLabel: "FREE",
      category: "free",
      description: "Inbound message: Customer messages received are 100% free (0.00 AED).",
    };
  }

  const tmpl = (message.template_name || "").toLowerCase();

  // 3) Marketing templates
  if (
    tmpl.includes("marketing") ||
    tmpl.includes("promo") ||
    tmpl.includes("broadcast") ||
    tmpl.includes("deal") ||
    tmpl.includes("offer")
  ) {
    return {
      amount: META_RATES.MARKETING_AED,
      formatted: "~0.21 AED",
      shortLabel: "0.21 AED",
      category: "marketing",
      description: "Marketing Template: ~0.21 AED (~21 fils / ~16 PKR) deducted by Meta.",
    };
  }

  // 4) Explicit utility / authentication templates
  if (tmpl.includes("utility") || tmpl.includes("auth") || tmpl.includes("otp")) {
    return {
      amount: META_RATES.UTILITY_AED,
      formatted: "~0.057 AED",
      shortLabel: "0.057 AED",
      category: "utility",
      description: "Utility / Alert: ~0.057 AED (~6 fils / ~4 PKR) deducted by Meta.",
    };
  }

  // 5) Normal outbound message (text, media, interactive)
  // Check if sent within 24 hours of customer's previous message
  if (prevCustomerMsgDate) {
    const msgTime = new Date(message.created_at).getTime();
    const custTime = new Date(prevCustomerMsgDate).getTime();
    const diffMs = msgTime - custTime;

    if (diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000) {
      return {
        amount: 0,
        formatted: "FREE (0.00 AED)",
        shortLabel: "FREE",
        category: "free",
        description: "Service Conversation: Sent within customer's 24h window (0.00 AED Free Tier).",
      };
    }
  }

  // Outbound initiated outside 24h window (e.g. direct_chat_update utility wrapper)
  return {
    amount: META_RATES.UTILITY_AED,
    formatted: "~0.057 AED",
    shortLabel: "0.057 AED",
    category: "utility",
    description: "24h Window Re-engagement: ~0.057 AED (~6 fils / ~4 PKR) deducted by Meta.",
  };
}

/**
 * Computes conversation-level Meta cost summary and 24-hour service window status.
 */
export function calculateConversationCostSummary(
  messages: Message[]
): ConversationCostSummary {
  let totalCost = 0;
  let billableCount = 0;
  let freeCount = 0;

  // Track the most recent customer message timestamp encountered as we iterate chronologically
  let latestCustomerTimestamp: string | null = null;

  // Sort messages ascending for accurate window timeline
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const m of sorted) {
    if (m.sender_type === "customer") {
      latestCustomerTimestamp = m.created_at;
      freeCount++;
    } else {
      const cost = calculateMessageCost(m, latestCustomerTimestamp);
      totalCost += cost.amount;
      if (cost.amount > 0) {
        billableCount++;
      } else {
        freeCount++;
      }
    }
  }

  // Compute 24-hour window from the absolute latest customer message
  let isWindowActive = false;
  let windowHoursRemaining = 0;
  let windowMinutesRemaining = 0;

  if (latestCustomerTimestamp) {
    const expiresAt = new Date(latestCustomerTimestamp).getTime() + 24 * 60 * 60 * 1000;
    const diffMs = expiresAt - Date.now();

    if (diffMs > 0) {
      isWindowActive = true;
      const totalMinutes = Math.floor(diffMs / (60 * 1000));
      windowHoursRemaining = Math.floor(totalMinutes / 60);
      windowMinutesRemaining = totalMinutes % 60;
    }
  }

  const nextMessageCostEstimate = isWindowActive
    ? "FREE (0.00 AED)"
    : "~0.057 AED (~6 fils)";

  return {
    totalCost: Math.round(totalCost * 1000) / 1000,
    totalCostFormatted:
      totalCost === 0 ? "0.00 AED" : `${(Math.round(totalCost * 100) / 100).toFixed(2)} AED`,
    billableMessagesCount: billableCount,
    freeMessagesCount: freeCount,
    isWindowActive,
    windowHoursRemaining,
    windowMinutesRemaining,
    nextMessageCostEstimate,
  };
}
