import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KingfisherAuth } from "@/lib/kingfisher/client";

const getMock = vi.fn();

vi.mock("ky", () => ({
  default: { get: getMock, post: vi.fn(), patch: vi.fn() },
}));

const { kingfisher } = await import("@/lib/kingfisher/client");

const AUTH: KingfisherAuth = { orgId: "org-1", apiKey: "secret-key" };

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  getMock.mockReset();
});

describe("unwrap error handling", () => {
  it("throws using the envelope's structured error when the HTTP status is non-2xx", async () => {
    getMock.mockResolvedValue(
      jsonResponse(404, { error: { message: "Device not found", status: 404 } }),
    );
    await expect(kingfisher.getDevice(AUTH, "dev-1")).rejects.toThrow("Device not found (404)");
  });

  it("throws when the response is 2xx but the envelope itself carries an error", async () => {
    getMock.mockResolvedValue(jsonResponse(200, { error: { code: "BAD_STATE" } }));
    await expect(kingfisher.getDevice(AUTH, "dev-1")).rejects.toThrow("Request failed.");
  });
});

describe("screenshot", () => {
  it("base64-encodes the raw PNG bytes from the response body", async () => {
    const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    getMock.mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => ({ arrayBuffer: async () => bytes.buffer }),
    } as unknown as Response);

    const result = await kingfisher.screenshot(AUTH, "dev-1");

    expect(result).toBe("SGVsbG8="); // base64 of "Hello"
  });
});
