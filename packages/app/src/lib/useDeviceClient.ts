import type { DeviceClient } from "@/lib/device-client";
import { httpDeviceClient } from "@/lib/http-device-client";

/** Single swap point for pointing the app at a different DeviceClient later. */
export function useDeviceClient(): DeviceClient {
  return httpDeviceClient;
}
