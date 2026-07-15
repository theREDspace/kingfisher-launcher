# Third-Party Licenses

This project's own code is licensed under the [MIT License](./LICENSE). This document summarizes the licenses of its npm dependencies (including transitive dependencies), across both `packages/cli` and `packages/app`.

Generated with:

```bash
pnpm -r licenses list
```

Regenerate at any time to get an up-to-date report; run `pnpm -r licenses list --long` for links to each package's repository.

## License summary

| License | Package count |
| --- | --- |
| MIT | 398 |
| ISC | 20 |
| BSD-3-Clause | 11 |
| Apache-2.0 | 9 |
| BSD-2-Clause | 6 |
| BlueOak-1.0.0 | 3 |
| MIT-0 | 2 |
| MPL-2.0 | 2 |
| Python-2.0 | 1 |
| CC-BY-4.0 | 1 |
| CC0-1.0 | 1 |
| 0BSD | 1 |

All licenses above are permissive (or, for MPL-2.0, weak/file-level copyleft). **No GPL, AGPL, or LGPL dependencies were found** in the resolved dependency tree as of this writing.

## Copyleft (MPL-2.0) dependencies

The two MPL-2.0 entries in the summary are one upstream project, [`lightningcss`](https://github.com/parcel-bundler/lightningcss):

- **`lightningcss`** — the JS package
- **`lightningcss-darwin-arm64`** — its per-platform native binary (on other platforms/CI the resolved binary is a different `lightningcss-*` package, e.g. `lightningcss-linux-x64-gnu`)

Both are **dev-only** dependencies, pulled in via Tailwind CSS v4's build pipeline. They are not shipped in the published CLI artifact.

**What MPL-2.0 requires of us:** it is a file-level copyleft license. Using the package — even a locally patched copy — imposes no obligation, and it does not affect the MIT licensing of this project's code. The obligation triggers only if we **modify `lightningcss`'s own source files and distribute the result**: those modified files must remain under MPL-2.0 with their source made available.

**House rule:** avoid modifying MPL-licensed packages. If a fix is unavoidable, apply it via `pnpm patch` so the patch file is committed to this (public) repo, and submit the change upstream — upstreaming isn't legally required, but it's the standard practice and removes any ongoing source-availability obligation.

When regenerating this report, re-check for new copyleft entries and update this section:

```bash
pnpm -r licenses list | grep -iE "MPL|GPL"
```
