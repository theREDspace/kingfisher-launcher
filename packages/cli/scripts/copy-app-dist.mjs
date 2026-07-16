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

// README and LICENSE live at the repo root; npm only ships files from the
// package dir, so copy them in so the published tarball (and npm page) has them.
const repoRoot = path.resolve(__dirname, "../../..");
for (const file of ["README.md", "LICENSE"]) {
  const source = path.resolve(repoRoot, file);
  if (!existsSync(source)) {
    console.error(`Cannot find ${source}.`);
    process.exit(1);
  }
  cpSync(source, path.resolve(__dirname, "..", file));
  console.log(`Copied ${file} from repo root`);
}
