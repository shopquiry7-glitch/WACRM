/**
 * Formats Meta WhatsApp error codes and statuses into human-readable,
 * actionable explanations for agents and users.
 *
 * WhatsApp Cloud API error codes reference:
 * https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */

export interface FailedMessageLike {
  status?: string | null;
  error_code?: number | null;
  error_title?: string | null;
  error_details?: string | null;
}

export function formatMessageFailureReason(message: FailedMessageLike): string | null {
  if (message.status !== "failed" || !message.error_title) return null;

  const code = message.error_code;
  const title = message.error_title?.trim() || "";
  const details = message.error_details?.trim() || "";
  const titleLower = title.toLowerCase();
  const detailsLower = details.toLowerCase();

  // 131026: Undeliverable — recipient number is not registered on WhatsApp,
  // or (in Meta test sandbox) not whitelisted in the developer portal.
  if (
    code === 131026 ||
    titleLower.includes("undeliverable") ||
    detailsLower.includes("undeliverable")
  ) {
    return "Undeliverable (131026): Number is not on WhatsApp, or not added to your Meta test numbers list in developer portal.";
  }

  // 131030: Sandbox allowed list
  if (
    code === 131030 ||
    titleLower.includes("allowed list") ||
    detailsLower.includes("allowed list")
  ) {
    return "Sandbox Restriction (131030): Recipient number is not in your Meta Developer allowed test recipient list.";
  }

  // 131047: 24-hour customer window closed
  if (
    code === 131047 ||
    titleLower.includes("re-engagement") ||
    titleLower.includes("24 hours") ||
    detailsLower.includes("24 hours")
  ) {
    return "24-Hour Window Closed (131047): Customer has not replied in over 24 hours. Send an approved template message to restart the conversation.";
  }

  // 131049: Healthy ecosystem engagement rate limit
  if (
    code === 131049 ||
    titleLower.includes("healthy ecosystem engagement") ||
    detailsLower.includes("healthy ecosystem engagement")
  ) {
    return "Meta Rate Limit (131049): Delivery paused by WhatsApp because multiple messages were sent without customer reply. Wait for recipient to reply or use a Utility template.";
  }

  // 131051: Unsupported message type
  if (
    code === 131051 ||
    titleLower.includes("unsupported message") ||
    detailsLower.includes("unsupported message")
  ) {
    return "Unsupported Type (131051): Message format or template parameters do not match WhatsApp specifications.";
  }

  // 131052 / 131053: Media error
  if (code === 131052 || code === 131053) {
    return `Media Error (${code}): WhatsApp could not process the attached media file.`;
  }

  // 130429 / 80007: Rate limit
  if (code === 130429 || code === 80007) {
    return `Rate Limit (${code}): Too many messages sent in a short period. Please wait before retrying.`;
  }

  // 190 / 131000 / 131005: Auth error
  if (code === 190 || code === 131000 || code === 131005) {
    return `Meta Auth Error (${code}): Invalid or expired access token. Please verify WhatsApp configuration in Settings.`;
  }

  // 131042: Business eligibility payment issue / unsettled payments
  if (
    code === 131042 ||
    titleLower.includes("payment issue") ||
    detailsLower.includes("unsettled payment") ||
    detailsLower.includes("billing_hub")
  ) {
    return details
      ? `Meta Billing Issue (131042): ${details}`
      : "Meta Billing Issue (131042): WhatsApp sending paused due to an unsettled payment on Meta Business Manager.";
  }

  // Deduplicate if title and details are identical or redundant (avoids "Message undeliverable — Message Undeliverable.")
  if (details) {
    const normTitle = title.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const normDetails = details.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (normTitle === normDetails || normDetails.includes(normTitle)) {
      return details;
    }
    return `${title} — ${details}`;
  }

  return title;
}
