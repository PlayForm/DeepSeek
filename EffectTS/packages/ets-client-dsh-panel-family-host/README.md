# @playform/ets-client-dsh-panel-family-host

> v0.1.0 - UNPUBLISHED - plan:
> [PHASE-5](../../Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md),
> [PHASE-7](../../Documentation/Plans/UI-Family/PHASE-7-PLAIN-FIELD-BRIDGE.md)

## The role

This package is the **host half** of the UI family's panel: the companion package that gives the
central panel live data and its ONE trusted write surface (Documentation/Plans/UI-Family/
PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md, PHASE-7-PLAIN-FIELD-BRIDGE.md).

## The surfaces (the services)

It provides three services with `ctx.provide` (the plugin removal takes them away):

| Service             | Methods                             | Posture                                                   |
| ------------------- | ----------------------------------- | --------------------------------------------------------- |
| `panelFamilyHost`   | `tail(namespace, lines)`, `stats()` | read-only (`~/.dsh` family logs and the ccr log)          |
| `panelFamilyBridge` | `editFull(namespace, patch)`        | the plain-field bridge: the ONE full-config write surface |
| `panelFamilyTrace`  | `on(kind, listener)`, `ring(limit)` | read-only forwarding of the D5 bus                        |

### `panelFamilyHost` (read-only)

- **`tail(namespace, lines)`** - the last N lines of the owning module's `~/.dsh/<namespace>.log`.

    The namespace must be a family module name (`[a-z0-9-]+`); the host _rejects_ anything else and
    does not sanitize it (no path traversal).

    It returns `{ ok: true, namespace, lines }` or
    `{ ok: false, code: "rejected" | "not-found", message }`.

- **`stats()`** - the ccr store summary (log path, byte size, line count).

    No existing remote exposes the ccr LRU internals; the Typert spike (end-phase) decides whether
    they ever are.

- **`fiberPhases` are NOT here** - they come from the already-remote `remote.pluginManager`.

### `panelFamilyBridge` (the write surface)

`editFull(namespace, patch)` applies the namespace's **whole resolved config** through
`ctx.configEditor.edit()` - the same validate/persist/reconcile path that a hand edit takes, so a
plain (non-volatile) field applies on remount.

The host never merges or reshapes the patch here; the editor validates it, and **the audit line
comes from the editor** (this package logs no success line).

The host refuses, in order (each line byte-exact, see "Ledger lines"):

1. **The namespace.**

    The host refuses a namespace that is not a non-empty string.

2. **The patch.**

    The host refuses a patch that is not a plain object.

3. **The composition.**

    The host refuses a composition without `ctx.configEditor`.

4. **The profile entry.**

    The host refuses a namespace that names no profile entry.

5. **The secret field.**

    The host refuses a namespace that declares a `role("secret")` field at ANY depth - the patch
    would restate a redacted value over the stored secret (the client refuses the same write
    independently; the host never trusts the client's refusal).

6. **The editor rejection.**

    The host refuses the edit when the editor rejects it (never thrown into the panel).

The `enabled` gate covers the bridge too: a disabled package refuses every method, so it never
writes while idle.

### `panelFamilyTrace` (the D5 forwarding face)

The host process's D5 bus is `ctx.trace` (provided by `@playform/ets-plugin-dsh-factory`); the host
context already owns that name, so this package exposes its forwarder as **`panelFamilyTrace`** with
the panel's `on(kind, listener)` / `ring(limit)` face.

It reads the bus structurally (only `on` is required; it uses `ring` when the bus has one) and it
provides nothing when the bus is absent - the panel's documented static fallback.

## The forwarding path (the browser)

The panel runs in the browser; the two host faces reach it through the harness's generated Remote
namespace `playformFamilyPanel`:

```text
host: panelFamilyBridge.editFull   --(generated Remote: playformFamilyPanel/editFull)-->  browser
host: panelFamilyTrace.on/ring     --(generated Remote: playformFamilyPanel/trace)------->  browser
browser ./client half: re-publishes them as panelFamilyBridge and trace
panel: ctx.get("panelFamilyBridge") / ctx.get("trace")
```

The browser half (`Source/Client.ts`) waits for the `remote.playformFamilyPanel` namespace service
(`ctx.inject`), re-publishes `editFull` under `panelFamilyBridge` (normalizing the gateway's
`{ ok }` envelope to the panel's boolean contract) and the trace face under `trace`, and it provides
nothing when the namespace is absent.

**The residual**: the generated Remote contribution (the Typert codegen artifacts plus the
`@deepseek-ai/dsh-api-remotes` assembly mount) is not reproducible from a Classic package - the
harness's Client Remote refuses SRC descriptors and its registration values come from the generated
`lib/typert.remote-client.*` artifacts.

Until that contribution lands, the browser half stays inert and the panel keeps its documented
fallbacks (plain fields read-only, static status).

The host services themselves are complete and smoke-covered.

## The configuration

| Field      | Type    | Default                                | Meaning                                 |
| ---------- | ------- | -------------------------------------- | --------------------------------------- |
| `enabled`  | boolean | `false`                                | a disabled package refuses every method |
| `logRoot`  | string  | `~/.dsh`                               | family ledger root                      |
| `maxLines` | number  | `200` (1..2000)                        | the cap on any `tail()`                 |
| `ccrLog`   | string  | `~/.dsh/playform/ets-hook-dsh-ccr.log` | the ccr log for `stats()`               |

All knobs are volatile.

## The ledger (byte-exact)

The activation line and the bridge refusals go through the logger (the package writes nothing to
disk):

```text
host: activated (enabled=<enabled>)
bridge: secret namespace refused for <namespace>
bridge: invalid namespace <namespace>
bridge: invalid patch for <namespace>
bridge: unknown namespace <namespace>
bridge: config editor unavailable
bridge: disabled (enabled=false)
bridge: write failed for <namespace>
```

The accepted bridge write's audit line is the config editor's own.

## The build and the tests

`pnpm prepublishOnly` runs the plugin build (ESM `Target/`), then
`Maintain/Build/Client-Bundle/Index.mjs` (the harness closure factory
`window.__ModuleLoader__.load({ id, factory(require) })` written to `Target/Client.bundle.js`), then
the Test build and the harness selfcheck.

`exports["./client"]` points the module system at the bundle; the ESM `Target/Client.js` stays the
dev/test surface.

| Folder                 | Count   | Covers                                                                                                                                                        |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tail-And-Stats`       | 10 PASS | the tail slicing/validation/cap and the ccr stats summary                                                                                                     |
| `Wiring-And-Endpoints` | 8 PASS  | the loader row, the activation lines, the disabled gate, the schema                                                                                           |
| `Bridge-And-Trace`     | 19 PASS | the bridge write + every refusal (incl. nested secrets), the trace forwarding, the browser half's forwarding, the built bundle executed through a fake loader |

## The plan

- [PHASE-5-ADAPTERS-AND-LEDGER-TAILS](../../Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md) -
  the tail/stats endpoints.
- [PHASE-7-PLAIN-FIELD-BRIDGE](../../Documentation/Plans/UI-Family/PHASE-7-PLAIN-FIELD-BRIDGE.md) -
  the bridge.

## License

CC0-1.0.
