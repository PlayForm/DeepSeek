# @playform/hook-dsh-workspace-merge

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/MERGE](../../../Documentation/Plans/Workspace-Family/MERGE.md)

## The role

The batch merge of the workspace family provides the **atomic gates**, the per-file commits
**through the factory's Write executor**, and the **commit reply union**.

Plan: `Documentation/Plans/Workspace-Family/MERGE.md` +
`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` (sections 3.7-3.8).

## The surfaces

- The `workspaceMerge` service (`preview`, `commit`, `batch`, `batches`, `statistics`).
- One tool from apply: `workspace_merge`, which lives inside its owning hook.
- The own KV domain (`workspace_merge`, config `domain`), the journal the recovery domain reads.
- No event listener, because the merge is called and not observed.

## What it does

- Registers the `workspaceMerge` service (`preview`, `commit`, `batch`, `batches`, `statistics`).
- Registers one tool from apply (`workspace_merge`), because the tool lives inside its owning hook.
- Consults the D6 policy block before a commit, so an `approve` verdict for `commit` (the shipped
  default) holds the whole batch with the documented line and writes nothing.
- Runs the atomic gates before any write: empty batch, maxFiles, maxTotalBytes, duplicate paths,
  missing version fences, unresolved paths, and stale fences.
- Commits file by file through `pluginFactory.Write` with the explicit `replaceIfVersion` intent,
  the P4 sandbox fence, and the root-context `fs/observed` emit, and every applied write is verified
  by reading the file back and comparing it to the intended content.
- Reports the commit reply union per file: `applied`, `conflict` (expected and observed versions
  attached), `denied`, `rejected`, `recovery-required`, and `outcome-unknown`, derived from the v4.1
  edit lifecycle and never guessed.
- Persists every batch record in its own KV domain (`workspace_merge`), the journal the recovery
  domain reads later.

## The atomicity semantics

- **all-or-nothing** (default): any gate failure rejects the whole batch, and a mid-batch write
  failure stops the batch and marks the remaining files `recovery-required`, so recoverable partial
  states occur but never an invisible intermediate state.
- **survivors**: gate conflicts and per-file failures are per-file replies, and the batch continues.

## What it does not do

- No three-way merge exists in v1: preview, version fence, and an explicit conflict only (W4.1
  section 3.8).
- No unconditional write exists, because every operation needs a version fence.
- No wall clocks exist, because ids and sequences are the hook's own monotonic counter.

## The policy block (D6) - the outer gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The commit is the hook's ONE gated action, and the policy is the **outer** gate: it runs before the
atomic gates and before any write.

An `approve` verdict for `commit` refuses the whole batch: the ledger records the byte-exact
`merge held (<n> files) (policy commit=approve)` line, every operation is replied `rejected` with
the policy reason, nothing is persisted, and **zero writes** reach the filesystem.

Flip `policy.commit` to `auto` (or let a resolved pack override it) to let the next batch reach the
gates.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

## The ledger (byte-stable, module-owned)

```text
merge: activated (domain=<domain>, mode=<mode>)
merge: disabled (enabled=false)
merge: merge held (<n> files) (policy commit=approve)
merge: batch <id> started (<n> files, <bytes> bytes)
merge: batch <id> rejected (<reason>)
merge: applied <path> version <version> (batch <id>)
merge: conflict <path> (expected <e>, observed <o>)
merge: denied <path> (<reason>)
merge: recovery-required <path> (batch <id>)
merge: outcome-unknown <path> (batch <id>)
merge: batch <id> complete (applied <a>, conflict <c>, denied <d>, recovery <r>, unknown <u>)
merge: storage open failed: <reason>
```

## The configuration

| Field           | Default                                        | Meaning                                                  |
| --------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `enabled`       | `false`                                        | the master switch (the IDLE-forever posture)             |
| `log`           | `true`                                         | the ledger switch (the shared cell)                      |
| `logFile`       | `~/.dsh/playform/hook-dsh-workspace-merge.log` | the ledger                                               |
| `domain`        | `workspace_merge`                              | the KV domain name                                       |
| `mode`          | `all-or-nothing`                               | the atomicity semantics (`survivors` is the alternative) |
| `maxFiles`      | `50`                                           | the per-batch file gate                                  |
| `maxTotalBytes` | `1000000`                                      | the per-batch byte gate                                  |
| `policy.*`      | D6 defaults                                    | the per-action allowlist (the outer gate; see above)     |

Every field is a volatile cell.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

The policy block and the commit hold are arbitrated by `Source/Test/Policy-Defaults`, and the gates
and the reply union by `Source/Test/Wiring-And-Gates` and `Source/Test/Commit-And-Replies`.

## The plan

- [Workspace-Family/MERGE](../../../Documentation/Plans/Workspace-Family/MERGE.md) - the merge step.
- [WORKSPACE-FAMILY-V4-1](../../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) - sections 3.7-3.8,
  the edit lifecycle.

- The plugin ships **disabled** (`enabled: false`, the IDLE-forever posture) and enables only by an
  explicit ACTIVATE.

    This is the PoC build, and the smoke suite and the ETS twin land at the end phase.

## License

CC0-1.0.
