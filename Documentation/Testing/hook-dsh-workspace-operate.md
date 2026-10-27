# hook-dsh-workspace-operate - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-operate` (Classic/packages/hook-dsh-workspace-operate).
- Profile row id: `hook-dsh-workspace-operate` (bundled in the desktop profile).
- Exposes: the tools `workspace_propose` + `workspace_proposals`, registered from apply (the tools
  live inside their owning hook, README: "Registers two tools from apply"). The operation engine,
  the third step of the invisible flow ("the operate proposes"): the typed proposals - rename /
  connect / replace - with the resolution rules that decide what CAN be proposed and the first-class
  REFUSAL-TO-GUESS that declares what CANNOT. The hook never writes a file: it records proposals in
  its KV domain `workspace_operate`.
- Service surface (SCHEME): `ctx.workspaceOperate.proposeRename/proposeConnect/proposeReplace` (→
  `Outcome` = `{ status: "proposed" | "refused", proposal?, refusal? }`), `list(filter?)`,
  `get(id)`, `withdraw(id)` (only a `proposed` proposal withdraws), `statistics()` →
  `{ proposals, refused, sequence, byKind }`. Proposal id form `<kind>-<seq>`.
- Resolution rules in evaluation order (SCHEME): `bad-request` → `graph-unavailable` →
  `unknown-symbol` / `name-collision` / `duplicate-edge` / `incompatible-edge` → `missing-version`
  (the caller's version, else the hook's own observed version; a version is never invented) →
  `stale-version` → `span-beyond-file` → `full` (the live table at `maxProposals`).
- Config fields (all volatile, SCHEME): `enabled`, `log`, `domain` (`workspace_operate`),
  `maxProposals` (500), `limitDefault` (50), `limitMaximum` (500), `logFile`, `policy` (the D6
  allowlist block; SUGGEST action, automatic, no gated action).
- Ledger lines (byte-exact, README): `` `operate: activated (domain=<domain>)` ``,
  `` `operate: disabled (enabled=false)` ``, `` `operate: proposed <id> <kind> <path>` ``,
  `` `operate: refused <reason>` ``, `` `operate: refused full (<n> live proposals)` ``,
  `` `operate: withdrawn <id>` ``, `` `operate: storage open failed: <reason>` ``. logFile
  `~/.dsh/playform/hook-dsh-workspace-operate.log`.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-workspace-operate"}` → one entry, status schema (defaults: domain
    workspace_operate, maxProposals 500, limitDefault 50, limitMaximum 500, policy block).

2. **The tool check.**

    Tool check: the Tool provider lists `workspace_propose` and `workspace_proposals`.

3. **The ledger line.**

    Ledger line: the activated line in `~/.dsh/playform/hook-dsh-workspace-operate.log`; a cold
    mount logs `operate: disabled (enabled=false)` and nothing is wired.

## Test cases

| #   | Trigger                                                                    | Expected                                                            | Pass criteria                                                                                               |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                    | one entry, `status: "schema"`                                       | the defaults match                                                                                          |
| T1  | `workspace_proposals` on a fresh state                                     | the empty list (bounded by limitDefault 50, capped at limitMaximum) | honest empty answer                                                                                         |
| T2  | `workspace_propose` a rename/connect/replace with resolvable inputs        | the proposal is recorded in the domain                              | id (`<kind>-<seq>`), kind, targets recorded; ledger `operate: proposed <id> <kind> <path>`; no file written |
| T2  | `workspace_propose` with underspecified inputs                             | the REFUSAL-TO-GUESS reply                                          | ledger `operate: refused <reason>`; it refuses with the frozen reason vocabulary, never guesses a target    |
| T2  | `workspace_propose` with no version while the hook has no observed version | `missing-version` refusal                                           | a version is never invented (SCHEME rule 4)                                                                 |
| T2  | Fill the live table to maxProposals, then propose again                    | `full` refusal                                                      | ledger `operate: refused full (<n> live proposals)`                                                         |
| T2  | `withdraw(id)` on a proposed proposal, then again                          | true then false                                                     | ledger `operate: withdrawn <id>`; only a `proposed` proposal withdraws                                      |

## Known live gaps

- Not dogfooded yet. Watch for: proposals referencing files that don't exist (the resolution rules
  should refuse via `unknown-symbol`/`name-collision`), the `full` refusal landing when the live
  table reaches maxProposals, and rename/connect requiring the `workspaceGraph` service
  (`graph-unavailable` when absent).

## Fix loop

- Fix files: `Source/Function/` (the resolution rules, the refusal, the tools), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-operate run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-operate/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-operate`
- Tests run: T1 config - / T1 list - / T2 propose - / T2 refusal - / T2 missing-version - / T2
  full - / T2 withdraw -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
