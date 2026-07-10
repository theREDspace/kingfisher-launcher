import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDist = path.resolve(__dirname, "../../app/dist");
const targetDir = path.resolve(__dirname, "../public");

if (!existsSync(appDist)) {
  console.error(
    `Cannot find built app at ${appDist}. Run "pnpm --filter @redspace/kingfisher-launcher-app build" first.`,
  );
  process.exit(1);
}

rmSync(targetDir, { recursive: true, force: true });
cpSync(appDist, targetDir, { recursive: true });
console.log(`Copied app build from ${appDist} to ${targetDir}`);
