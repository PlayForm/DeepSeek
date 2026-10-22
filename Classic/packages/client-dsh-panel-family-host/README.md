# @playform/client-dsh-panel-family-host

The **host half** of the UI family's panel: the small companion package
that gives the central panel live data (Documentation/Plans/UI-Family/
PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md).

## The endpoint

Two methods, least privilege, **read-only** - the endpoint reads `~/.dsh`
family logs only and has no write surface (A5.3):

- **`tail(namespace, lines)`** - the last N lines of the owning module's
  `~/.dsh/<namespace>.log`. The namespace must be a family module name
  (`[a-z0-9-]+`); anything else is *rejected*, not sanitized (no path
  traversal). Returns `{ ok: true, namespace, lines }` or
  `{ ok: false, code: "rejected" | "not-found", message }`.
- **`stats()`** - the ccr store summary (log path, byte size, line count).
  The ccr LRU internals are not exposed by any existing remote; the Typert
  spike (end-phase) decides whether they ever are.
- **`fiberPhases` are NOT here** - they come from the already-remote
  `remote.pluginManager` (PHASE-5: prefer the existing remote).

## Typert status

The Typert generation pipeline (`TypertRemoteService` + `@Remote` +
generated descriptors) is documented as not reproducible from an external
package. This PoC ships the endpoint as a plain host service under
**`panelFamilyHost`** with the exact method surface; the end-phase either
reproduces the pipeline or keeps the v1 shortcut (the pre-decided fallback
in PHASE-5 step 1).

## Config

| Field      | Type   | Default        | Meaning                        |
| ---------- | ------ | -------------- | ------------------------------ |
| `enabled`  | boolean| `false`        | a disabled endpoint refuses to read |
| `logRoot`  | string | `~/.dsh`       | family ledger root             |
| `maxLines` | number | `200` (1..2000)| the cap on any `tail()`        |
| `ccrLog`   | string | `~/.dsh/ccr.log`| the ccr log for `stats()`     |

All knobs are volatile.

## Ledger

`host: activated (enabled=<enabled>)` - the only line this package writes
(via the logger, not a ledger file: the package writes nothing to disk).
