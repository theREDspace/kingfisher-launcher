import { Monitor, Play, TriangleAlert } from "lucide-react";

export type ScreenState = "empty" | "loading" | "ready" | "error";

interface ScreenFrameProps {
  state: ScreenState;
  deviceName: string;
  captureTime: string | null;
  captureImage?: string | null;
  error?: string | null;
  onExpand?: () => void;
}

export function ScreenFrame({ state, deviceName, captureTime, captureImage, error, onExpand }: ScreenFrameProps) {
  const showImage = captureImage && (state === "ready" || state === "loading");

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#0d1116] shadow-[0_18px_40px_-24px_rgb(31_43_50_/_50%),inset_0_0_0_6px_#1f2b32]">
      {state === "empty" && (
        <div className="flex flex-col items-center gap-2.5 p-5 text-center">
          <Monitor className="text-[#4b5a64]" size={34} strokeWidth={1.6} />
          <div className="text-[13px] font-semibold text-[#8b97a0]">No preview yet</div>
        </div>
      )}

      {state === "loading" && !captureImage && (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8.5 w-8.5 animate-spin rounded-full border-[3px] border-white/15 border-t-primary" />
          <div className="text-[12.5px] font-semibold text-[#8b97a0]">Capturing…</div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-2.5 p-5 text-center">
          <TriangleAlert className="text-warning-foreground" size={30} strokeWidth={1.8} />
          <div className="text-[13px] font-semibold text-[#8b97a0]">
            {error ?? "Capture failed"}
          </div>
        </div>
      )}

      {showImage && (
        <>
          <button
            type="button"
            onClick={onExpand}
            className="absolute inset-0 cursor-pointer"
          >
            <img
              src={`data:image/png;base64,${captureImage}`}
              alt={`Screen capture of ${deviceName}`}
              className="h-full w-full object-contain"
            />
          </button>
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-[#0d1116]/70 px-2 py-0.75 backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgb(34_163_79_/_25%)]" />
            <span className="text-[9.5px] font-bold text-white/80">Captured {captureTime}</span>
          </div>
          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <div className="h-8.5 w-8.5 animate-spin rounded-full border-[3px] border-white/20 border-t-primary" />
            </div>
          )}
        </>
      )}

      {state === "ready" && !captureImage && (
        <>
          <div className="absolute inset-0 flex flex-col bg-[radial-gradient(120%_90%_at_50%_0%,#223142_0%,#0d1116_70%)]">
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex items-center gap-1.75">
                <div className="flex h-5.5 w-5.5 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-hover">
                  <Play className="text-white" size={12} strokeWidth={2.4} />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-white">
                  {deviceName}
                </span>
              </div>
              <span className="text-[9px] font-bold tracking-wide text-white/50">HDMI 1</span>
            </div>
            <div className="grid flex-1 grid-cols-4 gap-2.25 px-3.5 pt-1.5 pb-3.5">
              <div className="col-span-2 rounded-lg bg-gradient-to-br from-primary to-[#a30f16] shadow-[inset_0_1px_0_rgb(255_255_255_/_15%)]" />
              <div className="rounded-lg bg-[#31404a]" />
              <div className="rounded-lg bg-[#31404a]" />
              <div className="rounded-lg bg-[#3a4b56]" />
              <div className="rounded-lg bg-[#3a4b56]" />
              <div className="rounded-lg bg-[#31404a]" />
              <div className="rounded-lg bg-[#31404a]" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-[#0d1116]/70 px-2 py-0.75 backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgb(34_163_79_/_25%)]" />
            <span className="text-[9.5px] font-bold text-white/80">Captured {captureTime}</span>
          </div>
        </>
      )}
    </div>
  );
}
