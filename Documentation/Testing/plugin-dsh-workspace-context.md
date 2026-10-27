# plugin-dsh-workspace-context - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-context` (Classic/packages/plugin-dsh-workspace-context).
- Profile row id: `plugin-dsh-workspace-context` (bundled in the desktop profile).
- Exposes the `workspaceContext` service (`ctx.workspaceContext` - `packet(query)`, `lenses()`,
  `focusOf(caller)`, `statistics()`) and the read-only `workspace_context` tool. It assembles the
  orientation packet under the token budget, built from `ctx.workspaceGraph`, where an absent sibling
  degrades to the honest `workspace graph unavailable` OPEN line.
- Config (all volatile; hot edits commit without remounting): `logFile`
  `~/.dsh/playform/plugin-dsh-workspace-context.log`, `enabled` false, `budgetTokens` 2000 (the
  target), `budgetMaximum` 4000 (the hard cap, >= target), `lenses` `["code", "docs", "tests"]`,
  `lensDefault` `code`, `neighborLimit` 20, `evidenceLimit` 12, `mapLimit` 12, `workspaceName`
  `workspace`, and `policy` (the D6 allowlist defaults).
- Ledger lines (module-owned, byte-stable, prefixed `context: `):
  `` `context: disabled (enabled=false)` ``,
  `` `context: activated (budget=<target>/<max>, lenses=<n>)` ``,
  `` `context: packet <focus> (<tokens> tok, lens <lens>)` ``,
  `` `context: clamped (<from> -> <to> tok, budget <max>)` ``,
  `` `context: stale <id> (caller held <version>)` ``, `` `context: focus <caller> -> <id>` ``.
- The packet memo: `packet(query)` is served through a bounded memo (256 entries) keyed by the five
  fields of the query plus the own knobs of the service, and a hit returns the SAME packet object and
  writes no second `packet` line. The `indexRevision` of the graph is deliberately NOT part of the
  key. The invalidation belongs to the trace: the `graph/invalidated` event of the graph (consumed
  through `Source/Trace/Adapter.ts` and `Source/Trace/Invalidate.ts`) clears the memo wholesale, and
  the bus (`ctx.trace`, provided by the factory) is optional, so without it the memo lives until the
  process ends. The invalidation is silent: no new ledger line, and the trace ring is the evidence.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace-context"}` for one entry with status schema (defaults:
    budgetTokens 2000 / budgetMaximum 4000, 3 lenses, lensDefault code, neighborLimit 20,
    evidenceLimit 12, mapLimit 12, workspaceName workspace, the D6 policy block).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `workspaceContext` resolves, and the
    `workspace_context` tool is registered (read-only).

3. **The ledger line.**

    The line `context: activated (budget=2000/4000, lenses=3)` appears in
    `~/.dsh/playform/plugin-dsh-workspace-context.log`, and a cold mount logs
    `context: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                 | Expected                      | Pass criteria                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | listConfigs query above                                 | one entry, `status: "schema"` | the defaults match                                                                                                                                                                                                                                     |
| T1  | Build a packet for a node/query                         | the eight bands present       | WORKSPACE `WORKSPACE <workspaceName> @ <indexRevision>`, SCOPE, MAP (parent directories, biggest first, capped at mapLimit), FOCUS, NEIGHBORS (ranked by the weight table), EVIDENCE, OPEN, STALE; over-budget marks truncated, never silently exceeds |
| T2  | Request a packet over the cap                           | the clamp is ledgered         | `context: clamped (<from> -> <to> tok, budget <max>)` appears; no overrun                                                                                                                                                                              |
| T1  | A packet for a node the caller holds a stale version of | the STALE line set            | `context: stale <id> (caller held <version>)` and `context: focus <caller> -> <id>` are the evidence                                                                                                                                                   |
| T2  | Repeat the identical packet query                       | the memo hit                  | the SAME packet object; no second `packet` ledger line                                                                                                                                                                                                 |
| T2  | Touch a graph record (invalidation) then re-query       | the memo cleared              | the packet rebuilds against the new revision; no new ledger line for the invalidation - the trace ring shows `graph/invalidated`                                                                                                                       |

## Known live gaps

- Not dogfooded yet, so watch for packets silently exceeding the cap and the lenses not all
  contributing when the graph is empty (the known gap upstream), plus the `policy` override of the
  resolved pack (the wiring is the next refinement, because the block currently documents the posture
  only).

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/` (the budgeter, the lenses),
  `Source/Trace/`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-context run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-context/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-context`
- Tests run: T1 config - / T1 packet - / T2 clamp - / T1 stale - / T2 memo hit - / T2 invalidation -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
