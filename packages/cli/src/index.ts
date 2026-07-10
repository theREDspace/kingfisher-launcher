#!/usr/bin/env node

import { Command } from "commander";
import open from "open";
import { startServer } from "./server.js";

const DEFAULT_PORT = 4455;

export function parsePort(value: string): number {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid port "${value}" — expected a number between 1 and 65535.`,
    );
  }
  return port;
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name("kingfisher-launcher")
    .description("Launch the Kingfisher Launcher UI in your browser")
    .option(
      "-p, --port <number>",
      "port to run the local server on",
      String(DEFAULT_PORT),
    )
    .action(async (opts: { port: string }) => {
      let preferredPort: number;
      try {
        preferredPort = parsePort(opts.port);
      } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
        return;
      }
      const { url } = await startServer(preferredPort);
      console.log(`Kingfisher Launcher running at ${url}`);
      await open(url);
    });

  return program;
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  createProgram()
    .parseAsync(process.argv)
    .catch((err: unknown) => {
      console.error(err);
      process.exitCode = 1;
    });
}
