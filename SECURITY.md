# Security Policy

## Supported versions

Kingfisher Launcher is currently pre-1.0 (`0.x`). Security fixes are released against the latest published version on npm; older `0.x` versions are not separately patched.

| Version | Supported |
| ------- | --------- |
| Latest `0.x` | :white_check_mark: |
| Older `0.x` | :x: |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report it privately using [GitHub's private vulnerability reporting](https://github.com/theREDspace/kingfisher-launcher/security/advisories/new) (Security tab → "Report a vulnerability"). This requires the maintainers to have private vulnerability reporting enabled for the repository (Settings → Code security → Private vulnerability reporting).

<!-- TODO: replace with a monitored security contact email if GitHub private reporting isn't enabled, e.g. security@redspace.com -->

We'll acknowledge new reports as soon as possible and aim to provide an initial assessment as soon as possible. Once a fix is available, we'll coordinate disclosure timing with the reporter.

## Scope

Kingfisher Launcher is a local development utility: it runs a server bound to `127.0.0.1` and stores organization/API-key data in browser `localStorage`. Reports involving exposure of stored Kingfisher API keys, unintended network exposure of the local server, or vulnerabilities in the Kingfisher API client are in scope.
