# SCHEME - @playform/client-dsh-panel-family-host

The package's contract scheme (Documentation/Plans/UI-Family/ PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md,
PHASE-7-PLAIN-FIELD-BRIDGE.md).

## 1. Identity

| Place           | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| package name    | `@playform/client-dsh-panel-family-host`                                |
| `name` export   | `client-dsh-panel-family-host`                                          |
| services        | `panelFamilyHost`, `panelFamilyBridge`, `panelFamilyTrace`              |
| client bundle   | `Target/Client.bundle.js` (id `@playform/client-dsh-panel-family-host`) |
| activation line | `host: activated (enabled=<enabled>)`                                   |

## 2. The loader contract

Object form: `name`, `apply`, `Config` (the Schemastery schema), `inject` (`[]`). The default object
carries all four.

## 3. The service surface

### `panelFamilyHost` (read-only)

- `tail(namespace, lines)` - validated namespace (`[a-z0-9-]+`, rejected not sanitized), lines
  capped at `maxLines`, read of `<logRoot>/<namespace>.log`. Read-only.
- `stats()` - the ccr log summary (path, bytes, lines). Read-only.
- `fiberPhases` - NOT here (existing `remote.pluginManager`).

### `panelFamilyBridge` (the ONE full-config write surface)

`editFull(namespace, patch)` over `ctx.configEditor.edit(entry, change)`:

- the entry is resolved from `ctx.configEditor.entries()` by `options.id === namespace`;
- the patch is passed as the change callback's return, i.e. the namespace's WHOLE resolved config;
- the editor validates, persists, and reconciles the Loader (a plain field applies on remount), and
  the editor's own path emits the audit line - this package logs no success line;
- refusals (byte-exact lines in section 5): invalid namespace, invalid patch, no config editor,
  unknown namespace, a namespace declaring `role("secret")` at any depth, an editor rejection;
- a disabled package (`enabled: false`) refuses before resolving the editor.

The secret rule is the host's INDEPENDENT refusal (`Function/Secret.ts` walks the serialized
Schemastery schema for `meta.role === "secret"` at any depth); the client marks the same namespace,
but the host never trusts that mark. The patch of a secret namespace would restate a redacted value
over the stored secret, so it is refused, never merged.

### `panelFamilyTrace` (the D5 forwarding face)

`on(kind, listener)` and `ring(limit)` forward `ctx.trace` (the factory's D5 bus) structurally: only
`on` is required; `ring` is used when the bus has one. Provided only when the bus exists (otherwise
the panel's static fallback). The name is `panelFamilyTrace` because the host context already owns
`trace`; the browser half re-publishes it as `trace`.

## 4. The browser half (`./client`)

Named exports `inject = ["remote"]` and `apply(ctx)`. The body waits for the harness's
`remote.playformFamilyPanel` namespace service (`ctx.inject`) and re-publishes:

| Host face                    | Browser service              | Normalization                                        |
| ---------------------------- | ---------------------------- | ---------------------------------------------------- |
| `panelFamilyBridge.editFull` | `panelFamilyBridge.editFull` | the gateway's `{ ok: true }` envelope becomes `true` |
| `panelFamilyTrace.on/ring`   | `trace.on/ring`              | none (the panel's `on`/`ring` contract)              |

Without the namespace it provides nothing. **The residual**: the generated Remote contribution
(Typert codegen artifacts + the `dsh-api-remotes` assembly mount) is not reproducible from a Classic
package - the harness's Client Remote refuses SRC descriptors, and its registration values come from
the generated `lib/typert.remote-client.*` artifacts. The browser half is therefore inert until that
contribution lands; the panel keeps its documented fallbacks.

## 5. Least privilege and the ledger

`panelFamilyHost` reads `~/.dsh` family logs ONLY. `panelFamilyBridge` is the ONE place this package
is trusted with a full-config write; it never writes a file itself (the editor owns the write path)
and never touches a secret namespace. A disabled package answers every method with a refusal instead
of silently passing. The logger lines, byte-exact:

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

Typert (`TypertRemoteService` + `@Remote` + descriptors + `RemoteError` codes) is not reproducible
from an external package per the documented caveat; the PoC ships the plain services and the browser
half waits for the generated namespace. The end-phase decision: reproduce the generation pipeline,
or keep the v1 shortcut (expose only existing remote namespaces; the bridge and the trace via this
package's services).

## 7. Verification

- `prepublishOnly` builds `Target/`, writes `Target/Client.bundle.js` through
  `Maintain/Build-Client-Bundle.mjs`, builds `Target/Test/`, runs the harness selfcheck, and
  type-checks the Test tree.
- `Tail-And-Stats` 10 PASS, `Wiring-And-Endpoints` 8 PASS, `Bridge-And-Trace` 19 PASS.

## 8. The EffectTS twin

Deferred to the ETS parity wave (wave 5 of the completion spec); the Classic tree is the contract
source for it.
