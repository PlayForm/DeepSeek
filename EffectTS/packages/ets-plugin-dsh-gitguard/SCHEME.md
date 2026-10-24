# SCHEME - @playform/plugin-dsh-gitguard

The git guard: the tools/pre-execute DENY-LIST on the terminal/exec tool surface
(Documentation/Plugins/ORCHESTRATION-PLUGINS.md section 3).

## 1. The identity (four agreeing places)

| Place                             | Value                                     |
| --------------------------------- | ----------------------------------------- |
| Package name                      | `@playform/plugin-dsh-gitguard`           |
| The `name` export                 | `plugin-dsh-gitguard`                     |
| The State build's `module` option | `gitguard`                                |
| The ledger logFile default        | `~/.dsh/playform/ets-plugin-dsh-gitguard.log` |

## 2. The loader contract

- Object form: `name`, `apply`, `Config`, `inject`, the default object carries all four.
- `inject: ["pluginFactory"]` - the factory provides the State builder (cell unwrap + shared
  fields + the P10 volatile refresh), the ledger, and the exclusion match.
- `apply` returns NOTHING (a returned value silently kills event delivery); the state is exposed
  through the `ctx.__pluginDshGitguardState` attachment (the test probe).
- NO service is registered (a plugin with no service is a valid archetype) and NO fs/observed
  listener is wired.

## 3. The config schema (every knob volatile)

| Field           | Type     | Default                                             | Meaning                                                               |
| --------------- | -------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `enabled`       | boolean  | `false`                                             | The master switch (the IDLE-forever posture).                         |
| `log`           | boolean  | `true`                                              | Ledger enabled - write the durable log file.                          |
| `logFile`       | string   | `~/.dsh/playform/ets-plugin-dsh-gitguard.log`           | The ledger file (one log per module).                                 |
| `denyPatterns`  | string[] | the 23 mutation subcommands                         | The refused git subcommands (REPLACES the default list, not merge).   |
| `allowPatterns` | string[] | status, log, diff, show, rev-parse, ls-files, fetch | The allowed git subcommands (the allow-list wins over the deny-list). |
| `strict`        | boolean  | `false`                                             | Deny EVERY git command (not just the deny-list).                      |
| `exclude`       | string[] | `[]`                                                | The paths the guard ignores (the factory's segment match).            |
| `policy`        | object   | the D6 block (see §3.1)                             | The per-action allowlist (the shared factory block).                  |

Fail-loud validation runs BEFORE the State build: the three lists must be arrays of strings - an
invalid config throws at load, never silently defaults.

### 3.1 The policy block (D6)

The config composes the factory's shared block (`policy: Policy()`, volatile as one object) and maps
it to `State.Verdicts` (the name `Allow` is already this guard's git allow-list):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The guard is READ-ONLY: it classifies and ledgers, never writes, commits or spawns, so its own
action classes are `read` and `record` (both automatic); the write/commit/spawn verdicts are
declared for uniformity with the family's block and stay the shipped `approve`. A resolved pack's
`policy` section overrides the defaults per action (the wiring is the next refinement; the type
already exists in `@playform/ets-lib-dsh-pack`).

## 4. The classification (Function/Decide)

The guard chain, in order:

1. The guard is disabled -> allow (the cold mount passes everything).
2. NO segment of the command is a git command -> allow (the guard only ever judges git).
3. A segment's subcommand is allow-listed -> allow (the allow-list wins over the deny-list, so a
   user can re-allow a denied subcommand explicitly).
4. Strict mode -> deny (EVERY git command - the plan's stricter posture).
5. A segment's subcommand is deny-listed -> deny.
6. Otherwise -> allow (not deny-listed).

A compound command (`cd repo && git add -A`) is judged by its WORST segment: any denied segment
denies the whole command (Function/Segments splits on `&&`, `||`, `;`, `|`, newline). The subcommand
extractor (Function/Subcommand) skips leading `KEY=VALUE` env assignments and leading flags; the
first non-flag token after `git` is the subcommand.

## 5. The refusal (the module-owned lines)

The refusal line (surfaces ONCE as the pre-execute decision, never punishes):

```
gitguard: refused "git <sub>" (<reason>) - git is read-only in this session (the checks-only law). Allowed: git status, log, diff, show, rev-parse, ls-files, fetch.
```

The ledger lines (all prefixed `gitguard: ` by the factory's Append):

```
disabled (enabled=false)
activated (strict=<bool>, denyPatterns=<n>, allowPatterns=<n>)
denied <sub> (<reason>)
```

## 6. The disciplines

- FAIL-OPEN: any error in the guard body passes the dispatch unchanged (the whole judged path is one
  try/catch whose catch calls `next()`) - a broken guard must never break a legitimate tool call.
- THE DENY ARM deliberately omits `next()`: the refusal REPLACES the dispatch - the command must
  never execute.
- A dispatch with no readable command passes unchanged - the guard never guesses.
- An excluded working directory skips the guard entirely, silently.
- Denials surface ONCE (the tool result), NEVER punish.

## 7. The safe-composition notes

- The deny/allow lists are copied nowhere - the classifier reads them read-only; setting a list via
  config replaces it wholesale (volatile).
- The listener path awaits `next()` first on every allow (the waterfall discipline); the deny arm is
  the single documented exception.
