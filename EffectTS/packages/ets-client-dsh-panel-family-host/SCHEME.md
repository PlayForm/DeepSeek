# SCHEME - @playform/ets-client-dsh-panel-family-host

This file states the contract scheme of the package, which follows Documentation/Plans/UI-Family/
PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md and PHASE-7-PLAIN-FIELD-BRIDGE.md.

## 1. Identity

| Place           | Value                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| package name    | `@playform/ets-client-dsh-panel-family-host`                                |
| `name` export   | `client-dsh-panel-family-host`                                              |
| services        | `panelFamilyHost`, `panelFamilyBridge`, `panelFamilyTrace`                  |
| client bundle   | `Target/Client.bundle.js` (id `@playform/ets-client-dsh-panel-family-host`) |
| activation line | `host: activated (enabled=<enabled>)`                                       |

## 2. The loader contract

The object form carries `name`, `apply`, `Config` (the Schemastery schema), and `inject` (`[]`).

The default object carries all four.

## 3. The service surface

### `panelFamilyHost` (read-only)

- `tail(namespace, lines)` reads `<logRoot>/<namespace>.log`, validates the namespace (`[a-z0-9-]+`,
  rejected and not sanitized), and caps the lines at `maxLines`. It is read-only.
- `stats()` gives the ccr log summary (path, bytes, lines) and is read-only.
- `fiberPhases` is NOT here, because the existing `remote.pluginManager` owns it.

### `panelFamilyBridge` (the ONE full-config write surface)

`editFull(namespace, patch)` over `ctx.configEditor.edit(entry, change)`:

- the entry comes from `ctx.configEditor.entries()` where `options.id === namespace`;
- the patch is the return value of the change callback, which is the WHOLE resolved config of the
  namespace;
- the editor validates, persists, and reconciles the Loader, where a plain field applies on remount,
  and the editor path emits the audit line, so this package logs no success line;
- the refusals, with byte-exact lines in section 5, are an invalid namespace, an invalid patch, no
  config editor, an unknown namespace, a namespace that declares `role("secret")` at any depth, and
  an editor rejection;
- a disabled package (`enabled: false`) refuses before it resolves the editor.

The secret rule is the INDEPENDENT refusal of the host, and `Function/Secret.ts` walks the
serialized Schemastery schema for `meta.role === "secret"` at any depth.

The client marks the same namespace, but the host never trusts that mark.

A patch of a secret namespace would restate a redacted value over the stored secret, so the host
refuses it and never merges it.

### `panelFamilyTrace` (the D5 forwarding face)

`on(kind, listener)` and `ring(limit)` forward `ctx.trace`, the D5 bus of the factory, in a
structural way.

Only `on` is required, and `ring` is used when the bus has one.

The service is provided only when the bus exists, and otherwise the panel keeps its static fallback.

The name is `panelFamilyTrace` because the host context already owns `trace`, and the browser half
re-publishes it as `trace`.

## 4. The browser half (`./client`)

The module has the named exports `inject = ["remote"]` and `apply(ctx)`.

The body waits for the `remote.playformFamilyPanel` namespace service of the harness (`ctx.inject`)
and re-publishes:

| Host face                    | Browser service              | Normalization                                        |
| ---------------------------- | ---------------------------- | ---------------------------------------------------- |
| `panelFamilyBridge.editFull` | `panelFamilyBridge.editFull` | the gateway's `{ ok: true }` envelope becomes `true` |
| `panelFamilyTrace.on/ring`   | `trace.on/ring`              | none (the panel's `on`/`ring` contract)              |

Without the namespace it provides nothing.

**The residual**: the generated Remote contribution is not reproducible from a Classic package,
because the Client Remote of the harness refuses SRC descriptors and its registration values come
from the generated `lib/typert.remote-client.*` artifacts; that contribution is the Typert codegen
artifacts plus the `dsh-api-remotes` assembly mount.

The browser half is therefore inert until that contribution lands, and the panel keeps its
documented fallbacks.

## 5. Least privilege and the ledger

`panelFamilyHost` reads the family logs in `~/.dsh` ONLY.

`panelFamilyBridge` is the ONE place where this package is trusted with a full-config write, it
never writes a file itself because the editor owns the write path, and it never touches a secret
namespace.

A disabled package answers every method with a refusal instead of passing silently.

The logger lines are byte-exact:

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

## 6. The Typert gap (end-phase)

Typert, which is `TypertRemoteService` plus `@Remote`, descriptors, and `RemoteError` codes, is not
reproducible from an external package under the documented caveat.

The PoC ships the plain services, and the browser half waits for the generated namespace.

The end-phase decision is to reproduce the generation pipeline or to keep the v1 shortcut, which
exposes only existing remote namespaces and reaches the bridge and the trace through the services of
this package.

## 7. Verification

- `prepublishOnly` builds `Target/`, writes `Target/Client.bundle.js` through
  `Maintain/Build-Client-Bundle.mjs`, builds `Target/Test/`, runs the selfcheck of the harness, and
  type-checks the Test tree.
- `Tail-And-Stats` 10 PASS, `Wiring-And-Endpoints` 8 PASS, `Bridge-And-Trace` 19 PASS.

## 8. The EffectTS twin

This twin is deferred to the ETS parity wave, which is wave 5 of the completion spec, and the
Classic tree is its contract source.
