import { useEffect, useRef } from "react";
import type { Device, DeviceClient } from "@/lib/device-client";
import type { Org } from "@/store/org-storage";
import "./types";

interface UseLaunchOnDeviceToolParams {
  org: Org | null;
  deviceClient: DeviceClient;
  onDeviceResolved: (device: Device) => void;
  onUrlChange: (url: string) => void;
  onAppIdChange: (appId: string) => void;
}

function resolveDevice(devices: Device[], query: string): Device | string {
  const byId = devices.find((d) => d.id === query);
  if (byId) return byId;

  const lowerQuery = query.toLowerCase();
  const byExactName = devices.find((d) => d.name.toLowerCase() === lowerQuery);
  if (byExactName) return byExactName;

  const substringMatches = devices.filter((d) => d.name.toLowerCase().includes(lowerQuery));
  if (substringMatches.length === 1) return substringMatches[0];
  if (substringMatches.length > 1) {
    const names = substringMatches.map((d) => d.name).join(", ");
    return `Multiple devices match "${query}": ${names}. Use a more specific name or the device ID.`;
  }
  return `No device found matching "${query}".`;
}

/** Registers a WebMCP `launchOnDevice` tool */
export function useLaunchOnDeviceTool({
  org,
  deviceClient,
  onDeviceResolved,
  onUrlChange,
  onAppIdChange,
}: UseLaunchOnDeviceToolParams) {

  const callbacksRef = useRef({ onDeviceResolved, onUrlChange, onAppIdChange });
  callbacksRef.current = { onDeviceResolved, onUrlChange, onAppIdChange };

  useEffect(() => {
    if (!document.modelContext) return;

    const controller = new AbortController();
    document.modelContext.registerTool(
      {
        name: "launchOnDevice",
        description:
          "Finds a device by name (partial match allowed) or exact ID and launches an app on it from a given URL and App ID.",
        inputSchema: {
          type: "object",
          properties: {
            device: { type: "string", description: "Device name (partial match ok) or exact device ID" },
            url: { type: "string", description: "URL to launch the app from" },
            appId: { type: "string", description: "App ID to launch" },
          },
          required: ["device", "url", "appId"],
        },
        execute: async ({ device, url, appId }) => {
          if (!org) return "No organization selected in the app — open it and select one first.";

          const devices = await deviceClient.listDevices(org);
          const resolved = resolveDevice(devices, device);
          if (typeof resolved === "string") return resolved;

          const { onDeviceResolved, onUrlChange, onAppIdChange } = callbacksRef.current;
          onDeviceResolved(resolved);
          onUrlChange(url);
          onAppIdChange(appId);

          try {
            const result = await deviceClient.launchApp(org, resolved, url, appId);
            return `Launched on ${resolved.name}: ${result.message}`;
          } catch (err) {
            return `Launch failed on ${resolved.name}: ${err instanceof Error ? err.message : String(err)}`;
          }
        },
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [org, deviceClient]);
}
