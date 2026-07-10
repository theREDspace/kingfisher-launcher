import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeviceTable } from "@/components/device/DeviceTable";
import type { Device } from "@/lib/device-client";

const deviceA: Device = { id: "dev-a", name: "Living Room", labels: ["4K"], online: true };
const deviceB: Device = { id: "dev-b", name: "Bedroom", labels: [], online: false };

describe("DeviceTable", () => {
  it("calls onSelect with the right device when a row is clicked", async () => {
    const onSelect = vi.fn();
    render(<DeviceTable devices={[deviceA, deviceB]} search="" onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Bedroom"));
    expect(onSelect).toHaveBeenCalledWith(deviceB);
  });

  it("rows are keyboard-focusable and call onSelect on Enter (regression)", async () => {
    const onSelect = vi.fn();
    render(<DeviceTable devices={[deviceA, deviceB]} search="" onSelect={onSelect} />);
    const row = screen.getByText("Living Room").closest("tr")!;
    row.focus();
    expect(row).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(deviceA);
  });
});
