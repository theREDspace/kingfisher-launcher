import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Device } from "@/lib/device-client";
import type { Org } from "@/store/org-storage";

const checkAliveMock = vi.fn();
const lockDeviceMock = vi.fn();
// Stable reference across renders — a fresh object literal per call would break
// the hook's useCallback memoization and cause an infinite render loop.
const deviceClient = {
  checkAlive: checkAliveMock,
  lockDevice: lockDeviceMock,
  unlockDevice: vi.fn(),
};

vi.mock("@/lib/useDeviceClient", () => ({
  useDeviceClient: () => deviceClient,
}));

const selectedOrg: Org = { id: "org-1", name: "Acme", orgId: "acme", apiKey: "key" };
vi.mock("@/store/OrgStoreContext", () => ({
  useOrgStore: () => ({ selectedOrg }),
}));

const { useDeviceAlive } = await import("@/lib/useDeviceAlive");

function device(id: string): Device {
  return { id, name: id, labels: [] };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  checkAliveMock.mockReset();
  lockDeviceMock.mockReset();
});

describe("useDeviceAlive", () => {
  it("goes loading -> ready on mount when a device is present", async () => {
    checkAliveMock.mockResolvedValue({ online: true, locked: false });
    const dev = device("dev-1");
    const { result } = renderHook(() => useDeviceAlive(dev));

    expect(result.current.state.status).toBe("loading");
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "ready",
        alive: { online: true, locked: false },
      }),
    );
  });

  it("discards a stale in-flight check superseded by refreshAlive (regression)", async () => {
    const first = deferred<{ online: boolean; locked: boolean }>();
    const second = deferred<{ online: boolean; locked: boolean }>();
    checkAliveMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const dev = device("dev-1");
    const { result } = renderHook(() => useDeviceAlive(dev));

    act(() => {
      result.current.refreshAlive();
    });

    // The newer request resolves first...
    await act(async () => {
      second.resolve({ online: true, locked: true });
      await Promise.resolve();
    });
    expect(result.current.state).toEqual({
      status: "ready",
      alive: { online: true, locked: true },
    });

    // ...and the stale first request resolving afterward must NOT overwrite it.
    await act(async () => {
      first.resolve({ online: false, locked: false });
      await Promise.resolve();
    });
    expect(result.current.state).toEqual({
      status: "ready",
      alive: { online: true, locked: true },
    });
  });

  it("setLock(true) locks the device and reflects locked on success", async () => {
    checkAliveMock.mockResolvedValue({ online: true, locked: false });
    lockDeviceMock.mockResolvedValue(undefined);
    const dev = device("dev-1");
    const { result } = renderHook(() => useDeviceAlive(dev));
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    await act(async () => {
      await result.current.setLock(true);
    });

    expect(lockDeviceMock).toHaveBeenCalled();
    expect(result.current.state).toEqual({
      status: "ready",
      alive: { online: true, locked: true },
    });
  });
});
