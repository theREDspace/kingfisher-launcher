import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targets = [
  path.resolve(__dirname, "../package.json"),
  path.resolve(__dirname, "../packages/cli/package.json"),
  path.resolve(__dirname, "../packages/app/package.json"),
];

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error("Usage: pnpm bump <version>  (e.g. pnpm bump 0.2.0)");
  process.exit(1);
}

for (const file of targets) {
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  pkg.version = version;
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`${path.relative(process.cwd(), file)} -> ${version}`);
}
