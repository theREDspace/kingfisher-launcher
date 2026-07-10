import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Device } from "@/lib/device-client";
import type { Org } from "@/store/org-storage";

const captureScreenMock = vi.fn();
// Stable reference across renders — a fresh object literal per call would break
// memoization in consumers and can trigger effect-dependency loops.
const deviceClient = { captureScreen: captureScreenMock };
vi.mock("@/lib/useDeviceClient", () => ({ useDeviceClient: () => deviceClient }));

const selectedOrg: Org = { id: "org-1", name: "Acme", orgId: "acme", apiKey: "key" };
vi.mock("@/store/OrgStoreContext", () => ({ useOrgStore: () => ({ selectedOrg }) }));

const { ScreenPreviewPanel } = await import("@/components/panels/ScreenPreviewPanel");

const deviceA: Device = { id: "dev-a", name: "Living Room", labels: [] };
const deviceB: Device = { id: "dev-b", name: "Bedroom", labels: [] };

const aliveOnline = { status: "ready" as const, alive: { online: true, locked: false } };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  captureScreenMock.mockReset();
});

describe("ScreenPreviewPanel", () => {
  it("captures a screen on refresh and renders the result", async () => {
    captureScreenMock.mockResolvedValue({ capturedAt: "10:00 AM", image: "img-a" });
    render(<ScreenPreviewPanel device={deviceA} alive={aliveOnline} />);

    await userEvent.click(screen.getByRole("button", { name: "Refresh screen" }));

    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Screen capture of Living Room" })).toHaveAttribute(
        "src",
        "data:image/png;base64,img-a",
      ),
    );
  });

  // Regression: refreshing used to null out captureImage immediately, hiding
  // the existing screenshot (and collapsing the expanded dialog) instead of
  // just overlaying a spinner on top of it.
  it("keeps showing the previous capture with a spinner overlay while refreshing", async () => {
    captureScreenMock.mockResolvedValue({ capturedAt: "10:00 AM", image: "img-a" });
    render(<ScreenPreviewPanel device={deviceA} alive={aliveOnline} />);
    await userEvent.click(screen.getByRole("button", { name: "Refresh screen" }));
    await screen.findByRole("img", { name: "Screen capture of Living Room" });

    const gate = deferred<{ capturedAt: string; image?: string }>();
    captureScreenMock.mockReturnValue(gate.promise);
    await userEvent.click(screen.getByRole("button", { name: "Refresh screen" }));

    expect(screen.getByRole("img", { name: "Screen capture of Living Room" })).toBeInTheDocument();
    expect(screen.queryByText("No preview yet")).not.toBeInTheDocument();

    await act(async () => {
      gate.resolve({ capturedAt: "10:01 AM", image: "img-a2" });
      await gate.promise;
    });
  });

  // Regression: switching the device prop mid-capture used to let the stale
  // result from the previous device overwrite the freshly-reset UI.
  it("ignores a slow captureScreen result for device A after the device prop switches to B", async () => {
    const gate = deferred<{ capturedAt: string; image?: string }>();
    captureScreenMock.mockReturnValue(gate.promise);

    const { rerender } = render(<ScreenPreviewPanel device={deviceA} alive={aliveOnline} />);
    await userEvent.click(screen.getByRole("button", { name: "Refresh screen" }));
    expect(screen.getByText("Capturing…")).toBeInTheDocument();

    // Switch devices while device A's capture is still in flight.
    rerender(<ScreenPreviewPanel device={deviceB} alive={aliveOnline} />);
    expect(screen.getByText("No preview yet")).toBeInTheDocument();

    await act(async () => {
      gate.resolve({ capturedAt: "10:00 AM", image: "img-a" });
      await gate.promise;
    });

    // Must NOT overwrite the reset state with device A's stale result.
    expect(screen.getByText("No preview yet")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Screen capture of Living Room" }),
    ).not.toBeInTheDocument();
  });
});
