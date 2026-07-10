import type { Org } from "@/store/org-storage";

export interface SessionState {
  deviceId: string | null;
  deviceName: string | null;
  url: string;
  appId: string;
}

const STORAGE_KEY_PREFIX = "comcast-launcher:session:";

const EMPTY_SESSION: SessionState = {
  deviceId: null,
  deviceName: null,
  url: "",
  appId: "",
};

function isSessionState(value: unknown): value is SessionState {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    (s.deviceId === null || typeof s.deviceId === "string") &&
    (s.deviceName === null || typeof s.deviceName === "string") &&
    typeof s.url === "string" &&
    typeof s.appId === "string"
  );
}

export function loadSession(org: Org): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + org.id);
    if (!raw) return EMPTY_SESSION;
    const parsed = JSON.parse(raw) as unknown;
    return isSessionState(parsed) ? parsed : EMPTY_SESSION;
  } catch {
    return EMPTY_SESSION;
  }
}

export function saveSession(org: Org, state: SessionState): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + org.id, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — session stays in memory but won't persist.
  }
}
