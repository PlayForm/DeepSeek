# client-dsh-panel-family-host - the live test plan

## Identity

- Package: `@playform/client-dsh-panel-family-host` (Classic/packages/client-dsh-panel-family-host),
  version 0.1.0 (package.json). The package tree currently carries uncommitted changes - this plan
  describes the on-disk contract (SCHEME.md, README.md) without asserting build/verification status.
- Profile row id: `client-dsh-panel-family-host` (bundled in the desktop profile).
- Exposes three services (provided with `ctx.provide`, removed with the plugin):
    - `panelFamilyHost` (read-only): `tail(namespace, lines)` - the last N lines of
      `~/.dsh/<namespace>.log`, namespace validated as `[a-z0-9-]+` and rejected (not sanitized) on
      mismatch, lines capped at `maxLines`; returns `{ ok: true, namespace, lines }` or
      `{ ok: false, code: "rejected" | "not-found", message }`. `stats()` - the ccr log summary (log
      path, byte size, line count). `fiberPhases` come from the existing remote.pluginManager - no
      new endpoint.
    - `panelFamilyBridge`: `editFull(namespace, patch)` over
      `ctx.configEditor.edit(entry, change)` - the ONE full-config write surface; the patch is the
      namespace's whole resolved config, the editor's own path emits the audit line (this package
      logs no success line), and a nested-secret namespace is refused (`Source/Function/Secret.ts`).
    - `panelFamilyTrace`: `on(kind, listener)` and `ring(limit)` forwarding the host D5 bus
      (`ctx.trace`) structurally; provided only when the bus exists (otherwise the panel's static
      fallback). The browser half re-publishes it as `trace`.
- Ledger lines: through the logger (the package writes nothing to disk), byte-exact:

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

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/client-dsh-panel-family-host"}` → one entry, status schema (defaults:
   enabled false, logRoot ~/.dsh, maxLines 200 (1..2000), ccrLog ~/.dsh/playform/hook-dsh-ccr.log;
   all knobs volatile). Note the default is DISABLED - a disabled package refuses every method.
2. Service check: `cordis_inspect_query` host/Service/listService → `panelFamilyHost` (`tail`,
   `stats`), plus `panelFamilyBridge` and `panelFamilyTrace` when the bus and config editor exist.
3. Ledger line: `host: activated (enabled=<enabled>)` in the logger - with the stock config,
   `host: activated (enabled=false)`.

## Test cases

| #   | Trigger                                                        | Expected                                       | Pass criteria                                                                                                                                                     |
| --- | -------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | `tail("package-governor", 20)` (after enabling)                | `{ ok: true, namespace, lines }`               | the lines match ~/.dsh/package-governor.log's tail exactly; ≤ maxLines                                                                                            |
| T1  | `stats()`                                                      | `{ ok: true, path, bytes, lines }`             | fields populated from ~/.dsh/playform/hook-dsh-ccr.log                                                                                                            |
| T2  | `tail("bad name!", 20)` / unknown namespace                    | rejected, not sanitized                        | `{ ok: false, code: "rejected" }` / `"not-found"`; no path traversal                                                                                              |
| T2  | `tail` with lines > maxLines                                   | clamped to maxLines                            | no error, no truncation crash                                                                                                                                     |
| T2  | `editFull` on a namespace with a nested `role("secret")` field | refused                                        | `bridge: secret namespace refused for <namespace>`; likewise the other refusal lines for invalid namespace/patch, unknown namespace, no editor, and disabled gate |
| T5  | The family panel's tails and plain-field write path            | tails render; plain writes route to the bridge | the user sees real log lines; the panel's bridge resolution finds `panelFamilyBridge` (client service)                                                            |

## Known live gaps

- Not dogfooded yet. The generated Remote contribution (Typert codegen artifacts + the
  `@deepseek-ai/dsh-api-remotes` assembly mount) is not reproducible from a Classic package, so the
  browser half waits for the generated `remote.playformFamilyPanel` namespace and is inert until it
  lands - the panel keeps its documented fallbacks (plain fields read-only, static status). The host
  services themselves are complete and smoke-covered per the README.
- Method names must stay exactly `tail(namespace, lines)` and `stats()`.

## Fix loop

- Fix files: `Source/Library.ts`, `Source/Function/` (Bridge, Secret, Trace, the tail/stats
  implementations), `Source/Interface/`, `Source/Client.ts`, `Source/Variable/Config.ts`,
  `Source/Variable/Lines.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/client-dsh-panel-family-host run prepublishOnly`
- Smokes: `node Classic/packages/client-dsh-panel-family-host/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/client-dsh-panel-family-host` (v0.1.0)
- Tests run: T1 tail - / T1 stats - / T2 reject - / T2 clamp - / T2 bridge refusals - / T5 view -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
