import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listenMock = vi.fn();
const useMock = vi.fn();
const staticMock = vi.fn(() => "static-middleware");

vi.mock("express", () => {
  const express = vi.fn(() => ({ use: useMock, listen: listenMock }));
  Object.assign(express, { static: staticMock });
  return { default: express };
});

const { startServer } = await import("./server.js");

interface FakeServer extends EventEmitter {
  close: () => void;
}

function fakeServer(): FakeServer {
  const emitter = new EventEmitter() as FakeServer;
  emitter.close = vi.fn();
  return emitter;
}

function errorWithCode(code: string): NodeJS.ErrnoException {
  return Object.assign(new Error(code), { code });
}

describe("startServer", () => {
  beforeEach(() => {
    listenMock.mockReset();
  });

  it("binds to 127.0.0.1 and resolves with the preferred port when the bind succeeds", async () => {
    listenMock.mockImplementation(() => {
      const server = fakeServer();
      queueMicrotask(() => server.emit("listening"));
      return server;
    });

    await expect(startServer(5000)).resolves.toEqual({
      port: 5000,
      url: "http://localhost:5000",
    });
    expect(listenMock).toHaveBeenCalledWith(5000, "127.0.0.1");
  });

  it("retries on the next port after EADDRINUSE and resolves once bound", async () => {
    let call = 0;
    listenMock.mockImplementation(() => {
      call++;
      const server = fakeServer();
      queueMicrotask(() => {
        if (call === 1) server.emit("error", errorWithCode("EADDRINUSE"));
        else server.emit("listening");
      });
      return server;
    });

    await expect(startServer(5000)).resolves.toEqual({
      port: 5001,
      url: "http://localhost:5001",
    });
    expect(listenMock).toHaveBeenCalledTimes(2);
  });

  it("rejects immediately on a non-EADDRINUSE error, without retrying", async () => {
    listenMock.mockImplementation(() => {
      const server = fakeServer();
      queueMicrotask(() => server.emit("error", errorWithCode("EACCES")));
      return server;
    });

    await expect(startServer(5000)).rejects.toMatchObject({ code: "EACCES" });
    expect(listenMock).toHaveBeenCalledTimes(1);
  });
});
