# Fresh-Stat-And-Keep-List

This test verifies the following behavior.

## Intent

The fresh-stat write basis is the pinner's version-safety story, and the keep-list discovery is its contract with the governor and the user's policies.

(a) A file advanced between the observation and the chain is incorporated, not clobbered, because the old observed-version refusal is gone by design (the live fold-abort fix).

(b) The remaining guard still fails safely: a write landing between the fresh stat and the writeText fails FS_STALE_VERSION, contained logger-only, with no pinned line and no clobber.

The keep-list section covers the H1-H6 matrix: the dir sidecar, the global policyFile union, the registry-co-located sidecar, the unreadable sidecar's logged line, the configured-but-absent global (silent), and the P3 interlock (chain pins are never stripped, so the governor x pinner ping-pong cannot start).

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` sections 7-8.

## Scenario

- Group: the fresh-stat write basis (the sequential-fold fix).
    - Sub: "fresh-stat basis: a file advanced between the observation and the chain is incorporated (the old observed-version refusal is gone by design - the live fold-abort fix)"
    - Sub: "stat->write window: a racing write after the fresh stat still fails safely, contained logger-only"
- Group: the keep-list discovery (union + order + the P3 interlock).
    - Sub: "keep-list: pin-policy.json protects tailwindcss, others pinned"
    - Sub: "keep-list: global policyFile U+222A dir sidecar (the union, not first-wins)"
    - Sub: "keep-list: the sidecar co-located with the discovered registry.json is absorbed"
    - Sub: "keep-list: unreadable sidecar -> logged line + built-in default"
    - Sub: "keep-list: configured-but-absent policyFile is silently not a source"
    - Sub: "the P3 interlock: chain names are always in the keep-list - the governor x pinner ping-pong cannot start"

## Fixtures

The harness Boot uses the real-token fs.

The race injector (`Race.Armed`) covers the stale-write window.

The per-H fixtures are keep1..keep6 directories with `pin-policy.json` sidecars (unlinked after each pass), the global `global-policy.json`, the root `registry.json` (with and without `effectiveLatest`), and two sub-worlds (`ctxG`, `ctxA`) built with fresh MakeContext + factory + apply for the global-policy variants.

## Expected ledger strings (byte-identical)

- `pinned <path> (2 versions)` (the incorporated advanced file)
- `hook-dsh-pinner-package: continuation error (suppressed): FS_STALE_VERSION: <path>` (logger line, U+2014 none)
- `unreadable pin-policy.json at <path> - using built-in default` (U+2014)

## Edge cases

- The race injector fires exactly once (asserted), and it is the only window where FS_STALE_VERSION can occur after the fresh-stat basis.
- The stale-window pass must produce NO pinned line and NO write, and the racing write survives intact.
- The absent global policy logs NOTHING (no unreadable line).
- Three repeated re-observations of the chain-pinned file never change it (no ping-pong).

## Expected count

8 PASS.
