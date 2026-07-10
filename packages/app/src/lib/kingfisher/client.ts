import ky from "ky";
import type {
  AliveStatus,
  CheckAliveQuery,
  DeviceData,
  DeviceMetadata,
  GetDeviceQuery,
  GetDevicesQuery,
  KingfisherEnvelope,
  KingfisherError,
  LaunchAppBody,
  LaunchAppOutput,
  LockDeviceBody,
  PressKeyBody,
  QueryDevicesQuery,
  UnlockDeviceBody,
} from "@/lib/kingfisher/types";

/** Minimal auth surface a Kingfisher call needs. The app's `Org` structurally satisfies this. */
export interface KingfisherAuth {
  orgId: string;
  apiKey: string;
  baseUrl?: string;
}

function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Apikey ${apiKey}` };
}

function formatKingfisherError(error: KingfisherError): string {
  const status = error.status ?? error.code;
  return error.message ? `${error.message}${status ? ` (${status})` : ""}` : "Request failed.";
}

async function describeErrorResponse(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; error?: KingfisherError };
    if (body?.error) return formatKingfisherError(body.error);
    if (body?.message) return `${body.message} (${response.status})`;
  } catch {
    // Body wasn't JSON — fall back to the status line below.
  }
  return `Request failed with status ${response.status}.`;
}

/**
 * Unwrap the `{ result, error }` envelope. `throwHttpErrors: false` is set on
 * every call so we read the error body ourselves.
 */
async function unwrap<T>(response: Response): Promise<T | undefined> {
  if (!response.ok) {
    throw new Error(await describeErrorResponse(response));
  }
  const data = (await response.json()) as KingfisherEnvelope<T>;
  if (data.error) {
    throw new Error(formatKingfisherError(data.error));
  }
  return data.result;
}

/**
 * Flatten a query-params object. Scalars map directly;
 * nested objects flatten one level to `key.subkey=value`.
 */
function toSearchParams(params: object): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") {
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (subValue === undefined || subValue === null) continue;
        search.append(`${key}.${subKey}`, String(subValue));
      }
    } else {
      search.append(key, String(value));
    }
  }
  return search;
}

function orgPath(auth: KingfisherAuth): string {
  const base = auth.baseUrl || "http://localhost:8080";
  return `${base}/orgs/${encodeURIComponent(auth.orgId)}`;
}

function devicePath(auth: KingfisherAuth, deviceId: string): string {
  return `${orgPath(auth)}/devices/${encodeURIComponent(deviceId)}`;
}

/**
 * Typed wrappers over the Kingfisher REST endpoints. Every method authenticates
 * with `auth.apiKey` and targets `auth.orgId` in the path.
 */
export const kingfisher = {
  /** GET /orgs */
  async getOrgs(baseUrl: string, apiKey: string): Promise<string[]> {
    const response = await ky.get(`${baseUrl}/orgs`, {
      headers: authHeaders(apiKey),
      throwHttpErrors: false,
    });
    return (await unwrap<string[]>(response)) ?? [];
  },

  /** GET /orgs/{org}/devices */
  async getDevices(auth: KingfisherAuth, query: GetDevicesQuery = {}): Promise<DeviceData[]> {
    const response = await ky.get(`${orgPath(auth)}/devices`, {
      headers: authHeaders(auth.apiKey),
      searchParams: toSearchParams(query),
      throwHttpErrors: false,
    });
    return (await unwrap<DeviceData[]>(response)) ?? [];
  },

  /** GET /orgs/{org}/devices/{device_id} */
  async getDevice(
    auth: KingfisherAuth,
    deviceId: string,
    query: GetDeviceQuery = {},
  ): Promise<DeviceData | undefined> {
    const response = await ky.get(devicePath(auth, deviceId), {
      headers: authHeaders(auth.apiKey),
      searchParams: toSearchParams(query),
      throwHttpErrors: false,
    });
    return unwrap<DeviceData>(response);
  },

  /** GET /orgs/{org}/devices/query */
  async queryDevices(auth: KingfisherAuth, query: QueryDevicesQuery = {}): Promise<DeviceData[]> {
    const response = await ky.get(`${orgPath(auth)}/devices/query`, {
      headers: authHeaders(auth.apiKey),
      searchParams: toSearchParams(query),
      throwHttpErrors: false,
    });
    return (await unwrap<DeviceData[]>(response)) ?? [];
  },

  /** GET /orgs/{org}/devices/{device_id}/alive */
  async checkAlive(
    auth: KingfisherAuth,
    deviceId: string,
    query: CheckAliveQuery = {},
  ): Promise<AliveStatus | undefined> {
    const response = await ky.get(`${devicePath(auth, deviceId)}/alive`, {
      headers: authHeaders(auth.apiKey),
      searchParams: toSearchParams(query),
      throwHttpErrors: false,
    });
    return unwrap<AliveStatus>(response);
  },

  /** POST /orgs/{org}/devices/{device_id}/launchapp */
  async launchApp(
    auth: KingfisherAuth,
    deviceId: string,
    body: LaunchAppBody = {},
  ): Promise<LaunchAppOutput | undefined> {
    const response = await ky.post(`${devicePath(auth, deviceId)}/launchapp`, {
      headers: authHeaders(auth.apiKey),
      json: body,
      throwHttpErrors: false,
    });
    return unwrap<LaunchAppOutput>(response);
  },

  /** POST /orgs/{org}/devices/{device_id}/lock */
  async lockDevice(
    auth: KingfisherAuth,
    deviceId: string,
    body: LockDeviceBody = {},
  ): Promise<DeviceMetadata | undefined> {
    const response = await ky.post(`${devicePath(auth, deviceId)}/lock`, {
      headers: authHeaders(auth.apiKey),
      json: body,
      throwHttpErrors: false,
    });
    return unwrap<DeviceMetadata>(response);
  },

  /** PATCH /orgs/{org}/devices/{device_id}/lock */
  async unlockDevice(
    auth: KingfisherAuth,
    deviceId: string,
    body: UnlockDeviceBody = {},
  ): Promise<DeviceMetadata | undefined> {
    const response = await ky.patch(`${devicePath(auth, deviceId)}/lock`, {
      headers: authHeaders(auth.apiKey),
      json: body,
      throwHttpErrors: false,
    });
    return unwrap<DeviceMetadata>(response);
  },

  /** POST /orgs/{org}/devices/{device_id}/key */
  async pressKey(auth: KingfisherAuth, deviceId: string, body: PressKeyBody): Promise<void> {
    const response = await ky.post(`${devicePath(auth, deviceId)}/key`, {
      headers: authHeaders(auth.apiKey),
      json: body,
      throwHttpErrors: false,
    });
    await unwrap<never>(response); // PressKeyResponse carries only `error`.
  },

  /**
   * GET /orgs/{org}/devices/{device_id}/screenshot
   * The response is raw PNG bytes, not a JSON envelope.
   */
  async screenshot(auth: KingfisherAuth, deviceId: string): Promise<string | undefined> {
    const response = await ky.get(`${devicePath(auth, deviceId)}/screenshot`, {
      headers: authHeaders(auth.apiKey),
      throwHttpErrors: false,
    });
    if (!response.ok) {
      throw new Error(await describeErrorResponse(response));
    }
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },
};
