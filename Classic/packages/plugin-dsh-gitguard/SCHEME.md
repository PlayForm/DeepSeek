# SCHEME - @playform/plugin-dsh-gitguard

The git guard is the tools/pre-execute DENY-LIST on the terminal/exec tool surface
(Documentation/Plugins/ORCHESTRATION-PLUGINS.md section 3).

## 1. The identity (four agreeing places)

| Place                             | Value                                     |
| --------------------------------- | ----------------------------------------- |
| Package name                      | `@playform/plugin-dsh-gitguard`           |
| The `name` export                 | `plugin-dsh-gitguard`                     |
| The State build's `module` option | `gitguard`                                |
| The ledger logFile default        | `~/.dsh/playform/plugin-dsh-gitguard.log` |

## 2. The loader contract

- Object form: `name`, `apply`, `Config`, `inject`, and the default object carries all four.
- `inject: ["pluginFactory"]`, because the factory provides the State builder with cell unwrap, the
  shared fields, and the P10 volatile refresh, plus the ledger and the exclusion match.
- `apply` returns NOTHING, because a returned value silently kills event delivery, and the state is
  exposed through the `ctx.__pluginDshGitguardState` attachment that the test probe reads.
- NO service is registered, since a plugin with no service is a valid archetype, and NO fs/observed
  listener is wired.

## 3. The config schema (every knob volatile)

| Field           | Type     | Default                                             | Meaning                                                               |
| --------------- | -------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `enabled`       | boolean  | `false`                                             | The master switch (the IDLE-forever posture).                         |
| `log`           | boolean  | `true`                                              | Ledger enabled - write the durable log file.                          |
| `logFile`       | string   | `~/.dsh/playform/plugin-dsh-gitguard.log`           | The ledger file (one log per module).                                 |
| `denyPatterns`  | string[] | the 23 mutation subcommands                         | The refused git subcommands (REPLACES the default list, not merge).   |
| `allowPatterns` | string[] | status, log, diff, show, rev-parse, ls-files, fetch | The allowed git subcommands (the allow-list wins over the deny-list). |
| `strict`        | boolean  | `false`                                             | Deny EVERY git command (not just the deny-list).                      |
| `exclude`       | string[] | `[]`                                                | The paths the guard ignores (the factory's segment match).            |
| `policy`        | object   | the D6 block (see §3.1)                             | The per-action allowlist (the shared factory block).                  |

Fail-loud validation runs BEFORE the State build, so the three lists must be arrays of strings and
an invalid config throws at load instead of silently defaulting.

### 3.1 The policy block (D6)

The config composes the shared block of the factory as `policy: Policy()`, volatile as one object,
and maps it to `State.Verdicts`, because the name `Allow` is already the git allow-list of this
guard:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The guard is READ-ONLY, because it classifies and ledgers and never writes, commits, or spawns, so
its own action classes are `read` and `record`, both automatic, while the write, commit, and spawn
verdicts are declared for uniformity with the block of the family and stay the shipped `approve`.

The `policy` section of a resolved pack overrides the defaults per action, that wiring is the next
refinement, and the type already exists in `@playform/lib-dsh-pack`.

## 4. The classification (Function/Decide)

The guard chain, in order:

1. **The disabled guard.**

    The guard is disabled, so the verdict is allow and the cold mount passes everything.

2. **The non-git command.**

    NO segment of the command is a git command, so the verdict is allow, because the guard only ever
    judges git.

3. **The allow-listed subcommand.**

    A segment's subcommand is allow-listed, so the verdict is allow, because the allow-list wins
    over the deny-list and a user can re-allow a denied subcommand explicitly.

4. **The strict mode.**

    Strict mode is on, so the verdict is deny for EVERY git command, which is the stricter posture
    of the plan.

5. **The deny-listed subcommand.**

    A segment's subcommand is deny-listed, so the verdict is deny.

6. **The fallback.**

    Otherwise the verdict is allow, because the subcommand is not deny-listed.

A compound command such as `cd repo && git add -A` is judged by its WORST segment, so any denied
segment denies the whole command, and Function/Segments splits on `&&`, `||`, `;`, `|`, and newline.

The subcommand extractor in Function/Subcommand skips the leading `KEY=VALUE` env assignments and
the leading flags, so the first non-flag token after `git` is the subcommand.

## 5. The refusal (the module-owned lines)

The refusal line surfaces ONCE as the pre-execute decision and never punishes:

```
gitguard: refused "git <sub>" (<reason>) - git is read-only in this session (the checks-only law). Allowed: git status, log, diff, show, rev-parse, ls-files, fetch.
```

The ledger lines all carry the prefix `gitguard: ` from the Append of the factory:

```
disabled (enabled=false)
activated (strict=<bool>, denyPatterns=<n>, allowPatterns=<n>)
denied <sub> (<reason>)
```

## 6. The disciplines

- FAIL-OPEN: any error in the body of the guard passes the dispatch unchanged, because the whole
  judged path is one try/catch whose catch calls `next()`, so a broken guard must never break a
  legitimate tool call.
- THE DENY ARM deliberately omits `next()`, because the refusal REPLACES the dispatch and the
  command must never execute.
- A dispatch with no readable command passes unchanged, because the guard never guesses.
- An excluded working directory skips the guard entirely and silently.
- Denials surface ONCE in the tool result and NEVER punish.

## 7. The safe-composition notes

- The deny and allow lists are copied nowhere, because the classifier reads them read-only, and
  setting a list through config replaces it wholesale in the volatile cell.
- The listener path awaits `next()` first on every allow, which is the waterfall discipline, and the
  deny arm is the single documented exception.
