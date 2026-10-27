# hook-dsh-workspace-observe - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-observe` (Classic/packages/hook-dsh-workspace-observe).
- Profile row id: `hook-dsh-workspace-observe` (bundled in the desktop profile).
- Exposes the `workspaceObserve` service concept, but functions as a listener: on every fs/observed
  event (heard on the ROOT context through the `Wire` registration of the factory) it writes one
  observation stamp (path, observed version, origin, the monotonic sequence of the plugin) into its
  KV domain `workspace_observe`. The conversation never sees the stamps, and a later wave's events
  surface them. The listener is a SYNCHRONOUS recorder: no awaits, no throws, no I/O, no file
  content ever read, no wall clock (WAVE-1-BRIEF.md section 5).
- Trace bus (SCHEME "The listener"): each RECORDED stamp is then emitted on the trace bus of the
  family as `observe/stamp` (the first source of the indexer, D5) via `Source/Trace/Adapter.ts`,
  with payload `{ path, version, origin }` (the sequence of the hook stays private). The bus
  (`ctx.trace`) is provided by `@playform/plugin-dsh-factory`, which the hook already injects, and
  the adapter resolves it through the probe-once `Seam` accessor of the factory, so a context
  without the bus records stamps exactly as before and emits nothing. The emission never throws into
  the recorder.
- Service surface (SCHEME section 1): `ctx.workspaceObserve.stamp(path)`, `.stamps(limit?)` (the
  ring, newest first), `await .manual(path)` (origin `manual`, ledger
  `manual <path> version <version>`, absent target records version `absent`), `.statistics()` →
  `{ paths, stamps, sequence }`.
- Config fields (SCHEME section 3, all volatile): `logFile`, `log` (default true), `enabled`
  (default false - the IDLE-forever posture), `domain` (default `workspace_observe`, non-empty,
  fail-loud), `maxStamps` (1000, integer ≥ 1, fail-loud), `include` ([]), `exclude` (the glob
  triple), and `policy` (the D6 allowlist block; RECORD action, automatic, no gated action).
- Ledger: logFile `~/.dsh/playform/hook-dsh-workspace-observe.log`, and the module identity for the
  State build is `observe`, so the frozen lines carry the `observe: ` prefix.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-workspace-observe"}` for one entry with status schema (defaults:
    log true, domain workspace_observe, maxStamps 1000, include [], exclude triple, policy block).

2. **The service check.**

    Nothing beyond the apply-registered `workspaceObserve` service is expected, because the recorder
    registers no tools.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-workspace-observe.log`, a cold mount
    logs `observe: disabled (enabled=false)`, and no listener is wired.

## Test cases

| #   | Trigger                                        | Expected                                   | Pass criteria                                                                                                                                                                           |
| --- | ---------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                        | one entry, `status: "schema"`              | the defaults match                                                                                                                                                                      |
| T3  | Write a /tmp scratch file                      | ONE stamp in the workspace_observe domain  | stamp carries path, observed version, origin, monotonic sequence                                                                                                                        |
| T3  | Same event with the trace bus wired            | the stamp AND one `observe/stamp` emission | payload `{ path, version, origin }`; a context without the bus still records the stamp                                                                                                  |
| T3  | Write 3 files quickly                          | 3 stamps with strictly increasing sequence | the monotonic sequence never repeats or reorders                                                                                                                                        |
| T1  | An event under node_modules/** or **/Target/** | no stamp                                   | the module-owned match (SCHEME section 5): a `*` pattern compiles to an anchored regex tested against the full path AND every path suffix                                               |
| T1  | `workspaceObserve.manual` on an absent target  | a stamp with version `absent`              | ledger `manual <path> version <version>`; never a fabricated token                                                                                                                      |
| T2  | Restart the app with persisted stamps          | recovery on mount                          | the sequence restarts at the MAXIMUM loaded sequence (monotonic across restarts); an absent facility is a silent skip, a failed open is loud (`observe: storage open failed: <reason>`) |

## Known live gaps

- Built and smoked (SCHEME: 45 checks across 3 folders - `Wiring-And-Stamps` 16, `Guards-And-Ring`
  15, `Storage-And-Service` 14). Live watch items: stamps evicted at maxStamps with the byte-exact
  capped line, malformed-event containment, and any await/throw in the listener (which must stay
  synchronous).

## Fix loop

- Fix files: `Source/Function/` (the stamp recorder, the ring, `Service.ts`),
  `Source/Trace/Adapter.ts`, `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-observe run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-observe/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-observe`
- Tests run: T1 config - / T3 stamp - / T3 observe/stamp - / T3 sequence - / T1 exclusion - / T1
  manual - / T2 recovery -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
