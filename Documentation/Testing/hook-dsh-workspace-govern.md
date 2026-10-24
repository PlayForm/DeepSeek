# hook-dsh-workspace-govern - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-govern` (Classic/packages/hook-dsh-workspace-govern).
- Profile row id: `hook-dsh-workspace-govern` (bundled in the desktop profile).
- Exposes: the `workspaceGovern` service plus the `tools/pre-execute` gate on the gated tools
  (`write`, `edit`, `bash`, `applyPatch`). The governance gate of the invisible flow: operate
  proposes → the GOVERN GATES → the authority licenses → approve binds. Four INDEPENDENT
  MEANS-CHECKS on the ProposedChange (contributes, authorized scope, policy, preconditions) before
  any AuthorizationDecision - an intent must not authorize its own means. Fail-open recovery for
  contributes/policy/preconditions, fail-closed for scope (the SCHEME's recovery table; per-row
  overrides via the `recovery` config field). Recursion prevention: an operation id gated beyond
  `loopBound` (4) is dropped with a ledger line. The gate carries no intent of its own and reads no
  authority record - the licensing is `plugin-dsh-workspace-authority`, not this hook; this hook
  holds no weights or priorities (pass / deny / escalate only).
- Service surface (README): `ctx.workspaceGovern.gate(proposal)`, `decisions(limit?)` (the decision
  ring, newest first), `statistics()` → `{ decisions, sequence }`.
- Config fields (README): `enabled`, `log`/`logFile`, `tools` (`write, edit, bash, applyPatch`),
  `scope` (`[]`, unrestricted globs), `exclude` (the triple - never gated, in silence), `policy`
  (`[]` - this hook's own DECISION RULE table `{kind, decision, operation?}`, a different contract),
  `recovery` (`[]`, `{obligation, behavior}` overrides), `loopBound` (4), `maxDecisions` (500),
  `automation` (the D6 allowlist block - keyed `automation`, NOT `policy`, because `policy` is the
  decision rule table; RECORD action, automatic, no gated action).
- Ledger lines (byte-stable, README): `` `govern: activated (tools=<n>, policy=<n>)` ``,
  `` `govern: disabled (enabled=false)` ``, `` `govern: passed <operation> (<kind> <target>)` ``,
  `` `govern: denied <operation> (<reason>)` ``,
  `` `govern: escalated <operation> (approval required)` ``,
  `` `govern: recovery <obligation> (fail-open)` ``,
  `` `govern: loop <operation> (recursion guard)` ``,
  `` `govern: observed <operation> (accepted | errored)` ``. logFile
  `~/.dsh/playform/hook-dsh-workspace-govern.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-govern"}` → one entry, status schema (defaults: tools
   write/edit/bash/applyPatch, scope [] (unrestricted), exclude triple, policy [] (the decision rule
   table), recovery [], loopBound 4, maxDecisions 500, automation D6 defaults).
2. Service check: `cordis_inspect_query` host/Service/listService `workspaceGovern` → resolves.
3. Ledger line: the activated line in `~/.dsh/playform/hook-dsh-workspace-govern.log`; a cold mount
   logs `govern: disabled (enabled=false)` and the gate is a pass-through.

## Test cases

| #   | Trigger                                                             | Expected                                        | Pass criteria                                                                             |
| --- | ------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                             | one entry, `status: "schema"`                   | the gated tool list matches                                                               |
| T3  | A `write` to a /tmp scratch path with scope []                      | the gate evaluates scope as "n/a" and passes    | pass-through on unrestricted scope; ledger `govern: passed <operation> (<kind> <target>)` |
| T3  | Set scope to `["/tmp/**"]`, then `edit` a repo file                 | the gate FAILS CLOSED (unevaluable match)       | ledger `govern: denied <operation> (<reason>)`                                            |
| T3  | A proposal whose check escalates                                    | the waterfall returns `{ kind: "ask", reason }` | ledger `govern: escalated <operation> (approval required)`                                |
| T3  | Gate the same operation id loopBound+1 times                        | the 5th proposal is dropped                     | ledger `govern: loop <operation> (recursion guard)`                                       |
| T3  | A gated call completes, then a `tools/post-execute`                 | the observed outcome is recorded                | ledger `govern: observed <operation> (accepted \| errored)`                               |
| T1  | An event under an `exclude` glob, or the hook's own `Self` activity | never gated, in silence                         | no decision, no ledger line                                                               |

## Known live gaps

- Not dogfooded yet. Watch for: the recovery table overrides not landing on hot-edit (volatile cells
  must refresh State in place; a dropped row should ledger
  `govern: recovery <obligation> (fail-open)`), the policy table's first-match-wins ordering, and
  the escalate path surfacing an `ask` the conversation must answer.

## Fix loop

- Fix files: `Source/Function/` (the four checks, `Recovery.ts`, the gate), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-govern run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-govern/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-govern`
- Tests run: T1 config - / T3 unrestricted - / T3 fail-closed - / T3 escalate - / T3 loopBound - /
  T3 observed - / T1 exclusion -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
