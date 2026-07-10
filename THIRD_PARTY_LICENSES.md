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

## Notable dependencies

- **`lightningcss`** (dev dependency, via Tailwind CSS v4's build pipeline) — **MPL-2.0**. This is a file-level copyleft license: it only requires that modifications to `lightningcss`'s own source files be shared under MPL-2.0. It does not extend to code that merely uses it as a build tool, so it does not affect the MIT licensing of this project's code.

All other dependencies are standard, permissively-licensed public npm packages (React, Vite, Express, Commander, Tailwind CSS, etc.) with no internal or private REDspace-registry packages in the tree.
