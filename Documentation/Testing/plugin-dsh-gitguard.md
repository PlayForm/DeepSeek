# plugin-dsh-gitguard - the live test plan

## Identity

- Package: `@playform/plugin-dsh-gitguard` (Classic/packages/plugin-dsh-gitguard).
- Profile row id: `plugin-dsh-gitguard` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/pre-execute` as the DENY-LIST on the terminal/exec
  tool surface: it intercepts terminal commands before execution and denies ANY git mutation pattern
  (git add, commit, reset, push, tag, rm, checkout, branch, merge, stash, clean, rebase, revert,
  ...) while allowing the read-only checks (git status, log, diff, show, rev-parse, ls-files,
  fetch). Denials surface ONCE as the refusal line, never punish; every denied attempt is ledgered
  for the user's audit.
- Ledger: logFile `~/.dsh/plugin-dsh-gitguard.log` (the default deny list: the 23 mutation
  subcommands; the allow list: the read-only checks + fetch; strict false = deny-list mode).

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-gitguard"}` → one entry, status schema (defaults: denyPatterns
   DEFAULT_DENY, allowPatterns DEFAULT_ALLOW, strict false, exclude []).
2. Tool check: none expected (it wraps the existing terminal surface).
3. Ledger line: the activated line in `~/.dsh/plugin-dsh-gitguard.log`; a cold mount logs
   `disabled (enabled=false)` and wires NOTHING.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | deny/allow lists present | | T1 | `git status` (read-only) | allowed | the
command executes normally | | T2 | A harmless deny-listed command (e.g. `git tag -l` is allowed; use
`git add --dry-run` in a /tmp scratch repo, or `git commit -m x` in a scratch repo with nothing
staged) | DENIED with the refusal line | no mutation occurred; the attempt ledgered | | T2 | The
SAME denial a second time | surfaces once, never punishes | no repeated scolding; still ledgered |

## Known live gaps

- Not dogfooded yet. Watch for: false positives on command strings merely containing "git" (e.g.
  `echo git commit`), and fetch being denied (it must be allowed).

## Fix loop

- Fix files: `Source/Function/` (the matcher, the gate), `Source/Library.ts`,
  `Source/Variable/Config.ts` (DEFAULT_DENY / DEFAULT_ALLOW).
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-gitguard run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-gitguard/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-gitguard`
- Tests run: T1 config - / T1 allow - / T2 deny - / T2 once-only -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
