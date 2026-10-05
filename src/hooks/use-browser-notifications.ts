"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";
import {
  DEFAULT_NOTIFICATION_LABELS,
  buildNotificationContent,
  conversationHref,
  getNotificationPermission,
  pickContactDisplayName,
  readBrowserNotifyPref,
  subscribeBrowserNotifyPref,
  viewedConversationFromLocation,
  DEDUPE_WINDOW_MS,
  type NotificationLabels,
} from "@/lib/notifications/browser-notify";
import {
  initAudioUnlock,
  playLoudNotificationSound,
  startTitleFlash,
} from "@/lib/notifications/sound";

const serverSnapshot = () => true;

/**
 * The device-scoped "browser notifications" opt-in, kept in sync with
 * localStorage across this tab (settings toggle) and other tabs.
 */
export function useBrowserNotifyPref(): boolean {
  return useSyncExternalStore(
    subscribeBrowserNotifyPref,
    readBrowserNotifyPref,
    serverSnapshot,
  );
}

/**
 * Global Loud Audio & Desktop Notifications for new inbound customer messages.
 * Mounts ONCE in dashboard-shell so alerts fire on every page (Inbox, Contacts, Dashboard, etc.).
 *
 * Features:
 * - High-volume, loud WhatsApp incoming chime via Web Audio API.
 * - Native PC / Desktop Notification (with requireInteraction: true so it stays visible on Windows/Mac).
 * - Flashing browser tab title ("🔔 New WhatsApp Message!") when user is in another tab or app.
 * - On-screen rich interactive toast with 1-click "Open Chat" button.
 */
export function useBrowserNotifications(): void {
  const enabled = useBrowserNotifyPref();
  const router = useRouter();
  const t = useTranslations("Settings.browserNotifications.labels");

  // Translated labels, read inside the async Realtime callback
  const labelsRef = useRef<NotificationLabels>(DEFAULT_NOTIFICATION_LABELS);
  useEffect(() => {
    labelsRef.current = {
      fallbackTitle: t("fallbackTitle"),
      image: t("image"),
      audio: t("audio"),
      video: t("video"),
      document: t("document"),
      location: t("location"),
      template: t("template"),
    };
  });

  // Message ids already handled, for replay dedupe
  const seenRef = useRef<Map<string, number>>(new Map());

  // Initialize audio context unlocking on user's first click/touch
  useEffect(() => {
    initAudioUnlock();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    let cancelled = false;

    const handleInboundMessage = async (msg: Message) => {
      // 1. Play LOUD audio notification chime immediately
      try {
        playLoudNotificationSound();
      } catch (err) {
        console.warn("[useBrowserNotifications] sound error:", err);
      }

      // 2. Fetch contact info for notification text
      const { data } = await supabase
        .from("conversations")
        .select("contact:contacts(name, wa_username, phone)")
        .eq("id", msg.conversation_id)
        .maybeSingle();

      if (cancelled) return;

      const contact = (data as {
        contact?: { name?: string | null; wa_username?: string | null; phone?: string | null } | null;
      } | null)?.contact;

      const displayName = pickContactDisplayName(contact);
      const { title, body } = buildNotificationContent(
        msg,
        displayName,
        labelsRef.current,
      );

      const isDocumentActive =
        typeof document !== "undefined" &&
        document.visibilityState === "visible" &&
        document.hasFocus();

      const viewingConv = viewedConversationFromLocation(
        window.location.pathname,
        window.location.search,
      );

      const isViewingThisConversation =
        isDocumentActive && viewingConv === msg.conversation_id;

      // If user is NOT actively focused on this exact conversation:
      if (!isViewingThisConversation) {
        // A. Flash the browser tab title
        startTitleFlash(displayName || undefined);

        // B. Show On-Screen Rich Toast
        toast(`💬 ${title}`, {
          description: body,
          duration: 8000,
          action: {
            label: "Open Chat",
            onClick: () => {
              window.focus();
              router.push(conversationHref(msg.conversation_id));
            },
          },
        });

        // C. Show Native PC Desktop Notification
        if (getNotificationPermission() === "granted") {
          try {
            const notification = new Notification(title, {
              body,
              tag: msg.conversation_id,
              icon: "/icon",
              // requireInteraction ensures notification stays on PC screen until user clicks/dismisses
              requireInteraction: true,
            });

            notification.onclick = () => {
              window.focus();
              router.push(conversationHref(msg.conversation_id));
              notification.close();
            };
          } catch (err) {
            console.error("[useBrowserNotifications] desktop notify error:", err);
          }
        }
      }
    };

    const channel = supabase
      .channel("browser-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (!msg || msg.sender_type !== "customer") return;

          // Deduplicate within window
          const now = Date.now();
          for (const [id, at] of seenRef.current) {
            if (now - at > DEDUPE_WINDOW_MS) seenRef.current.delete(id);
          }
          if (seenRef.current.has(msg.id)) return;
          seenRef.current.set(msg.id, now);

          void handleInboundMessage(msg);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [enabled, router]);
}
