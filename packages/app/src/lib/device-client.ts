import type { Org } from "@/store/org-storage";

export interface Device {
  id: string;
  name: string;
  labels: string[];
  /** Undefined when the source (e.g. the real Kingfisher API) doesn't report connection state. */
  online?: boolean;
  /** Undefined when the source doesn't report lock state. */
  locked?: boolean;
}

export interface LaunchResult {
  success: boolean;
  message: string;
}

export interface ScreenCapture {
  capturedAt: string;
  /** Base64-encoded PNG image data, if available from the capture source. */
  image?: string;
}

/** App-level liveness for a device — mapped from Kingfisher's `AliveStatus` (`live`/`locked`/`power_on`). */
export interface DeviceAliveStatus {
  online: boolean;
  locked: boolean;
  poweredOn?: boolean;
}

/** Backed by the real Kingfisher API — see `lib/http-device-client.ts`. */
export interface DeviceClient {
  listDevices(org: Org): Promise<Device[]>;
  checkAlive(org: Org, device: Device): Promise<DeviceAliveStatus>;
  lockDevice(org: Org, device: Device): Promise<void>;
  unlockDevice(org: Org, device: Device): Promise<void>;
  launchApp(org: Org, device: Device, url: string, appId: string): Promise<LaunchResult>;
  captureScreen(org: Org, device: Device): Promise<ScreenCapture>;
}
