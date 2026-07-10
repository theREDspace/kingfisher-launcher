import { useState } from "react";
import { cn } from "@/lib/utils";
import { EdgeToggleTab } from "@/components/panels/EdgeToggleTab";
import { PanelHeader } from "@/components/panels/PanelHeader";

const REMOTE_MODELS = [
  { value: "XR-15", label: "XR-15", image: "/xr-15.png" },
  { value: "XR-16", label: "XR-16", image: "/xr16.png" },
  { value: "XR-100", label: "XR-100", image: "/xr-100.png" },
] as const;

export function RemotePanel() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("XR-15");

  const remote = REMOTE_MODELS.find((r) => r.value === model) ?? REMOTE_MODELS[0];

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-0 right-0 z-35 flex h-screen items-center transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-[300px]",
      )}
    >
      <EdgeToggleTab
        side="right"
        label="Remote"
        open={open}
        onClick={() => setOpen((v) => !v)}
      />
      <div className="pointer-events-auto flex h-screen w-[300px] flex-col border-l border-border bg-white shadow-[-24px_0_60px_-30px_rgb(31_43_50_/_40%)]">
        <PanelHeader
          title="Remote control"
          subtitle="Select a remote model"
          onClose={() => setOpen(false)}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="h-11 w-full shrink-0 rounded-control border border-border bg-white px-3.5 text-sm font-semibold text-navy outline-ring/50"
          >
            {REMOTE_MODELS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1.5px]">
              <span className="text-[13px] font-bold tracking-wide text-navy uppercase">
                Coming Soon
              </span>
            </div>
            <img
              src={remote.image}
              alt={`${remote.label} remote`}
              className="w-50 max-h-full object-contain opacity-70"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
