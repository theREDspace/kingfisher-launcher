import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EdgeToggleTab } from "@/components/panels/EdgeToggleTab";
import { PanelHeader } from "@/components/panels/PanelHeader";
import { ScreenFrame, type ScreenState } from "@/components/panels/ScreenFrame";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDeviceClient } from "@/lib/useDeviceClient";
import { useOrgStore } from "@/store/OrgStoreContext";
import type { Device } from "@/lib/device-client";
import type { AliveState } from "@/lib/useDeviceAlive";

interface ScreenPreviewPanelProps {
  device: Device | null;
  alive: AliveState;
}

export function ScreenPreviewPanel({ device, alive }: ScreenPreviewPanelProps) {
  const { selectedOrg } = useOrgStore();
  const deviceClient = useDeviceClient();
  const [open, setOpen] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>("empty");
  const [captureTime, setCaptureTime] = useState<string | null>(null);
  const [captureImage, setCaptureImage] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [expandedOpen, setExpandedOpen] = useState(false);
  const deviceIdRef = useRef(device?.id);
  deviceIdRef.current = device?.id;

  // A capture belongs to whichever device it was taken from — clear it once that device changes.
  useEffect(() => {
    setScreenState("empty");
    setCaptureTime(null);
    setCaptureImage(null);
    setCaptureError(null);
  }, [device?.id]);

  const isOffline = alive.status === "ready" && !alive.alive.online;

  async function refreshScreen() {
    if (!device || !selectedOrg) return;
    const requestedDeviceId = device.id;
    setScreenState("loading");
    setCaptureError(null);
    try {
      const result = await deviceClient.captureScreen(selectedOrg, device);
      if (deviceIdRef.current !== requestedDeviceId) return;
      setCaptureTime(result.capturedAt);
      setCaptureImage(result.image ?? null);
      setScreenState("ready");
    } catch (err) {
      if (deviceIdRef.current !== requestedDeviceId) return;
      setCaptureError(err instanceof Error ? err.message : "Capture failed. Please try again.");
      setScreenState("error");
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-35 flex h-screen items-center transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-[360px]",
      )}
    >
      <div className="pointer-events-auto flex h-screen w-[360px] flex-col border-r border-border bg-white shadow-[24px_0_60px_-30px_rgb(31_43_50_/_40%)]">
        <PanelHeader
          title="Screen preview"
          subtitle="Live capture from device"
          onClose={() => setOpen(false)}
        />
        <div className="flex flex-1 flex-col gap-4 p-5">
          <ScreenFrame
            state={screenState}
            deviceName={device?.name ?? ""}
            captureTime={captureTime}
            captureImage={captureImage}
            error={captureError}
            onExpand={() => setExpandedOpen(true)}
          />

          {device ? (
            <button
              type="button"
              onClick={refreshScreen}
              disabled={screenState === "loading" || isOffline}
              className="flex h-11.5 items-center justify-center gap-2.25 rounded-xl bg-primary text-[14.5px] font-bold text-white shadow-[0_10px_22px_-10px_rgb(235_22_30_/_60%)] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} strokeWidth={2.2} />
              Refresh screen
            </button>
          ) : (
            <div className="flex h-11.5 items-center justify-center gap-2 rounded-xl bg-surface-muted text-[13px] font-semibold text-muted-foreground">
              Select a device to preview
            </div>
          )}
        </div>
      </div>
      <EdgeToggleTab
        side="left"
        label="Screen"
        open={open}
        onClick={() => setOpen((v) => !v)}
      />

      <Dialog open={expandedOpen} onOpenChange={setExpandedOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[90vh] max-h-[90vh] w-full max-w-[90vw] flex-col gap-0 rounded-[20px] bg-white p-0 ring-0 sm:max-w-[90vw]"
        >
          {captureImage && (
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6">
              <img
                src={`data:image/png;base64,${captureImage}`}
                alt={`Screen capture of ${device?.name ?? ""}`}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
              {screenState === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/20 border-t-primary" />
                </div>
              )}
            </div>
          )}

          <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={() => {
                refreshScreen();
              }}
              disabled={screenState === "loading" || isOffline}
              className="flex h-11 items-center gap-2.25 rounded-xl bg-primary px-5 text-[14px] font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} strokeWidth={2.2} />
              Refresh
            </button>

            {captureTime && (
              <span className="text-xs text-muted-foreground">
                Captured {captureTime}
              </span>
            )}

            <button
              type="button"
              onClick={() => setExpandedOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface-muted text-muted-foreground-strong hover:bg-surface-subtle"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
