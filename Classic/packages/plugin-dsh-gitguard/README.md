# @playform/plugin-dsh-gitguard

The git guard is a DeepSeek Harness plugin that acts as the tools/pre-execute DENY-LIST on the
terminal/exec tool surface (Documentation/Plugins/ORCHESTRATION-PLUGINS.md section 3).

## The surfaces

- The `tools/pre-execute` DENY-LIST intercept on the terminal/exec tool surface is the only
  registration, and a denial is the pre-execute refusal, never a punish.
- The plugin provides no tool of its own and no service.

## The role

- **The dirty-tree discipline, enforced**: the git checks-only law lives in the skills as the WHY,
  but skills are behavioral and CAN slip.

    The plugin carries the CANNOT.

- **The guarded operations**: the plugin intercepts terminal commands before execution and denies
  ANY git mutation pattern, which covers `git add`, `commit`, `reset`, `push`, `tag`, `rm`,
  `checkout`, `branch`, `merge`, `stash`, `clean`, `rebase`, `revert`, `cherry-pick`, `mv`, `apply`,
  `am`, `bisect`, `gc`, `prune`, `worktree`, `submodule`, and `notes`.
- **The allowed operations**: the read-only checks `git status`, `log`, `diff`, `show`, `rev-parse`,
  `ls-files`, and `fetch`.

- **The refusal lines**: denials surface ONCE as the pre-execute refusal in the tool result and
  never punish, because the correct path of the agent is simply the only executable one.

    Every denied attempt is ledgered for the audit of the user.

## The anatomy

- `Source/Library.ts` holds the loader contract (`name`, `apply`, `Config`, `inject`), and `apply`
  returns nothing.
- `Source/Function/` holds one definition per file: the entry (`Apply`), the intercept (`Guard`),
  the classifier (`Decide`), the subcommand extractor (`Subcommand`), and the compound splitter
  (`Segments`).
- `Source/Interface/` holds the types (`State`, `Config`, `Decision`, `Factory`).
- `Source/Variable/Config.ts` holds the Schemastery schema, where every knob is a volatile cell.
- `Configuration/` holds the ESBuild configuration.
- `cordis.patch.yml` holds the bundle patch row (`enabled: false`).

## The posture

The plugin ships DISABLED in the IDLE-forever posture, so it never appears in the bundles of the
profile and enables only through an explicit ACTIVATE, and a cold mount logs
`disabled (enabled=false)` and wires nothing.

## The policy block (D6)

The config carries the shared per-action allowlist, composed from the block of the factory as
`policy: Policy()`, and maps it to `State.Verdicts`, because `Allow` is already the git allow-list:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The guard is read-only, because it classifies and ledgers and never writes, commits, or spawns, so
its own action classes are `read` and `record`, both automatic, while the write, commit, and spawn
verdicts are declared for uniformity and stay the shipped `approve`.

The block is one volatile object, so a policy flip is hot-editable, and the `policy` section of a
resolved pack overrides the defaults per action, which is the next refinement.

`Source/Test/Policy-Defaults` arbitrates the defaults in the smoke suite.

## The configuration

| Field      | Default                                   | Meaning                                      |
| ---------- | ----------------------------------------- | -------------------------------------------- |
| `enabled`  | `false`                                   | the master switch (the IDLE-forever posture) |
| `log`      | `true`                                    | the ledger switch (shared cell)              |
| `logFile`  | `~/.dsh/playform/plugin-dsh-gitguard.log` | the ledger                                   |
| `strict`   | `false`                                   | the strict classification mode               |
| `policy.*` | D6 defaults                               | the per-action allowlist (see below)         |

Every field is a volatile cell.

## The build and the tests

```
sh Source/prepublishOnly.sh   # the full chain (Build + tsc + tsc-alias)
sh Source/Run.sh              # the dev twin (Build only)
```

The smoke folders are `Guard-And-Ledger`, `Policy-Defaults`, and `Wiring-And-Classification`.

## The ledger

The lines carry the prefix `gitguard: `, byte-exact, and the expected-string sections of the smoke
folders repeat them:

```text
gitguard: activated (...)
gitguard: disabled (enabled=false)
gitguard: denied <subcommand|bare> (<reason>)
```

## The plan

- [ORCHESTRATION-PLUGINS](../../Documentation/Plugins/ORCHESTRATION-PLUGINS.md) covers section 3,
  the deny-list member.
- The PoC mode brings the fake-context harness and the byte-identical ledger assertions with the
  aggregate runner in the end phase.

## License

CC0-1.0.
