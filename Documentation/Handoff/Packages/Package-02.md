# Package 2 — The verified state

> The verified state at the handoff's writing (2026-10-04): per-bundle tsc/build/smoke status, the
> profile wiring, the ledger files, and the pending confirmation agent. Part of
> `Documentation/Handoff/` — see `../Overview.md`.

| Bundle   | tsc | build           | smoke     | smoke file                |
| -------- | --- | --------------- | --------- | ------------------------- |
| factory  | 0   | minified Target | **30/30** | `/tmp/factory-smoke.mjs`  |
| governor | 0   | minified Target | **70/70** | `/tmp/governor-smoke.mjs` |
| pinner   | 0   | minified Target | **28/28** | `/tmp/pinner-smoke.mjs`   |
| cargo    | 0   | minified Target | **58/58** | `/tmp/cargo-smoke.mjs`    |
| mdash    | 0   | minified Target | **45/45** | `/tmp/mdash-smoke.mjs`    |

Every consumer smoke loads the **REAL factory instance** from `dsh-plugin-factory/Target/Library.js`
(the Service-base pattern — the factory's own smoke is the reference). Every ledger string is
byte-identical to the pre-refactor behavior (smoke-asserted).

**Profile**: `~/.dsh/profiles/desktop/package.json` carries the five `link:` dependencies;
`dsh.profile.bundles` order: `@deepseek-ai/dsh-base`, `@deepseek-ai/dsh-web-app`,
`@playform/dsh-plugin-factory`, `@playform/dsh-hook-package-governor`,
`@playform/dsh-hook-package-pinner`, `@playform/dsh-hook-cargo-governor`,
`@playform/dsh-hook-mdash`.

**Ledgers**: `~/.dsh/governor.log` · `~/.dsh/pinner.log` · `~/.dsh/cargo-governor.log` ·
`~/.dsh/mdash.log`.

**A confirmation + research agent** (`8176b172`) was launched 2026-10-04 to re-verify all five (tsc
×5, builds ×5, smokes, git cleanliness) AND research the granularization/factorization (see
[Package 4](Package-04.md) — its report refines the queue). If it has not reported yet, its verdict
is pending — check its session before starting new work.
