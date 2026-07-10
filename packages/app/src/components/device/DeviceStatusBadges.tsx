import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/lib/device-client";

interface DeviceStatusBadgesProps {
  device: Pick<Device, "online" | "locked">;
  size?: "sm" | "md";
}

export function DeviceStatusBadges({ device, size = "md" }: DeviceStatusBadgesProps) {
  if (device.online === undefined && device.locked === undefined) return null;

  const sizing =
    size === "md"
      ? { height: "h-7.5", padding: "px-3", text: "text-[12.5px]", dot: "h-1.75 w-1.75", icon: 13 }
      : { height: "h-6", padding: "px-2.25", text: "text-[11.5px]", dot: "h-1.5 w-1.5", icon: 11 };

  return (
    <div className="flex gap-1.5">
      {device.online !== undefined &&
        (device.online ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.75 rounded-lg border border-success-border bg-success-bg font-bold text-success-foreground",
              sizing.height,
              sizing.padding,
              sizing.text,
            )}
          >
            <span className={cn("rounded-full bg-success", sizing.dot)} />
            Online
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1.75 rounded-lg border border-neutral-border bg-neutral-bg font-bold text-muted-foreground-strong",
              sizing.height,
              sizing.padding,
              sizing.text,
            )}
          >
            <span className={cn("rounded-full bg-muted-foreground", sizing.dot)} />
            Offline
          </span>
        ))}

      {device.locked !== undefined &&
        (device.locked ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.75 rounded-lg border border-warning-border bg-warning-bg font-bold text-warning-foreground",
              sizing.height,
              sizing.padding,
              sizing.text,
            )}
          >
            <Lock size={sizing.icon} strokeWidth={2.4} />
            Locked
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1.75 rounded-lg border border-neutral-border bg-neutral-bg font-bold text-neutral-foreground",
              sizing.height,
              sizing.padding,
              sizing.text,
            )}
          >
            <LockOpen size={sizing.icon} strokeWidth={2.4} />
            Unlocked
          </span>
        ))}
    </div>
  );
}
