import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeviceCard } from "@/components/device/DeviceCard";
import type { Device } from "@/lib/device-client";
import type { UseDeviceAliveResult } from "@/lib/useDeviceAlive";
import type { DeviceData } from "@/lib/kingfisher/types";

const device: Device = { id: "dev-1", name: "Living Room", labels: ["4K", "beta"] };

const idleAlive: UseDeviceAliveResult = {
  state: { status: "idle" },
  lockPending: false,
  setLock: vi.fn(),
  refreshAlive: vi.fn(),
};

describe("DeviceCard", () => {
  it("renders the empty state and calls onOpenPicker", async () => {
    const onOpenPicker = vi.fn();
    render(
      <DeviceCard device={null} deviceDetails={null} alive={idleAlive} onOpenPicker={onOpenPicker} />,
    );
    expect(screen.getByText("No device selected")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /select device/i }));
    expect(onOpenPicker).toHaveBeenCalledTimes(1);
  });

  describe("device details tooltip (regression: missing key + keyboard access)", () => {
    // Odd number of entries exercises the "pad last row with empty cells" branch.
    const deviceDetails: DeviceData = {
      reference: { org: "org-1", device: "dev-1" },
      metadata: { name: "Living Room" },
      device: { device_id: "dev-1", device_type: "settop", device_model: "XG2v4" },
    };

    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    it("shows the tooltip on hover with no missing-key console error, and is keyboard accessible", async () => {
      render(
        <DeviceCard
          device={device}
          deviceDetails={deviceDetails}
          alive={idleAlive}
          onOpenPicker={vi.fn()}
        />,
      );

      const trigger = screen.getByLabelText("Show device details");
      await userEvent.hover(trigger);
      expect(screen.getByText("device_model")).toBeInTheDocument();

      const keyWarning = errorSpy.mock.calls.some((args: unknown[]) =>
        args.some((a) => typeof a === "string" && a.includes("unique") && a.includes("key")),
      );
      expect(keyWarning).toBe(false);
      await userEvent.unhover(trigger);

      await userEvent.tab();
      expect(trigger).toHaveFocus();
      expect(screen.getByText("device_model")).toBeInTheDocument();
    });
  });
});
