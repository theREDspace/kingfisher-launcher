import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// GitHub renders a bare user-attachments URL as a playable inline video, but
// npm's README renderer just shows it as a plain link. For the copy that
// ships to npm, swap it for a clickable cover image pointing at the same
// video - the raw.githubusercontent URL works on both GitHub and npm since
// it doesn't depend on npm's relative-link rewriting (which can't resolve
// this generated README's path in the repo anyway).
const DEMO_VIDEO_URL =
  "https://github.com/user-attachments/assets/265499f5-ddcb-495d-a218-682dfe991f0a";
const DEMO_COVER_IMAGE_URL =
  "https://raw.githubusercontent.com/theREDspace/kingfisher-launcher/main/packages/app/public/kingfisher-cover.jpg";

for (const file of ["README.md", "LICENSE"]) {
  const source = path.resolve(repoRoot, file);
  if (!existsSync(source)) {
    console.error(`Cannot find ${source}.`);
    process.exit(1);
  }
  const dest = path.resolve(__dirname, "..", file);
  if (file === "README.md") {
    const content = readFileSync(source, "utf8");
    if (!content.includes(DEMO_VIDEO_URL)) {
      console.error(
        `Expected demo video URL not found in README.md - update DEMO_VIDEO_URL in ${path.basename(import.meta.url)}.`,
      );
      process.exit(1);
    }
    writeFileSync(
      dest,
      content.replace(
        DEMO_VIDEO_URL,
        `[![Kingfisher Launcher demo](${DEMO_COVER_IMAGE_URL})](${DEMO_VIDEO_URL})`,
      ),
    );
  } else {
    cpSync(source, dest);
  }
  console.log(`Copied ${file} from repo root`);
}
