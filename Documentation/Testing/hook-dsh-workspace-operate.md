# hook-dsh-workspace-operate - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-operate` (Classic/packages/hook-dsh-workspace-operate).
- Profile row id: `hook-dsh-workspace-operate` (bundled in the desktop profile).
- Exposes: the tools `workspace_propose` + `workspace_proposals`, registered from apply (the tools
  live inside their owning hook). The operation engine, the third step of the invisible flow ("the
  operate proposes"): the typed proposals - rename / connect / replace - with the resolution rules
  that decide what CAN be proposed and the first-class REFUSAL-TO-GUESS that declares what CANNOT
  (OPERATE.md). The hook never writes a file: it records proposals in its KV domain
  `workspace_operate`.
- Ledger: logFile `~/.dsh/operate.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-operate"}` → one entry, status schema (defaults: domain
   workspace_operate, maxProposals 500, limitDefault 50, limitMaximum 500).
2. Tool check: the Tool provider lists `workspace_propose` and `workspace_proposals`.
3. Ledger line: the activated line in `~/.dsh/operate.log`; a cold mount logs
   `disabled (enabled=false)` and nothing is wired.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `workspace_proposals` on a fresh state | the empty
list (bounded by limitDefault 50) | honest empty answer | | T2 | `workspace_propose` a
rename/connect/replace with resolvable inputs | the proposal is recorded in the domain | id, kind,
targets recorded; no file written | | T2 | `workspace_propose` with underspecified inputs | the
REFUSAL-TO-GUESS reply | it refuses with the reason, never guesses a target |

## Known live gaps

- Not dogfooded yet. Watch for: proposals referencing files that don't exist (the resolution rules
  should refuse) and the ring growing past maxProposals without ledgered eviction.

## Fix loop

- Fix files: `Source/Function/` (the resolution rules, the refusal, the tools), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-operate run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-operate/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-operate`
- Tests run: T1 config - / T1 list - / T2 propose - / T2 refusal -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
