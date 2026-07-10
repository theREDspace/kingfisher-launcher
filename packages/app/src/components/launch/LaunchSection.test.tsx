import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LaunchSection } from "@/components/launch/LaunchSection";
import type { Device } from "@/lib/device-client";
import type { Org } from "@/store/org-storage";

const mockUseOrgStore = vi.fn();
const mockUsePresetStore = vi.fn();
const mockUseDeviceClient = vi.fn();

vi.mock("@/store/OrgStoreContext", () => ({ useOrgStore: () => mockUseOrgStore() }));
vi.mock("@/store/PresetStoreContext", () => ({ usePresetStore: () => mockUsePresetStore() }));
vi.mock("@/lib/useDeviceClient", () => ({ useDeviceClient: () => mockUseDeviceClient() }));

const org: Org = { id: "org_1", name: "Acme", orgId: "acme-id", apiKey: "key-123" };
const device: Device = { id: "dev_1", name: "Living Room TV", labels: [] };
const launchApp = vi.fn();

// Stable object reference — a fresh literal per mock call can make an effect's
// dependency array look "changed" every render and infinite-loop.
const deviceClientMock = {
  listDevices: vi.fn(),
  checkAlive: vi.fn(),
  lockDevice: vi.fn(),
  unlockDevice: vi.fn(),
  launchApp,
  captureScreen: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseOrgStore.mockReturnValue({ selectedOrg: org });
  mockUsePresetStore.mockReturnValue({ presets: [], addPreset: vi.fn(), updatePreset: vi.fn(), deletePreset: vi.fn() });
  mockUseDeviceClient.mockReturnValue(deviceClientMock);
});

// LaunchSection is a controlled component; this harness plays the parent that
// owns url/appId state so we can type and see the value reflected.
function Harness({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [appId, setAppId] = useState("");
  return (
    <LaunchSection device={device} url={url} appId={appId} onUrlChange={setUrl} onAppIdChange={setAppId} />
  );
}

describe("LaunchSection", () => {
  it("launches with the entered URL and shows the returned success message", async () => {
    launchApp.mockResolvedValue({ success: true, message: "Launched!" });
    const user = userEvent.setup();
    render(<Harness initialUrl="https://example.com" />);
    await user.click(screen.getByRole("button", { name: "Launch" }));
    expect(await screen.findByText("Launched!")).toBeInTheDocument();
    expect(launchApp).toHaveBeenCalledWith(org, device, "https://example.com", "");
  });

  it("shows a validation error and does not call launchApp when both URL and App ID are blank", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Launch" }));
    expect(await screen.findByText("Enter a URL or App ID to launch.")).toBeInTheDocument();
    expect(launchApp).not.toHaveBeenCalled();
  });

  // Regression: launchTimeout (the 3s auto-dismiss timer for the success
  // message) was previously never cleared on unmount.
  it("clears the pending auto-dismiss timeout on unmount (regression)", async () => {
    launchApp.mockResolvedValue({ success: true, message: "Launched!" });
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const user = userEvent.setup();
    const { unmount } = render(<Harness initialUrl="https://example.com" />);

    await user.click(screen.getByRole("button", { name: "Launch" }));
    await screen.findByText("Launched!");

    const callsBeforeUnmount = clearTimeoutSpy.mock.calls.length;
    unmount();
    const callsDuringUnmount = clearTimeoutSpy.mock.calls.slice(callsBeforeUnmount);

    expect(callsDuringUnmount.some((call: unknown[]) => call[0] !== undefined)).toBe(true);
    clearTimeoutSpy.mockRestore();
  });
});
