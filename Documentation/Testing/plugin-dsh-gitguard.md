# plugin-dsh-gitguard - the live test plan

## Identity

- Package: `@playform/plugin-dsh-gitguard` (Classic/packages/plugin-dsh-gitguard).
- Profile row id: `plugin-dsh-gitguard` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/pre-execute` as the DENY-LIST on the terminal/exec
  tool surface, intercepting terminal commands before execution and denying ANY git mutation pattern
  (the 23 mutation subcommands per README: git add, commit, reset, push, tag, rm, checkout, branch,
  merge, stash, clean, rebase, revert, cherry-pick, mv, apply, am, bisect, gc, prune, worktree,
  submodule, notes) while allowing the read-only checks (git status, log, diff, show, rev-parse,
  ls-files, fetch). Denials surface ONCE as the refusal line
  (`gitguard: refused "git <sub>" (<reason>) - git is read-only in this session ...`) and never
  punish, while every denied attempt is ledgered for the audit of the user.
- The classification chain (SCHEME §4, in order): disabled → allow; no git segment → allow;
  allow-listed subcommand → allow (the allow-list wins over the deny-list); strict mode → deny;
  deny-listed → deny; otherwise → allow. A compound command is judged by its WORST segment, and the
  guard fails open, because any error in the guard body passes the dispatch unchanged.
- Ledger lines (SCHEME §5, byte-stable): `disabled (enabled=false)`,
  `activated (strict=<bool>, denyPatterns=<n>, allowPatterns=<n>)`, `denied <sub> (<reason>)`;
  logFile `~/.dsh/playform/plugin-dsh-gitguard.log`.
- The policy block (D6, SCHEME §3.1): the config composes the shared `policy: Policy()` of the
  factory (read/index/record/suggest/message = `auto`; write/commit/spawn = `approve`, declared for
  uniformity because the guard never writes, commits or spawns), mapped to `State.Verdicts`. One
  volatile object stays hot-editable, and a resolved pack's `policy` section overrides per action.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-gitguard"}` for one entry with status schema (defaults:
    denyPatterns DEFAULT_DENY, allowPatterns DEFAULT_ALLOW, strict false, exclude [], policy.* D6
    defaults).

2. **The tool check.**

    No tool is expected, because the hook wraps the existing terminal surface.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/plugin-dsh-gitguard.log`, and a cold mount logs
    `disabled (enabled=false)` and wires NOTHING.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | deny/allow lists present | | T1 | `git status` (read-only) | allowed | the
command executes normally | | T2 | A harmless deny-listed command (e.g. `git tag -l` is allowed; use
`git add --dry-run` in a /tmp scratch repo, or `git commit -m x` in a scratch repo with nothing
staged) | DENIED with the refusal line | no mutation occurred; the attempt ledgered as
`denied <sub> (<reason>)` | | T2 | The SAME denial a second time | surfaces once, never punishes |
no repeated scolding; still ledgered | | T2 | A compound command `cd repo && git add -A` | DENIED |
the worst segment denies the whole command | | T2 | `git status` with a re-allowed subcommand in
config | allowed | the allow-list wins over the deny-list | | T2 | An excluded working directory |
the guard is skipped entirely, silently | no denial, no line |

## Known live gaps

- Not dogfooded yet, so watch for false positives on command strings that merely contain "git" (e.g.
  `echo git commit`, where the subcommand extractor skips leading env assignments and flags), and
  fetch being denied (it must be allowed).

## Fix loop

- Fix files: `Source/Function/` (the matcher, the gate), `Source/Library.ts`,
  `Source/Variable/Config.ts` (DEFAULT_DENY / DEFAULT_ALLOW).
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-gitguard run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-gitguard/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-gitguard`
- Tests run: T1 config - / T1 allow - / T2 deny - / T2 once-only -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
