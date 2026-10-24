# @playform/hook-dsh-test-suggester

The test-suggester hook: a DeepSeek Harness plugin that answers the **test task intent** with a
target set. When the model searches for proof - a grep for `PASS`/`FAIL`/`error TS`, a read of a
`Test.ts`, a bash error sweep - the hook classifies the call deterministically and names the likely
targets **before** the model finishes searching.

It is the test consumer of the suggester family
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md), sections 3, 4,
8): a hook with no public API, an embedded pattern pack (the two-consumer extraction rule - no
shared core service until the family proves two consumers), and one delivery surface.

## How it works

1. `tools/post-execute` (waterfall, plain registration, runs **after** the CCR's `{ prepend: true }`
   listener): `next()` first, then the deterministic classifier runs over the call probe (tool
   name + arguments JSON), the gate applies, and **one** `additionalContexts` notice is prepended to
   the downstream decision. Content is never replaced - a ccr-compressed result is unaffected.
2. `agent/pre-step`: the per-turn reset of the note counter when a user message enters.

Every listener is fail-open: on any error a warning is logged and the downstream decision is
returned unchanged. A note never fails a tool call.

## The pack

| Intent   | Threshold | Trigger shape                                               | Targets                                                                                      |
| -------- | --------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Suite`  | 0.75      | `PASS\|FAIL\|error TS\|assert\|suite`, `Source/Test/` paths | `Source/Test/<Suite>/Test.ts`, the suite README, `Maintain/Run-Smokes.mjs`, the README badge |
| `Counts` | 0.80      | `N PASS`, expected/PASS count, badge                        | README badge, `SCHEME.md`, the site content counts                                           |

Confidence is `sigmoid(Σ weights − 0.6)` (the plan §3.5). Every candidate carries a one-phrase
reason; a candidate without a reason is never emitted.

The intents are **pack-driven**: the built-in pack (this monorepo's default) lives in
[`@playform/lib-dsh-pack`](../lib-dsh-pack) and is projected here as the `test/` domain. A
repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `test/` intents; a repository without a pack
stays silent.

## The reconciliation

On a judged call in a package, the package's **smoke claims** are reconciled with the tree it
actually has (the completion spec's wave 2c re-spec,
[03-SUGGESTERS.md](../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)): each
`Source/Test/<Folder>/README.md`'s `## Expected count`, the folders that exist, each folder's
`Test.ts`, the aggregate runner's roster (`Target/Test/<Folder>/Test.js`), and - when the workspace
graph service is present - its `Test` nodes for the package. A drift (a folder without a README
count, a README count whose `Test.ts` is gone, a suite the runner never runs, a graph node whose
file is gone) emits ONE note naming the drifted files and the expected/actual counts. It is
**read-only**: `node:fs` reads, never a write. A consistent tree logs one clear line per package
root and stays silent; the note is gated exactly like the intent notes (workspace pack, `enabled`,
cooldown, dedupe, per-turn cap).

## The noise controls

- Confidence gate: `k ≥ max(threshold, intent threshold)` (default 0.75).
- Cooldown: no second note for the same intent within `cooldownCalls` (6) judged calls, per agent.
- Per-turn cap: at most `maxNotesPerTurn` (3) notes between user turns.
- Exclusion: candidates under `Target/`, `node_modules`, `.git`, `dist` are never suggested (the
  build mirror is generated, never edited).
- Fail-open and abstention: an empty surviving candidate set logs
  `<name>: abstained ambiguous <Intent> <k>` and emits nothing.
- Workspace gate: a call that belongs to another workspace (no pack whose signature matches; the
  built-in default is `Documentation/ARCHIVE-STYLE.md`) logs `abstained foreign-workspace` and emits
  nothing; a target absent from the workspace is dropped before the gate (`abstained no-companions`
  when the intent's whole target set is gone).

Every activation, refusal, and suggestion is a ledger line in the hook's own ledger (one log per
module), asserted byte-exactly by the end-phase smokes.

## The ledger

```
test-suggester: activated (bundle 0.1.0, intents 2, threshold 0.75)
test-suggester: disabled (enabled=false)
test-suggester: suggest Suite 0.84 4 candidates call grep
test-suggester: abstained ambiguous Suite 0.62
test-suggester: abstained no-companions Suite 0.62
test-suggester: abstained foreign-workspace Suite 0.62
test-suggester: suppressed cooldown Suite
test-suggester: suppressed cap Suite
test-suggester: reconciliation clear <package> (<e> expected, <a> actual)
test-suggester: reconciliation drift <n> drifts <package> (<e> expected, <a> actual) call <tool>
test-suggester: reconciliation skipped deduped <package>
test-suggester: reconciliation skipped cooldown <package>
test-suggester: reconciliation skipped cap <package>
```

## Configuration

See [SCHEME.md](./SCHEME.md) for the full table. Every knob is volatile (hot-editable without
remounting). The hook ships **disabled** (`enabled: false` in `cordis.patch.yml`): the acceptance
rate must be measured (the plan §10.3 kill criterion) before it is trusted.

## Status

The package, the Source, the smoke suites (five folders) and the build pass are complete, and the
reconciliation landed (the completion spec's wave 2c re-spec); the ETS twin and the live activation
(the profile row flip and the restart) are the remaining end-phase steps
(Documentation/Plans/POC-BRIEF.md section 8).
