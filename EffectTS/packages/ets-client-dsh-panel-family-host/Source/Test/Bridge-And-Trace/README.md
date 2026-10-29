# Bridge-And-Trace - the two new surfaces of the host half

The suite covers the plain-field bridge (`panelFamilyBridge.editFull`) and the D5 trace
forwarder (`panelFamilyTrace`) against the real built apply and the fake seams.

It also covers the browser half, which forwards the Remote namespace, and the built
closure-factory bundle executed through a fake `window.__ModuleLoader__`.

## Scenarios

- B1: the host provides `panelFamilyBridge` with `editFull`.
- B2: a plain patch applies through `edit(entry, change)` of the config editor, the
  recorded patch is the WHOLE config of the namespace, and no warning is logged,
  because the audit line belongs to the editor.
- B3: a namespace that declares a top-level `role("secret")` field is refused with
  the byte-exact line `bridge: secret namespace refused for hook-dsh-secret-test`,
  and the editor is never called.
- B4: a NESTED secret field inside an object is refused on the same rule.
- B5: an unknown namespace is refused with `bridge: unknown namespace
  hook-dsh-missing`, and nothing is written.
- B6: a composition without `ctx.configEditor` is refused with `bridge: config
  editor unavailable`.
- B7: a non-object patch is refused with `bridge: invalid patch for
  hook-dsh-normalize-dash` before the editor is touched.
- B8: a disabled package refuses the bridge first with `bridge: disabled
  (enabled=false)`, so the idle posture never writes.
- B9: an editor rejection is reported with `bridge: write failed for
  hook-dsh-normalize-dash` and is never thrown into the panel.
- T1: `panelFamilyTrace` is provided when `ctx.trace` exists, with `on` and
  `ring`.
- T2: `on` forwards a bus event to its listener with the bus-completed envelope
  (the trace id, the kind, the payload).
- T3: `ring` reads the bus newest first and honors the limit.
- T4: without the bus no forwarder is provided, and the panel keeps its
  documented static fallback.
- C1: the `./client` half requires the `remote` gateway and waits for the
  `remote.playformFamilyPanel` namespace service.
- C2: it re-publishes the two members of the namespace as `panelFamilyBridge`
  and `trace`, the names the panel resolves.
- C3: the forwarded `editFull` normalizes the `{ ok: true }` answer of the
  gateway to the boolean contract of the panel.
- C4: the forwarded `trace` relays a namespace event and its ring.
- C5: without the namespace the client half provides nothing.
- K1: `Target/Client.bundle.js` is the closure factory
  `window.__ModuleLoader__.load({ id, factory })` with the package id, and the
  factory returns `inject`/`apply`/`default` and requires no external.

## Fixtures

The shared Harness holds the real built `Target/Library.js` and `Target/Client.js`,
the fake host ctx (`ctx.get` for the optional services, the `ctx.provide`
capture, the logger), the fake config editor (`entries()` plus `edit()` capture),
the fake D5 bus (`on`/`ring`/`emit`), and the fake client ctx (`get`,
`provide`, `inject`).

No clock and no sleeps run, because every check is a synchronous call or an
awaited `editFull`.

## Expected strings (byte-exact)

`bridge: secret namespace refused for hook-dsh-secret-test`,
`bridge: unknown namespace hook-dsh-missing`,
`bridge: config editor unavailable`,
`bridge: invalid patch for hook-dsh-normalize-dash`,
`bridge: disabled (enabled=false)`,
`bridge: write failed for hook-dsh-normalize-dash`,
`@playform/ets-client-dsh-panel-family-host`.

## Expected count

19 PASS.
