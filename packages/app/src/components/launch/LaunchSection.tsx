import { useEffect, useId, useRef, useState } from "react";
import { Check, Play, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SavedTargetsMenu } from "@/components/launch/SavedTargetsMenu";
import { PresetFormModal, type PresetFormDraft } from "@/components/launch/PresetFormModal";
import { useDeviceClient } from "@/lib/useDeviceClient";
import { useOrgStore } from "@/store/OrgStoreContext";
import { usePresetStore } from "@/store/PresetStoreContext";
import type { Device } from "@/lib/device-client";
import type { Preset } from "@/store/preset-storage";

interface LaunchSectionProps {
  device: Device | null;
  url: string;
  appId: string;
  onUrlChange: (value: string) => void;
  onAppIdChange: (value: string) => void;
  onRefreshAlive?: () => void;
}

const EMPTY_DRAFT: PresetFormDraft = { name: "", url: "", appId: "" };

export function LaunchSection({ device, url, appId, onUrlChange, onAppIdChange, onRefreshAlive }: LaunchSectionProps) {
  const { selectedOrg } = useOrgStore();
  const { presets, addPreset, updatePreset, deletePreset } = usePresetStore();
  const deviceClient = useDeviceClient();

  const urlId = useId();
  const appIdId = useId();
  const [launching, setLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const launchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(launchTimeout.current);
  }, []);

  const [presetFormOpen, setPresetFormOpen] = useState(false);
  const [presetFormDraft, setPresetFormDraft] = useState<PresetFormDraft>(EMPTY_DRAFT);

  const orgName = selectedOrg ? selectedOrg.name : "No organization";
  const currentPresets = selectedOrg
    ? presets.filter((p) => p.orgId === selectedOrg.id)
    : [];

  function clearLaunchMessage(nextTimeout?: ReturnType<typeof setTimeout>) {
    clearTimeout(launchTimeout.current);
    launchTimeout.current = nextTimeout;
  }

  function handleUrlChange(value: string) {
    onUrlChange(value);
    setLaunchMessage(null);
    setLaunchError(null);
  }

  function handleAppIdChange(value: string) {
    onAppIdChange(value);
    setLaunchMessage(null);
    setLaunchError(null);
  }

  async function handleLaunch() {
    if (!device || !selectedOrg) return;
    if (!url.trim() && !appId.trim()) {
      setLaunchMessage(null);
      setLaunchError("Enter a URL or App ID to launch.");
      return;
    }
    setLaunching(true);
    setLaunchError(null);
    setLaunchMessage(null);
    clearLaunchMessage(); // drop any pending auto-dismiss from a prior launch
    onRefreshAlive?.();
    try {
      const result = await deviceClient.launchApp(selectedOrg, device, url, appId);
      setLaunchMessage(result.message);
      clearLaunchMessage(setTimeout(() => setLaunchMessage(null), 3000));
      onRefreshAlive?.();
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : "Launch failed. Please try again.");
    } finally {
      setLaunching(false);
    }
  }

  function applyPreset(preset: Preset) {
    onUrlChange(preset.url);
    onAppIdChange(preset.appId);
    setLaunchMessage(null);
    setLaunchError(null);
  }

  function openSaveCurrentAsTarget() {
    setPresetFormDraft({ name: "", url, appId });
    setPresetFormOpen(true);
  }

  function openEditPreset(preset: Preset) {
    setPresetFormDraft({ id: preset.id, name: preset.name, url: preset.url, appId: preset.appId });
    setPresetFormOpen(true);
  }

  function handleSavePreset(id: string | undefined, values: { name: string; url: string; appId: string }) {
    if (!selectedOrg) return;
    if (id) {
      updatePreset(id, { orgId: selectedOrg.id, ...values });
    } else {
      addPreset({ orgId: selectedOrg.id, ...values });
    }
    setPresetFormOpen(false);
  }

  const launchDisabled = !device || launching;

  return (
    <div className="rounded-card border border-border bg-white px-7 pt-6 pb-6.5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Launch target
        </div>
        <SavedTargetsMenu
          presets={currentPresets}
          orgName={orgName}
          onApply={applyPreset}
          onEdit={openEditPreset}
          onDelete={deletePreset}
          onSaveCurrent={openSaveCurrentAsTarget}
        />
      </div>

      <div className="grid grid-cols-[1fr_220px] gap-3.5">
        <div>
          <label htmlFor={urlId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            URL
          </label>
          <Input
            id={urlId}
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://app.example.com"
            className="h-11 rounded-control border-border px-3.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor={appIdId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            App ID
          </label>
          <Input
            id={appIdId}
            value={appId}
            onChange={(e) => handleAppIdChange(e.target.value)}
            placeholder="com.example.app"
            className="h-11 rounded-control border-border px-3.5 text-sm tabular-nums"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="text-[12.5px] text-muted-foreground">
          {device ? `Ready to launch on ${device.name}` : "Select a device to enable launch"}
        </div>
        <button
          type="button"
          disabled={launchDisabled}
          onClick={handleLaunch}
          className={cn(
            "flex h-11.5 items-center gap-2.25 rounded-xl px-6 text-[15px] font-bold transition-colors",
            launchDisabled
              ? "cursor-not-allowed bg-neutral-bg text-muted-foreground"
              : "bg-primary text-white shadow-[0_12px_26px_-10px_rgb(235_22_30_/_60%)] hover:bg-primary-hover",
          )}
        >
          <Play size={17} strokeWidth={2.2} />
          {launching ? "Launching…" : "Launch"}
        </button>
      </div>

      {launchMessage && (
        <div className="mt-3.5 flex items-center gap-2.25 rounded-control border border-success-border bg-success-bg px-3.5 py-2.75 text-[13px] font-semibold text-success-foreground">
          <Check size={16} strokeWidth={2.4} />
          {launchMessage}
        </div>
      )}

      {launchError && (
        <div className="mt-3.5 flex items-center gap-2.25 rounded-control border border-destructive-border bg-destructive-bg px-3.5 py-2.75 text-[13px] font-semibold text-primary">
          <TriangleAlert size={16} strokeWidth={2.4} />
          {launchError}
        </div>
      )}

      <PresetFormModal
        open={presetFormOpen}
        onOpenChange={setPresetFormOpen}
        draft={presetFormDraft}
        orgName={orgName}
        onSave={handleSavePreset}
      />
    </div>
  );
}
