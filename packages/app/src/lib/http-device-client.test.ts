import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Org } from "@/store/org-storage";
import type { Device } from "@/lib/device-client";

const lockDeviceMock = vi.fn();
const unlockDeviceMock = vi.fn();
const launchAppMock = vi.fn();

vi.mock("@/lib/kingfisher/client", () => ({
  kingfisher: {
    getDevices: vi.fn(),
    checkAlive: vi.fn(),
    lockDevice: lockDeviceMock,
    unlockDevice: unlockDeviceMock,
    launchApp: launchAppMock,
    screenshot: vi.fn(),
  },
}));

const { httpDeviceClient } = await import("@/lib/http-device-client");

const ORG: Org = { id: "org-internal-1", name: "Acme", orgId: "acme", apiKey: "key" };

function device(id: string, name = id): Device {
  return { id, name, labels: [] };
}

function lockResult(secret: string) {
  return { reservation: { reservation_secret: secret } };
}

beforeEach(() => {
  lockDeviceMock.mockReset();
  unlockDeviceMock.mockReset();
  launchAppMock.mockReset();
});

describe("lock/unlock reservation tracking", () => {
  it("unlockDevice reuses the secret captured by a prior lockDevice call, without re-locking", async () => {
    const dev = device("dev-reuse");
    lockDeviceMock.mockResolvedValue(lockResult("secret-abc"));
    unlockDeviceMock.mockResolvedValue(undefined);

    await httpDeviceClient.lockDevice(ORG, dev);
    await httpDeviceClient.unlockDevice(ORG, dev);

    expect(lockDeviceMock).toHaveBeenCalledTimes(1); // no redundant re-lock
    expect(unlockDeviceMock).toHaveBeenCalledWith(ORG, "dev-reuse", {
      reservation_secret: "secret-abc",
    });
  });

  it("does not orphan another device's lock when a different device is locked in between (regression)", async () => {
    const deviceA = device("dev-a-regression");
    const deviceB = device("dev-b-regression");
    lockDeviceMock.mockImplementation(async (_org, id: string) => lockResult(`secret-for-${id}`));
    unlockDeviceMock.mockResolvedValue(undefined);

    await httpDeviceClient.lockDevice(ORG, deviceA);
    await httpDeviceClient.lockDevice(ORG, deviceB);

    // Unlocking A must still use A's own secret, not B's, and must not require
    // a redundant re-lock of A (which would happen if A's secret had been lost).
    await httpDeviceClient.unlockDevice(ORG, deviceA);
    expect(lockDeviceMock).toHaveBeenCalledTimes(2);
    expect(unlockDeviceMock).toHaveBeenCalledWith(ORG, "dev-a-regression", {
      reservation_secret: "secret-for-dev-a-regression",
    });
  });
});

describe("launchApp", () => {
  it("releases an existing reservation for the same device, then locks fresh before launching", async () => {
    const dev = device("dev-launch-relock");
    lockDeviceMock
      .mockResolvedValueOnce(lockResult("old-secret"))
      .mockResolvedValueOnce(lockResult("new-secret"));
    unlockDeviceMock.mockResolvedValue(undefined);
    launchAppMock.mockResolvedValue({});

    await httpDeviceClient.lockDevice(ORG, dev);
    await httpDeviceClient.launchApp(ORG, dev, "https://app.example", "com.example.app");

    expect(unlockDeviceMock).toHaveBeenCalledWith(ORG, "dev-launch-relock", {
      reservation_secret: "old-secret",
    });
    expect(launchAppMock).toHaveBeenCalledWith(
      ORG,
      "dev-launch-relock",
      expect.objectContaining({ reservation_secret: "new-secret" }),
    );
  });
});
