import { useCallback, useEffect, useRef, useState } from "react";
import type { Device, DeviceAliveStatus } from "@/lib/device-client";
import { useDeviceClient } from "@/lib/useDeviceClient";
import { useOrgStore } from "@/store/OrgStoreContext";

export type AliveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; alive: DeviceAliveStatus }
  | { status: "error"; message: string };

export interface UseDeviceAliveResult {
  state: AliveState;
  /** True while a lock/unlock request is in flight. */
  lockPending: boolean;
  /** Lock (`true`) or unlock (`false`) the device, then reflect the new state. */
  setLock: (locked: boolean) => Promise<void>;
  /** Re-run checkAlive now to refresh the online + lock status. */
  refreshAlive: () => void;
}

/**
 * Fetches liveness (online + lock) for the selected device via
 * `DeviceClient.checkAlive`, re-running whenever the device or org changes,
 * and exposes lock/unlock actions that update the same state. Returns `idle`
 * when nothing is selected.
 */
export function useDeviceAlive(device: Device | null): UseDeviceAliveResult {
  const { selectedOrg } = useOrgStore();
  const client = useDeviceClient();
  const [state, setState] = useState<AliveState>({ status: "idle" });
  const [lockPending, setLockPending] = useState(false);

  // Refs so async callbacks always see the latest values.
  const deviceRef = useRef(device);
  const orgRef = useRef(selectedOrg);
  deviceRef.current = device;
  orgRef.current = selectedOrg;

  // Cancels whichever check() call is currently in flight, so a superseded
  // request (stale device, or an older refreshAlive) can never overwrite
  // fresher state.
  const cancelPendingRef = useRef(() => {});

  const check = useCallback(() => {
    cancelPendingRef.current();
    const dev = deviceRef.current;
    const org = orgRef.current;
    if (!dev || !org) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    cancelPendingRef.current = () => {
      cancelled = true;
    };
    setState({ status: "loading" });
    client
      .checkAlive(org, dev)
      .then((alive) => {
        if (!cancelled) setState({ status: "ready", alive });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Couldn't check device status.",
          });
        }
      });
  }, [client]);

  // Auto-run on mount and when the device/org changes.
  useEffect(() => {
    setLockPending(false);
    check();
    return () => cancelPendingRef.current();
  }, [device, selectedOrg, check]);

  const refreshAlive = useCallback(() => {
    check();
  }, [check]);

  const setLock = useCallback(
    async (locked: boolean) => {
      const dev = deviceRef.current;
      const org = orgRef.current;
      if (!dev || !org) return;
      setLockPending(true);
      try {
        if (locked) await client.lockDevice(org, dev);
        else await client.unlockDevice(org, dev);
        // Only reflect the change on success — a failed toggle leaves the
        // indicator at its (still-accurate) prior value.
        setState((prev) =>
          prev.status === "ready" ? { status: "ready", alive: { ...prev.alive, locked } } : prev,
        );
      } catch {
        // Swallowed so the click handler never sees an unhandled rejection.
        // TODO: surface lock/unlock failures to the user (toast) once available.
      } finally {
        setLockPending(false);
      }
    },
    [client],
  );

  return { state, lockPending, setLock, refreshAlive };
}
