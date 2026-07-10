import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AliveState } from "@/lib/useDeviceAlive";

const PILL = "inline-flex h-7.5 items-center gap-1.75 rounded-lg border px-3 text-[12.5px] font-bold";
const NEUTRAL = "border-neutral-border bg-neutral-bg";

interface DeviceAliveIndicatorsProps {
  state: AliveState;
  lockPending: boolean;
  onSetLock: (locked: boolean) => void;
}

function Spinner() {
  return (
    <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground-strong" />
  );
}

const NOT_CONNECTED_TITLE =
  "Device is powered on but not connected. Device is likely not connected to a good XRE environment. Choose a different environment and reboot.";

function OnlineIndicator({ state }: { state: AliveState }) {
  if (state.status === "loading") {
    return (
      <span className={cn(PILL, NEUTRAL, "text-muted-foreground-strong")}>
        <Spinner />
        Checking…
      </span>
    );
  }
  if (state.status === "ready") {
    const { online, poweredOn } = state.alive;
    if (online) {
      return (
        <span
          title="Device is online and connected."
          className={cn(PILL, "border-success-border bg-success-bg text-success-foreground")}
        >
          <span className="h-1.75 w-1.75 rounded-full bg-success" />
          Online
        </span>
      );
    }
    // Powered on but not live — reachable hardware, no good XRE connection.
    if (poweredOn) {
      return (
        <span
          title={NOT_CONNECTED_TITLE}
          className={cn(PILL, "border-warning-border bg-warning-bg text-warning-foreground")}
        >
          <span className="h-1.75 w-1.75 rounded-full bg-warning-foreground" />
          No connection
        </span>
      );
    }
    return (
      <span
        title="Device is offline (powered off)."
        className={cn(PILL, NEUTRAL, "text-muted-foreground-strong")}
      >
        <span className="h-1.75 w-1.75 rounded-full bg-muted-foreground" />
        Offline
      </span>
    );
  }
  return (
    <span
      title="Couldn't determine device status."
      className={cn(PILL, NEUTRAL, "text-muted-foreground")}
    >
      <span className="h-1.75 w-1.75 rounded-full bg-muted-foreground/60" />
      Unknown
    </span>
  );
}

function LockIndicator({ state, lockPending, onSetLock }: DeviceAliveIndicatorsProps) {
  if (lockPending) {
    return (
      <span className={cn(PILL, NEUTRAL, "text-muted-foreground-strong")}>
        <Spinner />
        Updating…
      </span>
    );
  }

  if (state.status === "loading") {
    return (
      <span className={cn(PILL, NEUTRAL, "text-muted-foreground-strong")}>
        <Spinner />
        Checking…
      </span>
    );
  }

  if (state.status === "ready") {
    const locked = state.alive.locked;
    return (
      <button
        type="button"
        onClick={() => onSetLock(!locked)}
        title={locked ? "Unlock device" : "Lock device"}
        aria-label={locked ? "Unlock device" : "Lock device"}
        className={cn(
          PILL,
          "cursor-pointer transition hover:brightness-95",
          locked
            ? "border-warning-border bg-warning-bg text-warning-foreground"
            : cn(NEUTRAL, "text-neutral-foreground"),
        )}
      >
        {locked ? <Lock size={13} strokeWidth={2.4} /> : <LockOpen size={13} strokeWidth={2.4} />}
        {locked ? "Locked" : "Unlocked"}
      </button>
    );
  }

  return (
    <span className={cn(PILL, NEUTRAL, "text-muted-foreground")}>
      <Lock size={13} strokeWidth={2.4} />
      Unknown
    </span>
  );
}

export function DeviceAliveIndicators({ state, lockPending, onSetLock }: DeviceAliveIndicatorsProps) {
  return (
    <div className="flex gap-1.5">
      <OnlineIndicator state={state} />
      <LockIndicator state={state} lockPending={lockPending} onSetLock={onSetLock} />
    </div>
  );
}
