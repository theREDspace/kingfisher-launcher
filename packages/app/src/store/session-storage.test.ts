import { beforeEach, describe, expect, it } from "vitest";
import { loadSession, saveSession, type SessionState } from "@/store/session-storage";
import type { Org } from "@/store/org-storage";

const orgA: Org = { id: "org_a", name: "Acme Corp", orgId: "acme", apiKey: "secret-key" };
const orgB: Org = { id: "org_b", name: "Beta Inc", orgId: "beta", apiKey: "secret-key-2" };

beforeEach(() => {
  localStorage.clear();
});

describe("session-storage", () => {
  it("round-trips a saved session", () => {
    const session: SessionState = {
      deviceId: "device_1",
      deviceName: "Living Room TV",
      url: "https://example.com",
      appId: "app-123",
    };
    saveSession(orgA, session);
    expect(loadSession(orgA)).toEqual(session);
  });

  it("keeps sessions for different orgs independent", () => {
    saveSession(orgA, { deviceId: "device_a", deviceName: "A", url: "u-a", appId: "app-a" });
    saveSession(orgB, { deviceId: "device_b", deviceName: "B", url: "u-b", appId: "app-b" });

    expect(loadSession(orgA).deviceId).toBe("device_a");
    expect(loadSession(orgB).deviceId).toBe("device_b");
  });
});
