import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { startServerMock, openMock } = vi.hoisted(() => ({
  startServerMock: vi.fn(),
  openMock: vi.fn(),
}));

vi.mock("./server.js", () => ({ startServer: startServerMock }));
vi.mock("open", () => ({ default: openMock }));

const { parsePort, createProgram } = await import("./index.js");

describe("parsePort", () => {
  it("throws on an out-of-range or non-numeric port", () => {
    expect(parsePort("4455")).toBe(4455);
    expect(() => parsePort("abc")).toThrow(/Invalid port/);
  });
});

describe("createProgram", () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    startServerMock.mockReset();
    openMock.mockReset();
    process.exitCode = undefined;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("starts the server on the requested port and opens the browser", async () => {
    startServerMock.mockResolvedValue({
      port: 1234,
      url: "http://localhost:1234",
    });

    await createProgram().parseAsync([
      "node",
      "kingfisher-launcher",
      "--port",
      "1234",
    ]);

    expect(startServerMock).toHaveBeenCalledWith(1234);
    expect(openMock).toHaveBeenCalledWith("http://localhost:1234");
  });

  it("reports an invalid port and exits without starting the server", async () => {
    await createProgram().parseAsync([
      "node",
      "kingfisher-launcher",
      "--port",
      "abc",
    ]);

    expect(startServerMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
