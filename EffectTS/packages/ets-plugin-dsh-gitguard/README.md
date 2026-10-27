# @playform/plugin-dsh-gitguard

> v0.1.0 - UNPUBLISHED - plan:
> [ORCHESTRATION-PLUGINS](../../Documentation/Plugins/ORCHESTRATION-PLUGINS.md)

## The role

The git guard: a DeepSeek Harness plugin that is the tools/pre-execute DENY-LIST on the
terminal/exec tool surface (Documentation/Plugins/ORCHESTRATION-PLUGINS.md section 3).

## The role

- **The dirty-tree discipline, enforced**: the git checks-only law lives in the skills (the WHY) -
  but skills are behavioral and CAN slip.

    The plugin carries the CANNOT.

- **The guarded operations**: it intercepts terminal commands before execution and denies ANY git
  mutation pattern - `git add`, `commit`, `reset`, `push`, `tag`, `rm`, `checkout`, `branch`,
  `merge`, `stash`, `clean`, `rebase`, `revert`, `cherry-pick`, `mv`, `apply`, `am`, `bisect`, `gc`,
  `prune`, `worktree`, `submodule`, `notes`.
- **The allowed operations**: the read-only checks - `git status`, `log`, `diff`, `show`,
  `rev-parse`, `ls-files`, `fetch`.

- **The refusal lines**: denials surface ONCE as the pre-execute refusal (the tool result), never
  punish - the agent's correct path is simply the only executable one.

    Every denied attempt is ledgered for the user's audit.

## The anatomy

- `Source/Library.ts` - the loader contract (`name`, `apply`, `Config`, `inject`; `apply` returns
  nothing).
- `Source/Function/` - one definition per file: the entry (`Apply`), the intercept (`Guard`), the
  classifier (`Decide`), the subcommand extractor (`Subcommand`), the compound splitter
  (`Segments`).
- `Source/Interface/` - the types (`State`, `Config`, `Decision`, `Factory`).
- `Source/Variable/Config.ts` - the Schemastery schema (every knob a volatile cell).
- `Configuration/` - the ESBuild configuration.
- `cordis.patch.yml` - the bundle patch row (`enabled: false`).

## The posture

The plugin ships DISABLED (the IDLE-forever posture): it never appears in the profile's bundles and
enables only by an explicit ACTIVATE; a cold mount logs `disabled (enabled=false)` and wires
nothing.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Verdicts` (`Allow` is already the git allow-list):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The guard is read-only - it classifies and ledgers, never writes, commits or spawns - so its own
action classes are `read` and `record` (automatic); the write/commit/spawn verdicts are declared for
uniformity and stay the shipped `approve`.

The block is one volatile object (a policy flip is hot-editable), and a resolved pack's `policy`
section overrides the defaults per action (the wiring is the next refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The build and the tests

```
sh Source/prepublishOnly.sh   # the full chain (Build + tsc + tsc-alias)
sh Source/Run.sh              # the dev twin (Build only)
```

The smoke suites are the end-phase (the PoC mode): the fake-context harness and the byte-identical
ledger assertions land with the aggregate runner.

## The plan

- [ORCHESTRATION-PLUGINS](../../Documentation/Plugins/ORCHESTRATION-PLUGINS.md) - section 3, the
  deny-list member.

## License

CC0-1.0.
