"use client";

import { useState, type ReactNode } from "react";
import { Check, CheckSquare, CornerUpLeft, Copy, SmilePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Message } from "@/types";
import { useTranslations } from "next-intl";
import { DeleteMessageDialog } from "./delete-message-dialog";

// WhatsApp's own quick-reaction bar starts with these six.
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageActionsProps {
  message: Message;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete?: (messageId: string, scope: "me" | "everyone") => void;
  onSelect?: (messageId: string) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  children: ReactNode;
}

/**
 * Hover/long-press toolbar wrapper around a `<MessageBubble>`.
 * Supports reactions, replies, copy, message selection, and
 * WhatsApp-styled "Delete message?" popup with "Delete for everyone" and "Delete for me".
 */
export function MessageActions({
  message,
  onReply,
  onReact,
  onDelete,
  onSelect,
  isSelected = false,
  isSelectionMode = false,
  children,
}: MessageActionsProps) {
  const t = useTranslations("Inbox.actions");

  const [touchOpen, setTouchOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAgent =
    message.sender_type === "agent" || message.sender_type === "bot";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouchOpen(true);
  };

  const handleCopy = async () => {
    const text = message.content_text ?? "";
    if (!text) {
      toast.error(t("nothingToCopy"));
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
    setTouchOpen(false);
  };

  const handlePickEmoji = (emoji: string) => {
    onReact(emoji);
    setPickerOpen(false);
    setTouchOpen(false);
  };

  const handleReply = () => {
    onReply();
    setTouchOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex w-full items-center gap-3 transition-colors",
          isSelectionMode && "cursor-pointer select-none",
          isAgent ? "justify-end" : "justify-start",
        )}
        onClick={isSelectionMode ? () => onSelect?.(message.id) : undefined}
        onContextMenu={handleContextMenu}
        onBlur={() => setTouchOpen(false)}
      >
        {/* Selection checkbox when in multi-select mode */}
        {isSelectionMode && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(message.id);
            }}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 cursor-pointer transition-all",
              isSelected
                ? "bg-[#00a884] border-[#00a884] text-white"
                : "border-[#8696a0]/70 bg-transparent hover:border-white",
            )}
          >
            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </div>
        )}

        <div className="group/actions relative min-w-0 max-w-[75%]">
          {children}

          {!isSelectionMode && (
            <div
              data-touch-open={touchOpen || pickerOpen ? "true" : undefined}
              className={cn(
                "absolute -top-3 z-10 flex h-7 items-center gap-0.5 rounded-full border border-border bg-popover/95 px-1 shadow-md backdrop-blur-sm transition-opacity",
                "opacity-0 group-hover/actions:opacity-100 group-focus-within/actions:opacity-100",
                "data-[touch-open=true]:opacity-100",
                isAgent ? "right-3" : "left-3",
              )}
            >
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger
                  className="flex h-5 w-5 items-center justify-center rounded-full text-popover-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t("react")}
                >
                  <SmilePlus className="h-3.5 w-3.5" />
                </PopoverTrigger>
                <PopoverContent
                  className="flex w-auto flex-row gap-1 p-1.5"
                  sideOffset={6}
                >
                  {QUICK_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => handlePickEmoji(e)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-transform hover:scale-125 hover:bg-muted"
                      aria-label={t("reactWith", { emoji: e })}
                    >
                      {e}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <button
                type="button"
                onClick={handleReply}
                className="flex h-5 w-5 items-center justify-center rounded-full text-popover-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("reply")}
                title={t("reply")}
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex h-5 w-5 items-center justify-center rounded-full text-popover-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("copyText")}
                title={t("copyText")}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>

              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(message.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-popover-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Select message"
                  title="Select message"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteDialogOpen(true);
                    setTouchOpen(false);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-popover-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t("delete")}
                  title={t("delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp-style delete popup */}
      <DeleteMessageDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteForEveryone={() => onDelete?.(message.id, "everyone")}
        onDeleteForMe={() => onDelete?.(message.id, "me")}
      />
    </>
  );
}
