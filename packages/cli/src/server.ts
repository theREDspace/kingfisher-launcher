import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const MAX_PORT_ATTEMPTS = 20;

export interface StartedServer {
  port: number;
  url: string;
}

export function startServer(preferredPort: number): Promise<StartedServer> {
  const app = express();
  app.use(express.static(PUBLIC_DIR));

  return new Promise((resolve, reject) => {
    const tryListen = (port: number, attemptsLeft: number) => {
      // Deliberately not passing a callback to `.listen()` — Express's `app.listen`
      // wraps that argument in a `once()` and attaches it to BOTH the "listening" and
      // "error" events, so a failed bind would still resolve with the wrong port.
      const server = app.listen(port, "127.0.0.1");

      const onListening = () => {
        server.off("error", onError);
        resolve({ port, url: `http://localhost:${port}` });
      };

      const onError = (err: NodeJS.ErrnoException) => {
        server.off("listening", onListening);
        if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
          if (port === preferredPort) {
            console.warn(
              `Port ${preferredPort} is in use — falling back to another port. Saved organizations/devices from a previous run won't carry over (they're tied to the port).`,
            );
          }
          server.close();
          tryListen(port + 1, attemptsLeft - 1);
          return;
        }
        reject(err);
      };

      server.once("listening", onListening);
      server.once("error", onError);
    };

    tryListen(preferredPort, MAX_PORT_ATTEMPTS);
  });
}
