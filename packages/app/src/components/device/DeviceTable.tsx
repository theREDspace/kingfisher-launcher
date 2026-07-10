import type { Device } from "@/lib/device-client";
import { DeviceLabels } from "@/components/device/DeviceLabels";

interface DeviceTableProps {
  devices: Device[];
  search: string;
  onSelect: (device: Device) => void;
}

export function DeviceTable({ devices, search, onSelect }: DeviceTableProps) {
  if (devices.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        No devices match &ldquo;{search}&rdquo;.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 z-10 bg-surface-table-head">
        <tr>
          <th className="border-b border-border-soft px-6.5 py-2.75 text-left text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
            Device Name
          </th>
          <th className="border-b border-border-soft px-3.5 py-2.75 text-left text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
            Labels/Features
          </th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          <tr
            key={device.id}
            tabIndex={0}
            onClick={() => onSelect(device)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(device);
              }
            }}
            className="cursor-pointer transition-colors outline-none hover:bg-destructive-bg focus-visible:bg-destructive-bg focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <td className="border-b border-border-soft px-6.5 py-3.5">
              <div className="text-sm font-bold text-navy">{device.name}</div>
            </td>
            <td className="border-b border-border-soft px-3.5 py-3.5">
              <DeviceLabels labels={device.labels} size="sm" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
