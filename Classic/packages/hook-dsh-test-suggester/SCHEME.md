# SCHEME - @playform/hook-dsh-test-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                       | Volatile | Notes                                                                                                   |
| ----------------- | -------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                        | yes      | The shared universal cell (the factory's minimal block).                                                |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-test-suggester.log` | yes      | The hook's OWN ledger, one log per module.                                                              |
| `enabled`         | boolean  | `true`                                        | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`. |
| `threshold`       | number   | `0.75`                                        | yes      | The default confidence gate; per-intent thresholds may raise it, never lower it.                        |
| `maxCandidates`   | number   | `7`                                           | yes      | The note's candidate cap (the plan §3.7).                                                               |
| `maxNoteChars`    | number   | `1200`                                        | yes      | Hard character cap on the note text.                                                                    |
| `cooldownCalls`   | number   | `6`                                           | yes      | No second note for the same intent within this many judged calls, per agent.                            |
| `maxNotesPerTurn` | number   | `3`                                           | yes      | Reset per user turn (`agent/pre-step`).                                                                 |
| `intents`         | string[] | `[]` (all pack intents enabled)               | yes      | The enabled intent ids; unknown ids are ignored.                                                        |
| `emitOn`          | string[] | `["bash","glob","grep","read"]`               | yes      | The judged tool names.                                                                                  |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`     | yes      | Substrings; a candidate whose path matches one is never suggested.                                      |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                                          |
| -------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; the reconciliation (below) then detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'test-suggester', form: 'notice', summary: '<Intent> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                                               |

## The reconciliation (`Source/Function/Reconcile.ts`, the wave 2c re-spec)

On a judged call in a package (the nearest ancestor of the resolved call path carrying
`package.json`, at or below the workspace root), the package's SMOKE CLAIMS are compared with the
tree it actually has.

It is READ-ONLY: `node:fs` reads only (never `ctx.fs`), and its only surface is ONE
`additionalContexts` notice.

THE EVIDENCE:

- the CLAIMS - each `Source/Test/<Folder>/README.md`'s `## Expected count`, parsed exactly as
  `Maintain/Run-Smokes.mjs` parses it (the first `<n> PASS` after the heading);
- the TREE - the folders that exist, each folder's `Test.ts`, and the aggregate runner's roster (the
  runner enumerates `Target/Test/<Folder>/Test.js`, so the built tree IS the roster);
- the INDEX - when the workspace graph service is present (`ctx.get('workspaceGraph')`, PROBED and
  never injected), its `Test` nodes for the package; an unpopulated graph contributes nothing.

THE DRIFTS (each names ONE file; `expected` is the PASS count the README claims, `actual` is the
PASS count the runner would run):

| Drift                                  | File named                     | expected             | actual |
| -------------------------------------- | ------------------------------ | -------------------- | ------ |
| `no "## Expected count"`               | the folder's `README.md`       | 0 (nothing claimed)  | 0      |
| `the README count has no Test.ts`      | the folder's `Test.ts`         | the README's count   | 0      |
| `not in the aggregate runner's roster` | `Target/Test/<Folder>/Test.js` | the README's count   | 0      |
| `the graph's Test node has no file`    | the node's path                | 1 (one node claimed) | 0      |

The note header carries the PACKAGE totals: `expected` is the sum of every README count (whether or
not the tree supports it), and `actual` is the sum over the folders the runner will really run.

The note:

```
[test-suggester] reconciliation package=<package> drifts=<n> expected=<e> actual=<a>
- <file> - <reason> (expected <e>, actual <a>)
note: the smoke claims drifted from the tree; fix the README count, the suite file or the roster - Target/ is never edited.
```

THE GATE: the enabled flag and the workspace gate run first (a foreign workspace never reconciles),
then the same cooldown and per-turn cap the intents use (under the pseudo-intent `Reconciliation`),
plus a DEDUPE on the drift signature (an unchanged drift set is held).

The consistent tree logs its clear line ONCE per package root per apply and stays silent, which is
the documented abstention.

A package with no `Source/Test` tree is out of scope and silent.

The reconciliation note takes the call (one note per family, D9), so when it emits, the intent note
yields to the next call.

## The built-in pack (`@playform/lib-dsh-pack`, the `test/` domain)

The table below is the BUILT-IN pack's `test/` projection (`Source/Variable/Defaults.ts` selects it
with `Families(Builtin, "test")`).

A workspace pack (`<repo>/.dsh/pack.yml` or the user layer `~/.dsh/playform/workspaces/<slug>.yml`)
overrides it per repo, the Apply compiles the resolved pack's intents once per workspace root, and a
repo without a pack keeps this set.

| Intent   | Priority | Threshold | Signals (weight)                                     | Targets                                                                                                |
| -------- | -------- | --------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Suite`  | 1        | 0.6       | test-shape (0.5), path-shape (0.4), loop-shape (0.3) | `Source/Test/<Suite>/Test.ts`, `Source/Test/<Suite>/README.md`, `Maintain/Run-Smokes.mjs`, `README.md` |
| `Counts` | 2        | 0.5       | count-shape (0.5), doc-shape (0.3)                   | `README.md`, `SCHEME.md`, `Site/Source/Library/Content.ts`                                             |

Confidence: `k = sigmoid(Σ weights − 0.6)`; the note emits iff `k ≥ gate`, the candidate set
survives the cap and the exclusion, and the cooldown and cap allow it.

The pack's per-intent thresholds (0.6 / 0.5) are set so that only full-evidence probes cross them
(Suite needs all three signals: k 0.65; Counts needs both: k 0.55), and the config `threshold` may
raise the gate, never lower it below the pack floor.

## Ledger strings (byte-exact, module-owned)

```
test-suggester: activated (bundle 0.2.1, intents <n>, threshold <t>)
test-suggester: disabled (enabled=false)
test-suggester: suggest <Intent> <k> <n> candidates call <tool>
test-suggester: abstained ambiguous <Intent> <k>
test-suggester: abstained no-companions <Intent> <k>
test-suggester: abstained foreign-workspace <Intent> <k>
test-suggester: suppressed cooldown <Intent>
test-suggester: suppressed cap <Intent>
test-suggester: reconciliation clear <package> (<e> expected, <a> actual)
test-suggester: reconciliation drift <n> drifts <package> (<e> expected, <a> actual) call <tool>
test-suggester: reconciliation skipped deduped <package>
test-suggester: reconciliation skipped cooldown <package>
test-suggester: reconciliation skipped cap <package>
```

The post-execute listener resolves the workspace root before the gate (the nearest ancestor whose
PACK SIGNATURE matches, where the signature is the resolved pack's `signature` list, defaulting to
`Documentation/ARCHIVE-STYLE.md`, from the call path plus the session cwd).

A foreign workspace has no pack and logs `abstained foreign-workspace  0.00` (the gate runs before
the intent is known, so the intent segment is empty and the kappa is the no-signal 0.00).

The resolved pack's `test/` intents drive Detect (compiled once per root), so a repo pack overrides
the built-in intents without a restart.

With the root known, a target is kept when it exists under ANY of the call's three bases (the repo
root, the package root, which is the nearest ancestor of the resolved call path carrying
`package.json` at or below the repo root, and the package parent).

An intent with none left logs `abstained no-companions <Intent> <k>`.

Targets carrying a `<...>` placeholder (`Source/Test/<Suite>/Test.ts`,
`Source/Test/<Suite>/README.md`) are illustrative and are never existence-checked.

## Identity (the four agreeing places)

1. Package name: `@playform/hook-dsh-test-suggester`.
2. The `name` export: `test-suggester`.
3. The State build's `module:` option: `test-suggester`.
4. The ledger `logFile` default: `~/.dsh/playform/hook-dsh-test-suggester.log`.
