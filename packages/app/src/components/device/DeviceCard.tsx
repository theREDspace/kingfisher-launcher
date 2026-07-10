import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, Plus, Tv } from "lucide-react";
import { DeviceLabels } from "@/components/device/DeviceLabels";
import { DeviceAliveIndicators } from "@/components/device/DeviceAliveIndicators";
import type { UseDeviceAliveResult } from "@/lib/useDeviceAlive";
import type { Device } from "@/lib/device-client";
import type { DeviceData } from "@/lib/kingfisher/types";

interface DeviceCardProps {
  device: Device | null;
  deviceDetails: DeviceData | null;
  alive: UseDeviceAliveResult;
  onOpenPicker: () => void;
}

export function DeviceCard({ device, deviceDetails, alive, onOpenPicker }: DeviceCardProps) {

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
      {device ? (
        <SelectedDevice device={device} deviceDetails={deviceDetails} alive={alive} onChangeDevice={onOpenPicker} />
      ) : (
        <EmptyDevice onOpenPicker={onOpenPicker} />
      )}
    </div>
  );
}

function EmptyDevice({ onOpenPicker }: { onOpenPicker: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-11 text-center">
      <div className="flex h-15 w-15 items-center justify-center rounded-2xl border border-border bg-surface-muted text-muted-foreground">
        <Monitor size={28} strokeWidth={1.8} />
      </div>
      <div>
        <div className="text-base font-bold text-navy">No device selected</div>
        <div className="mt-0.5 text-[13.5px] text-muted-foreground">
          Pick a target device to get started.
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenPicker}
        className="flex h-11 items-center gap-2 rounded-control bg-primary px-5 text-[14.5px] font-bold text-white shadow-[0_10px_22px_-10px_rgb(235_22_30_/_60%)] hover:bg-primary-hover"
      >
        <Plus size={17} strokeWidth={2.2} />
        Select Device
      </button>
    </div>
  );
}

function SelectedDevice({
  device,
  deviceDetails,
  alive,
  onChangeDevice,
}: {
  device: Device;
  deviceDetails: DeviceData | null;
  alive: UseDeviceAliveResult;
  onChangeDevice: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (showDetails && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipStyle({
        position: "fixed",
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2,
        transform: "translate(-50%, -50%)",
      });
    }
  }, [showDetails]);

  const deviceFields = deviceDetails?.device;
  const entries = deviceFields
    ? Object.entries(deviceFields).filter(([, v]) => v !== undefined && v !== null)
    : [];

  return (
    <div className="px-7 py-6.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            ref={iconRef}
            tabIndex={entries.length > 0 ? 0 : undefined}
            aria-label={entries.length > 0 ? "Show device details" : undefined}
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
            onFocus={() => setShowDetails(true)}
            onBlur={() => setShowDetails(false)}
            className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-2xl"
          >
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-soft text-white">
              <Monitor size={24} strokeWidth={1.8} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[19px] font-extrabold tracking-tight text-navy">
              {device.name}
            </div>
            <div className="mt-px text-[13px] text-muted-foreground tabular-nums">{device.id}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeDevice}
          className="flex h-9.5 shrink-0 items-center gap-1.75 rounded-control border border-border bg-white px-3.5 text-[13px] font-semibold text-navy"
        >
          <Tv size={15} strokeWidth={2} />
          Change device
        </button>
      </div>

      {device.labels.length > 0 && (
        <div className="mt-4.5">
          <DeviceLabels labels={device.labels} size="md" />
        </div>
      )}

      <div className="mt-4 flex justify-end border-t border-border-soft pt-4.5">
        <DeviceAliveIndicators
          state={alive.state}
          lockPending={alive.lockPending}
          onSetLock={alive.setLock}
        />
      </div>

      {showDetails && entries.length > 0 && createPortal(
        <div
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
          style={tooltipStyle}
          className="fixed z-50 max-w-[600px] rounded-xl border border-border bg-white/95 shadow-dropdown backdrop-blur-sm"
        >
          <table className="w-full table-auto text-left text-[11px]">
            <tbody>
              {Array.from(
                { length: Math.ceil(entries.length / 2) },
                (_, i) => entries.slice(i * 2, i * 2 + 2)
              ).map((pair, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border/50 last:border-0">
                  {pair.map(([key, value]) => (
                    <Fragment key={key}>
                      <td className="whitespace-nowrap px-3 py-1.5 font-medium text-navy">
                        {key}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">
                        {String(value)}
                      </td>
                    </Fragment>
                  ))}
                  {pair.length === 1 && (
                    <>
                      <td />
                      <td />
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
        document.body
      )}
    </div>
  );
}
