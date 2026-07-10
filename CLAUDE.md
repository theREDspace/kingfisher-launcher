# kingfisher-launcher

## What this is

An npm-installable CLI. Running it spins up a local server and serves an embedded React app, opening it in the user's default browser. The user experience is: run the CLI, see the app load in a browser tab.

The UI covers:
- Navbar (glass, sticky), org switcher dropdown, settings-cog Organization Management modal (list/form views, masked+reveal+copy API key, delete confirm, JSON import)
- Selected-device card (empty/selected states, status badges: online/offline, locked/unlocked — shown only when the source reports them)
- Launch section: URL + App ID inputs, Launch button, and a "Saved targets" (presets) dropdown — per-org named URL/App ID combos with add/edit/delete
- Device picker modal (search + table)
- Two collapsible edge panels: **Remote control** (right, placeholder graphic) and **Screen preview** (left, live capture simulation with empty/loading/ready states + refresh)
- Footer with REDspace branding and a "built for development" disclaimer

## Repo layout (monorepo)

- `packages/cli` — the published npm package. Commander-based CLI entrypoint; on run, starts an Express server that serves the built React app as static assets and opens it in the default browser.
- `packages/app` — the React app (Vite build). Built output is embedded into `packages/cli`'s published artifact as static assets.

## Tech stack

- **Package manager**: pnpm (workspace monorepo)
- **CLI**: Commander
- **Server**: Express, serving static files from the React app's Vite build output
- **Frontend**: React + Vite
- **Language**: TypeScript throughout (CLI, server, and app)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **Http Client**: ky
- **Font**: Plus Jakarta Sans (Google Fonts), per the design spec

## Conventions

- Keep the CLI package thin: argument parsing, server bootstrap, browser-open logic. App logic belongs in `packages/app`.
- The React app is built once via Vite and its `dist/` output is copied into the CLI package before publish — the CLI never runs a dev server for the app in production use.
- Use shadcn/ui's CLI to add components (don't hand-roll primitives it already covers) and lucide-react for all iconography.
- Define swappable client interfaces (`DeviceClient.listDevices`, `.launchApp`, `.captureScreen`) with stub/mock implementations so wiring in the real API later is a single-file swap.
- Orgs and saved launch targets (presets) persist in browser `localStorage`, keyed off the CLI's fixed server port so the origin — and thus storage — is stable across runs.
- Translate the design's inline hex values into Tailwind v4 `@theme` tokens (don't copy raw inline styles into components) so shadcn primitives consume them consistently.
- Avoid large modules or components; break page and components into more modular and manageable component files.

## Kingfisher API client (`lib/kingfisher/`)

`lib/kingfisher/client.ts` exports `kingfisher`, a typed wrapper over the Kingfisher REST API. Authentication uses `Authorization: Apikey {apiKey}`. Types in `lib/kingfisher/types.ts` match the REST API response shapes (snake_case field names).

Every response is a `{ result?, error? }` envelope — `unwrap()` throws on `error`/non-2xx and returns `result`.

**ky gotcha**: don't rely on ky's default `throwHttpErrors` + inspecting `HTTPError.response` to read an error body — ky's error-construction consumes the response stream, so a later `response.clone()`/read throws "body already used". Use `throwHttpErrors: false`, check `response.ok` yourself, read the body directly (see `unwrap`/`describeErrorResponse` in `lib/kingfisher/client.ts`).

## Installed Claude Code skills

- `typescript-lsp` (official) — TypeScript/JS language server for code intelligence.
- `tailwind-v4-shadcn` (secondsky/claude-skills) — Tailwind v4 + shadcn/ui setup patterns: `@theme inline`, CSS variable architecture, dark mode/ThemeProvider, Vite config, v3→v4 migration gotchas.
- `frontend-design` (official) — general frontend UI/design-quality guidance layered on top of the above.
