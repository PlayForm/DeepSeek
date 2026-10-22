# @playform/plugin-dsh-gitguard

The git guard: a DeepSeek Harness plugin that is the tools/pre-execute
DENY-LIST on the terminal/exec tool surface
(Documentation/Plugins/ORCHESTRATION-PLUGINS.md section 3).

## The role

- **The dirty-tree discipline, enforced**: the git checks-only law lives in
  the skills (the WHY) - but skills are behavioral and CAN slip. The plugin
  carries the CANNOT.
- **The guarded operations**: it intercepts terminal commands before
  execution and denies ANY git mutation pattern - `git add`, `commit`,
  `reset`, `push`, `tag`, `rm`, `checkout`, `branch`, `merge`, `stash`,
  `clean`, `rebase`, `revert`, `cherry-pick`, `mv`, `apply`, `am`,
  `bisect`, `gc`, `prune`, `worktree`, `submodule`, `notes`.
- **The allowed operations**: the read-only checks - `git status`, `log`,
  `diff`, `show`, `rev-parse`, `ls-files`, `fetch`.
- **The refusal lines**: denials surface ONCE as the pre-execute refusal
  (the tool result), never punish - the agent's correct path is simply the
  only executable one. Every denied attempt is ledgered for the user's
  audit.

## The anatomy

- `Source/Library.ts` - the loader contract (`name`, `apply`, `Config`,
  `inject`; `apply` returns nothing).
- `Source/Function/` - one definition per file: the entry (`Apply`), the
  intercept (`Guard`), the classifier (`Decide`), the subcommand extractor
  (`Subcommand`), the compound splitter (`Segments`).
- `Source/Interface/` - the types (`State`, `Config`, `Decision`,
  `Factory`).
- `Source/Variable/Config.ts` - the Schemastery schema (every knob a
  volatile cell).
- `Configuration/` - the ESBuild configuration.
- `cordis.patch.yml` - the bundle patch row (`enabled: false`).

## The posture

The plugin ships DISABLED (the IDLE-forever posture): it never appears in
the profile's bundles and enables only by an explicit ACTIVATE; a cold
mount logs `disabled (enabled=false)` and wires nothing.

## The build

```
sh Source/prepublishOnly.sh   # the full chain (Build + tsc + tsc-alias)
sh Source/Run.sh              # the dev twin (Build only)
```

The smoke suites are the end-phase (the PoC mode): the fake-context
harness and the byte-identical ledger assertions land with the aggregate
runner.
