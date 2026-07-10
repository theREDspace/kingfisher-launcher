import type { Org } from "@/store/org-storage";
import type { Device, DeviceAliveStatus, DeviceClient, LaunchResult, ScreenCapture } from "@/lib/device-client";
import type { DeviceData } from "@/lib/kingfisher/types";
import { kingfisher } from "@/lib/kingfisher/client";

function mapDeviceData(raw: DeviceData): Device {
  const labels = raw.metadata.labels ?? {};
  const labelChips = Object.entries(labels)
    .filter(([key]) => key !== "name")
    .map(([key, value]) => `${key}: ${value}`);

  // Only enabled features are meaningful capabilities worth surfacing —
  // a disabled flag isn't something to show off as a chip.
  const featureChips = (raw.metadata.features ?? [])
    .filter((feature) => feature.enabled)
    .map((feature) => feature.name);

  return {
    id: raw.reference.device,
    name: raw.metadata.name,
    labels: [...labelChips, ...featureChips],
  };
}

/**
 * The app's `DeviceClient`, backed by Kingfisher. Lock/unlock share the
 * `reservation_secret` returned by Kingfisher's lock call — keyed by device
 * ID so reservations for different devices don't clobber each other.
 */
const reservationSecrets = new Map<string, string>();

export const httpDeviceClient: DeviceClient = {
  async listDevices(org: Org): Promise<Device[]> {
    const devices = await kingfisher.getDevices(org);
    return devices.map(mapDeviceData);
  },

  async checkAlive(org: Org, device: Device): Promise<DeviceAliveStatus> {
    const alive = await kingfisher.checkAlive(org, device.id);
    return {
      online: alive?.live ?? false,
      locked: alive?.locked ?? false,
      poweredOn: alive?.power_on,
    };
  },

  async lockDevice(org: Org, device: Device): Promise<void> {
    const metadata = await kingfisher.lockDevice(org, device.id);
    const secret = metadata?.reservation?.reservation_secret;
    if (secret) reservationSecrets.set(device.id, secret);
  },

  async unlockDevice(org: Org, device: Device): Promise<void> {
    let secret = reservationSecrets.get(device.id);
    if (!secret) {
      const metadata = await kingfisher.lockDevice(org, device.id);
      secret = metadata?.reservation?.reservation_secret;
    }
    await kingfisher.unlockDevice(org, device.id, {
      reservation_secret: secret,
    });
    reservationSecrets.delete(device.id);
  },

  async launchApp(org: Org, device: Device, url: string, appId: string): Promise<LaunchResult> {
    const existingSecret = reservationSecrets.get(device.id);
    if (existingSecret) {
      await kingfisher.unlockDevice(org, device.id, {
        reservation_secret: existingSecret,
      });
      reservationSecrets.delete(device.id);
    }
    const metadata = await kingfisher.lockDevice(org, device.id);
    const reservationSecret = metadata?.reservation?.reservation_secret;
    if (reservationSecret) reservationSecrets.set(device.id, reservationSecret);

    await kingfisher.launchApp(org, device.id, {
      reservation_secret: reservationSecret,
      app_config: {
        url: url.trim() || undefined,
        app_name: appId.trim() || undefined,
        enable_console_logging: true,
        local_storage_enabled: true,
      },
    });
    const label = appId.trim() || url.trim();
    return {
      success: true,
      message: label ? `Launched ${label} on ${device.name}` : `Launched on ${device.name}`,
    };
  },

  async captureScreen(org: Org, device: Device): Promise<ScreenCapture> {
    const imageBase64 = await kingfisher.screenshot(org, device.id);
    return {
      capturedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      image: imageBase64,
    };
  },
};
