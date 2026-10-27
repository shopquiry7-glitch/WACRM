"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Message, MessageReaction } from "@/types";
import {
  Clock,
  Check,
  CheckCheck,
  XCircle,
  MapPin,
  LayoutTemplate,
  CornerDownLeft,
  Sparkles,
  AlertCircle,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { ReplyQuote } from "./reply-quote";
import { MessageReactions } from "./message-reactions";
import {
  MediaAudioBubble,
  MediaDocumentBubble,
  MediaImageBubble,
  MediaUnavailable,
  MediaVideoBubble,
} from "./message-media";
import { InteractivePreview } from "@/components/interactive/interactive-preview";
import { useTranslations } from "next-intl";
import { formatMessageFailureReason } from "@/lib/whatsapp/failure-reason";
import { formatRoleLabel, parseSenderSignature } from "@/lib/auth/roles";

interface MessageBubbleProps {
  message: Message;
  /** Pre-computed quote info for messages that reply to another. */
  reply?: { authorLabel: string; preview: string } | null;
  reactions?: MessageReaction[];
  currentUserId?: string;
  onToggleReaction?: (emoji: string) => void;
  /**
   * Opens the thread's media viewer on this message. Only images and videos
   * call it; omitted when the parent renders no viewer, in which case media
   * stays inline and non-clickable.
   */
  onOpenMedia?: (messageId: string) => void;
  /** Opens the template picker dialog when a 24h error occurs. */
  onOpenTemplates?: () => void;
  /** Profile info of the agent who sent this message (if known). */
  senderProfile?: { full_name?: string | null; account_role?: string | null } | null;
}

/**
 * Human-friendly explanation for a failed message, or null when the row
 * is not failed or Meta sent no reason.
 */
function failureReason(message: Message): string | null {
  return formatMessageFailureReason(message);
}

function StatusIcon({
  status,
  title,
}: {
  status: Message["status"];
  /** Tooltip for the failed state — Meta's reason, when we have one. */
  title?: string | null;
}) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    case "failed":
      return (
        <span className="inline-flex" title={title ?? undefined}>
          <XCircle className="h-3 w-3 text-red-400" />
        </span>
      );
    default:
      return null;
  }
}

function MessageContent({
  message,
  t,
  isAgent,
  onOpenMedia,
}: {
  message: Message;
  t: ReturnType<typeof useTranslations>;
  /** Outbound bubbles sit on the primary fill — badges must invert. */
  isAgent: boolean;
  onOpenMedia?: (messageId: string) => void;
}) {
  // Passed to the media bubbles as a no-arg callback; `undefined` when the
  // parent wired up no viewer, which is what makes them non-clickable.
  const openMedia = onOpenMedia ? () => onOpenMedia(message.id) : undefined;

  switch (message.content_type) {
    case "text":
      return (
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content_text}
        </p>
      );

    case "image":
      return (
        <div>
          {message.media_url ? (
            <MediaImageBubble message={message} onOpen={openMedia} t={t} />
          ) : (
            <MediaUnavailable label={t("photo")} t={t} />
          )}
          {message.content_text && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "video":
      return (
        <div>
          {message.media_url ? (
            <MediaVideoBubble message={message} onOpen={openMedia} t={t} />
          ) : (
            <MediaUnavailable label={t("video")} t={t} />
          )}
          {message.content_text && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "audio":
      return (
        <div>
          {message.media_url ? (
            <MediaAudioBubble message={message} t={t} />
          ) : (
            <MediaUnavailable label={t("audio")} t={t} />
          )}
        </div>
      );

    case "document":
      if (!message.media_url) {
        return <MediaUnavailable label={message.content_text || t("document")} t={t} />;
      }
      return <MediaDocumentBubble message={message} t={t} />;

    case "template":
      // Templates are almost always outbound, where the bubble fill IS
      // `primary` — so the old `bg-primary/20 text-primary` chip was
      // primary-on-primary and invisible. Paired with a null
      // content_text (issue #483) that rendered a bubble with nothing
      // in it at all. Invert on the primary fill, and fall back to the
      // template's name when we have no stored body (legacy rows sent
      // before the fix).
      return (
        <div>
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
              isAgent
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/20 text-primary",
            )}
          >
            <LayoutTemplate className="h-3 w-3" />
            {t("template")}
          </span>
          {message.content_text ? (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">
              {message.content_text}
            </p>
          ) : (
            message.template_name && (
              <p className="mt-1 break-words text-sm italic opacity-80">
                {message.template_name}
              </p>
            )
          )}
        </div>
      );

    case "location":
      return (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{message.content_text || t("locationShared")}</span>
        </div>
      );

    case "interactive": {
      // Three cases share content_type='interactive':
      //  - OUTBOUND with payload (composer / automation / Flow send after
      //    migration 035): render the buttons/list as they appear on the phone.
      //  - INBOUND tap (customer chose an option, sender_type='customer'):
      //    no payload; show the tapped option's title with a reply affordance
      //    so agents can tell it's a tap, not the customer typing.
      //  - OUTBOUND with NO payload (legacy bot/Flow sends from before
      //    migration 035 backfilled the column): show the body text plainly —
      //    it is our own message, NOT a customer tap.
      if (message.interactive_payload) {
        return <InteractivePreview payload={message.interactive_payload} />;
      }
      if (message.sender_type === "customer") {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <CornerDownLeft className="h-3 w-3" />
              {t("buttonReply")}
            </span>
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content_text || t("interactiveReply")}
            </p>
          </div>
        );
      }
      return (
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content_text || t("interactiveReply")}
        </p>
      );
    }

    default:
      return (
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content_text || t("unsupported")}
        </p>
      );
  }
}

export function MessageBubble({
  message,
  reply,
  reactions,
  currentUserId,
  onToggleReaction,
  onOpenMedia,
  onOpenTemplates,
  senderProfile,
}: MessageBubbleProps) {
  const t = useTranslations("Inbox.bubble");

  const parsed = useMemo(
    () => parseSenderSignature(message.content_text),
    [message.content_text]
  );

  const displayMessage = useMemo(() => {
    if (parsed.senderName && parsed.cleanText) {
      return { ...message, content_text: parsed.cleanText };
    }
    return message;
  }, [message, parsed]);

  const senderName =
    message.sender_name ||
    senderProfile?.full_name ||
    parsed.senderName;

  const rawRole =
    message.sender_role ||
    senderProfile?.account_role ||
    parsed.senderRole;

  const roleLabel = rawRole ? formatRoleLabel(rawRole) : null;

  const isAgent = message.sender_type === "agent" || message.sender_type === "bot";
  const time = format(new Date(message.created_at), "HH:mm");
  const failure = isAgent ? failureReason(message) : null;

  // Row alignment + width cap are owned by <MessageActions> so its hover
  // group matches the bubble's content area, not the full row.
  return (
    <div
      className={cn(
        "flex flex-col",
        isAgent ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "relative rounded-2xl px-3 py-2",
          isAgent
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {reply && (
          <ReplyQuote
            authorLabel={reply.authorLabel}
            preview={reply.preview}
            onPrimary={isAgent}
          />
        )}
        <MessageContent
          message={displayMessage}
          t={t}
          isAgent={isAgent}
          onOpenMedia={onOpenMedia}
        />

        {isAgent && !message.ai_generated && (senderName || roleLabel) ? (
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-primary-foreground/15 pt-1 text-[11px] leading-tight text-primary-foreground/90">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate max-w-[150px] font-medium opacity-95">
                {senderName || "Team"}
              </span>
              {roleLabel && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    rawRole?.toLowerCase() === "owner"
                      ? "bg-amber-400/25 text-amber-200 border border-amber-300/30"
                      : rawRole?.toLowerCase() === "admin"
                        ? "bg-sky-400/25 text-sky-200 border border-sky-300/30"
                        : "bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/25"
                  )}
                >
                  {rawRole?.toLowerCase() === "owner" && (
                    <Crown className="h-2.5 w-2.5 mr-0.5 text-amber-300" />
                  )}
                  {rawRole?.toLowerCase() === "admin" && (
                    <Shield className="h-2.5 w-2.5 mr-0.5 text-sky-300" />
                  )}
                  {rawRole?.toLowerCase() !== "owner" &&
                    rawRole?.toLowerCase() !== "admin" && (
                      <User className="h-2.5 w-2.5 mr-0.5 opacity-80" />
                    )}
                  {roleLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <span className="text-[10px] text-primary-foreground/75">
                {time}
              </span>
              <StatusIcon status={message.status} title={failure} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "mt-1 flex items-center gap-1",
              isAgent ? "justify-end" : "justify-start",
            )}
          >
            {message.ai_generated && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full bg-primary-foreground/20 px-1.5 py-px text-[9px] font-semibold uppercase leading-none tracking-wide text-primary-foreground"
                title={t("aiBadgeTitle")}
              >
                <Sparkles className="h-2.5 w-2.5" />
                {t("aiBadge")}
              </span>
            )}
            <span
              className={cn(
                "text-[10px]",
                isAgent ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {time}
            </span>
            {isAgent && <StatusIcon status={message.status} title={failure} />}
          </div>
        )}
      </div>
      {failure && (
        <div className="mt-1 space-y-0.5">
          <p
            className="px-1 text-[11px] leading-tight text-destructive font-medium flex items-center gap-1 flex-wrap"
            title={failure}
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>
              {(() => {
                const fullText = failure.startsWith(t("notDelivered"))
                  ? failure
                  : `${t("notDelivered")}: ${failure}`;
                const urlMatch = fullText.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                  const url = urlMatch[0];
                  const beforeUrl = fullText.replace(url, "").trim();
                  return (
                    <>
                      <span>{beforeUrl}</span>{" "}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold text-red-300 hover:text-white"
                      >
                        [Click to Pay / Resolve on Meta] ↗
                      </a>
                    </>
                  );
                }
                return fullText;
              })()}
            </span>
          </p>
        </div>
      )}
      {reactions && reactions.length > 0 && onToggleReaction && (
        <MessageReactions
          reactions={reactions}
          currentUserId={currentUserId}
          onToggle={onToggleReaction}
        />
      )}
    </div>
  );
}
