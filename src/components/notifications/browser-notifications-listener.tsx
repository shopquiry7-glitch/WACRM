"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import {
  BROWSER_NOTIFY_STORAGE_KEY,
  getNotificationPermission,
  writeBrowserNotifyPref,
} from "@/lib/notifications/browser-notify";
import {
  initAudioUnlock,
  playLoudNotificationSound,
  SOUND_THEME_STORAGE_KEY,
} from "@/lib/notifications/sound";

/**
 * Headless notification manager. Mounted ONCE per signed-in dashboard tab.
 * - Handles Realtime incoming message listener with loud audio chimes + desktop notifications.
 * - Auto-initializes notification preference to enabled.
 * - Prompts user to enable PC desktop notifications if permission is default.
 */
export function BrowserNotificationsListener() {
  useBrowserNotifications();
  const promptedRef = useRef(false);

  useEffect(() => {
    // 1. Unlock AudioContext on first click/key/touch
    initAudioUnlock();

    // 2. Auto-enable notification preference and set default tone to iphone_note
    try {
      if (typeof window !== "undefined") {
        if (window.localStorage.getItem(BROWSER_NOTIFY_STORAGE_KEY) === null) {
          writeBrowserNotifyPref(true);
        }
        const currentTheme = window.localStorage.getItem(SOUND_THEME_STORAGE_KEY);
        if (!currentTheme || currentTheme === "iphone_tritone") {
          window.localStorage.setItem(SOUND_THEME_STORAGE_KEY, "iphone_note");
        }
      }
    } catch {}

    // 3. Proactively prompt for PC Notification permission if still 'default'
    if (typeof window !== "undefined" && "Notification" in window && !promptedRef.current) {
      promptedRef.current = true;
      const perm = getNotificationPermission();

      if (perm === "default") {
        // Delay slightly so dashboard finishes loading
        const timer = setTimeout(() => {
          toast("🔔 Enable PC WhatsApp Notifications?", {
            description: "Get loud sound alerts and desktop notifications whenever a customer messages you.",
            action: {
              label: "Enable Now",
              onClick: async () => {
                try {
                  const res = await Notification.requestPermission();
                  if (res === "granted") {
                    writeBrowserNotifyPref(true);
                    playLoudNotificationSound();
                    toast.success("Desktop notifications & loud sound activated!");
                  } else {
                    toast.error("Notification permission denied in browser.");
                  }
                } catch (e) {
                  console.error("Failed to request notification permission:", e);
                }
              },
            },
            duration: 12000,
          });
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  return null;
}
