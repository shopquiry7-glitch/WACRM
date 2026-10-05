'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  ShieldCheck,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  getNotificationPermission,
  writeBrowserNotifyPref,
  readBrowserNotifyPref,
  type BrowserNotifyPermission,
} from '@/lib/notifications/browser-notify';
import {
  isSoundEnabled,
  setSoundEnabled,
  getSoundVolume,
  setSoundVolume,
  getSoundTheme,
  setSoundTheme,
  playLoudNotificationSound,
  SOUND_CHANGE_EVENT,
  type SoundTheme,
} from '@/lib/notifications/sound';

export function NotificationSoundPopover() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolumeState] = useState(1.8);
  const [theme, setThemeState] = useState<SoundTheme>('iphone_note');
  const [permission, setPermission] = useState<BrowserNotifyPermission>('default');
  const [desktopPref, setDesktopPref] = useState(true);

  const refreshState = () => {
    setSoundOn(isSoundEnabled());
    setVolumeState(getSoundVolume());
    setThemeState(getSoundTheme());
    setPermission(getNotificationPermission());
    setDesktopPref(readBrowserNotifyPref());
  };

  useEffect(() => {
    refreshState();
    window.addEventListener(SOUND_CHANGE_EVENT, refreshState);
    window.addEventListener('focus', refreshState);
    return () => {
      window.removeEventListener(SOUND_CHANGE_EVENT, refreshState);
      window.removeEventListener('focus', refreshState);
    };
  }, []);

  const handleTestSound = () => {
    playLoudNotificationSound(theme, volume);
    toast.success('🔊 Playing loud iPhone notification chime!', {
      description: `Tone: ${
        theme === 'iphone_tritone'
          ? 'iPhone Tri-tone'
          : theme === 'iphone_note'
          ? 'iPhone Note'
          : theme === 'iphone_ding'
          ? 'iPhone Ding'
          : 'WhatsApp Web'
      } (${Math.round(volume * 100)}% volume)`,
    });
  };

  const handleTestDesktopNotification = () => {
    if (permission !== 'granted') {
      toast.error('Desktop notifications not granted', {
        description: 'Please click "Enable PC Notifications" first.',
      });
      return;
    }

    try {
      const n = new Notification('💬 New WhatsApp Message', {
        body: 'Client: Hello! Testing iPhone message notification.',
        icon: '/icon',
        tag: 'wacrm-test',
        requireInteraction: true,
      });
      playLoudNotificationSound(theme, volume);
      n.onclick = () => {
        window.focus();
        n.close();
      };
      toast.success('Test desktop notification sent to your PC!');
    } catch (e) {
      toast.error('Failed to show notification');
    }
  };

  const handleRequestPermission = async () => {
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        writeBrowserNotifyPref(true);
        setDesktopPref(true);
        playLoudNotificationSound(theme, volume);
        toast.success('PC Desktop notifications enabled!');
      } else {
        toast.error('Permission was not granted');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    setSoundOn(val);
    if (val) {
      playLoudNotificationSound(theme, volume);
    }
  };

  const handleVolumeSelect = (newVol: number) => {
    setSoundVolume(newVol);
    setVolumeState(newVol);
    playLoudNotificationSound(theme, newVol);
  };

  const handleThemeSelect = (newTheme: SoundTheme) => {
    setSoundTheme(newTheme);
    setThemeState(newTheme);
    playLoudNotificationSound(newTheme, volume);
    toast.success(`Selected tone: ${newTheme.replace('_', ' ').toUpperCase()}`);
  };

  const isFullyActive = soundOn && permission === 'granted' && desktopPref;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none cursor-pointer"
            title="Notification Sound & PC Alerts"
          />
        }
      >
        {soundOn ? (
          <Bell className="size-4.5 text-foreground" />
        ) : (
          <VolumeX className="size-4.5 text-muted-foreground" />
        )}
        {/* Status Dot */}
        <span
          className={`absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-background ${
            isFullyActive
              ? 'bg-[#00a884]'
              : soundOn
              ? 'bg-amber-500'
              : 'bg-muted-foreground'
          }`}
        />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-84 p-4 space-y-3.5 shadow-xl border border-border bg-popover text-popover-foreground"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <BellRing className="size-4.5 text-[#00a884]" />
            <h3 className="font-semibold text-sm">PC Alerts & iPhone Sound</h3>
          </div>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              isFullyActive
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}
          >
            {isFullyActive ? 'Active' : 'Attention'}
          </span>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Volume2 className="size-3.5 text-[#00a884]" />
              Loud Audio Chime
            </span>
            <p className="text-[11px] text-muted-foreground">
              Plays loud sound when customer messages
            </p>
          </div>
          <Switch
            checked={soundOn}
            onCheckedChange={handleSoundToggle}
            aria-label="Toggle loud sound"
          />
        </div>

        {/* Tone Selector */}
        {soundOn && (
          <div className="space-y-1.5 pt-0.5">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Smartphone className="size-3 text-[#00a884]" />
                Message Tune:
              </span>
              <span className="text-[#00a884] font-semibold text-[10px]">
                {theme === 'iphone_note'
                  ? 'Apple Note (Default)'
                  : theme === 'iphone_tritone'
                  ? 'Apple Tri-tone'
                  : theme === 'iphone_ding'
                  ? 'Apple Ding'
                  : 'WhatsApp'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'iphone_note', label: '🍏 iPhone Note', sub: 'Apple Default Note' },
                { id: 'iphone_tritone', label: '🍏 iPhone Tri-Tone', sub: 'Classic Marimba' },
                { id: 'iphone_ding', label: '🍏 iPhone Ding', sub: 'Crystal Glass' },
                { id: 'whatsapp', label: '💬 WhatsApp Web', sub: 'Classic 2-tone' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleThemeSelect(item.id as SoundTheme)}
                  className={`p-1.5 rounded text-left transition-colors cursor-pointer border ${
                    theme === item.id
                      ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884]'
                      : 'bg-muted/40 hover:bg-muted border-border text-foreground'
                  }`}
                >
                  <p className="text-[11px] font-semibold leading-tight">{item.label}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Volume Level Preset Buttons */}
        {soundOn && (
          <div className="space-y-1.5 pt-0.5">
            <label className="text-[11px] font-medium text-muted-foreground">
              Sound Volume Level:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Normal 100%', val: 1.0 },
                { label: 'Loud 180%', val: 1.8 },
                { label: 'Max 220%', val: 2.2 },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => handleVolumeSelect(lvl.val)}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                    Math.abs(volume - lvl.val) < 0.1
                      ? 'bg-[#00a884] text-white border-[#00a884]'
                      : 'bg-muted/50 hover:bg-muted border-border text-foreground'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Permission Status */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2">
          <div className="flex items-start gap-2">
            {permission === 'granted' ? (
              <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-medium text-foreground">
                {permission === 'granted'
                  ? 'PC Desktop Notifications On'
                  : 'Desktop Notifications Disabled'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {permission === 'granted'
                  ? 'Notifications stay on your PC screen even when minimized.'
                  : 'Enable permission to see popups on Windows/Mac.'}
              </p>
            </div>
          </div>

          {permission !== 'granted' && (
            <Button
              size="sm"
              onClick={handleRequestPermission}
              className="w-full h-7 text-xs bg-[#00a884] hover:bg-[#00a884]/90 text-white cursor-pointer font-medium"
            >
              Enable PC Notifications Now
            </Button>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestSound}
            className="h-8 text-xs gap-1.5 cursor-pointer text-foreground"
          >
            <Play className="size-3 text-[#00a884]" />
            Test iPhone Note
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleTestDesktopNotification}
            disabled={permission !== 'granted'}
            className="h-8 text-xs gap-1.5 cursor-pointer text-foreground"
          >
            <Bell className="size-3 text-[#00a884]" />
            Test PC Popup
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
