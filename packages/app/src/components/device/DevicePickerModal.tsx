import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DeviceTable } from "@/components/device/DeviceTable";
import { useDeviceClient } from "@/lib/useDeviceClient";
import { useOrgStore } from "@/store/OrgStoreContext";
import type { Device } from "@/lib/device-client";

interface DevicePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDevice: (device: Device) => void;
}

export function DevicePickerModal({ open, onOpenChange, onSelectDevice }: DevicePickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[86vh] w-full max-w-[840px] flex-col gap-0 rounded-[20px] p-0 shadow-modal ring-0 sm:max-w-[840px]"
      >
        {open && (
          <DevicePickerModalBody onClose={() => onOpenChange(false)} onSelectDevice={onSelectDevice} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DevicePickerModalBody({
  onClose,
  onSelectDevice,
}: {
  onClose: () => void;
  onSelectDevice: (device: Device) => void;
}) {
  const { selectedOrg } = useOrgStore();
  const deviceClient = useDeviceClient();
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!selectedOrg) {
      setDevices([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setDevices(null);
    setError(null);
    deviceClient
      .listDevices(selectedOrg)
      .then((result) => {
        if (!cancelled) setDevices(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load devices.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedOrg, deviceClient, retryCount]);

  const query = search.trim().toLowerCase();
  const filtered = (devices ?? []).filter((d) => {
    if (!query) return true;
    return (
      d.name.toLowerCase().includes(query) ||
      d.id.toLowerCase().includes(query) ||
      d.labels.some((label) => label.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="border-b border-border-soft px-6.5 pt-5.5 pb-4.5">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-[18px] font-extrabold tracking-tight text-navy">
              Select a device
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
              {error
                ? "Couldn't load devices"
                : devices === null
                  ? "Loading devices…"
                  : `${filtered.length} of ${devices.length} devices`}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close device picker"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-surface-muted text-muted-foreground-strong"
          >
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            size={17}
            strokeWidth={2}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or label…"
            aria-label="Search devices by name, ID, or label"
            className="h-11 rounded-control border-border bg-surface-table-head pr-3.5 pl-10 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedOrg === null ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Select an organization first.
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="text-sm text-muted-foreground">{error}</div>
            <button
              type="button"
              onClick={() => setRetryCount((n) => n + 1)}
              className="h-9.5 rounded-control border border-border bg-white px-4 text-[13px] font-semibold text-navy"
            >
              Try again
            </button>
          </div>
        ) : devices === null ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Loading devices…
          </div>
        ) : (
          <DeviceTable devices={filtered} search={search} onSelect={onSelectDevice} />
        )}
      </div>
    </>
  );
}
