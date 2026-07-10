import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveOrgStorage, type Org } from "@/store/org-storage";
import { saveSession } from "@/store/session-storage";
import type { Device } from "@/lib/device-client";

const listDevicesMock = vi.fn();
// Stable reference — a fresh object literal per call would break memoization
// in every hook that depends on this client and cause an infinite render loop.
const deviceClient = {
  listDevices: listDevicesMock,
  checkAlive: vi.fn().mockResolvedValue({ online: true, locked: false }),
  lockDevice: vi.fn(),
  unlockDevice: vi.fn(),
  launchApp: vi.fn(),
  captureScreen: vi.fn(),
};

vi.mock("@/lib/useDeviceClient", () => ({
  useDeviceClient: () => deviceClient,
}));
vi.mock("@/lib/kingfisher/client", () => ({
  kingfisher: { getDevice: vi.fn().mockResolvedValue(undefined) },
}));

const { default: App } = await import("@/App");

const ORG_A: Org = { id: "org-a", name: "Org A", orgId: "acme-a", apiKey: "key-a" };

function device(id: string, name: string, labels: string[] = []): Device {
  return { id, name, labels };
}

beforeEach(() => {
  localStorage.clear();
  listDevicesMock.mockReset().mockResolvedValue([]);
});

describe("App", () => {
  it("restores a saved session's device as a stub, then upgrades it once the device list resolves", async () => {
    saveOrgStorage({ orgs: [ORG_A], selectedOrgId: ORG_A.id });
    saveSession(ORG_A, {
      deviceId: "dev-1",
      deviceName: "Stub Living Room",
      url: "https://app.example",
      appId: "com.example.app",
    });
    listDevicesMock.mockResolvedValue([
      device("dev-1", "Stub Living Room", ["zone: downstairs"]),
    ]);

    render(<App />);

    expect(await screen.findByText("Stub Living Room")).toBeInTheDocument();
    expect(screen.getByLabelText("URL")).toHaveValue("https://app.example");
    await waitFor(() => expect(screen.getByText("zone: downstairs")).toBeInTheDocument());
  });

  it("selecting a device via the picker shows it and saves it to session storage", async () => {
    saveOrgStorage({ orgs: [ORG_A], selectedOrgId: ORG_A.id });
    listDevicesMock.mockResolvedValue([device("dev-2", "Kitchen Beta")]);
    const user = userEvent.setup();

    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Select Device" }));
    await user.click(await screen.findByText("Kitchen Beta"));

    await waitFor(() => expect(screen.queryByText("Select a device")).not.toBeInTheDocument());

    const { loadSession } = await import("@/store/session-storage");
    expect(loadSession(ORG_A).deviceId).toBe("dev-2");
  });
});
