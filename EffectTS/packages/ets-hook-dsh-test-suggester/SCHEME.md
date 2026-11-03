# SCHEME - @playform/hook-dsh-test-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                           | Volatile | Notes                                                                                                   |
| ----------------- | -------- | ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                            | yes      | The shared universal cell (the factory's minimal block).                                                |
| `logFile`         | string   | `~/.dsh/playform/ets-hook-dsh-test-suggester.log` | yes      | The hook's OWN ledger, one log per module.                                                              |
| `enabled`         | boolean  | `true`                                            | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`. |
| `threshold`       | number   | `0.75`                                            | yes      | The default confidence gate; an explicit pack's family thresholds may raise it, never lower it.         |
| `maxCandidates`   | number   | `7`                                               | yes      | The note's candidate cap AND the `Adjacent` limit (the plan §3.7).                                      |
| `maxNoteChars`    | number   | `1200`                                            | yes      | Hard character cap on the note text.                                                                    |
| `cooldownCalls`   | number   | `6`                                               | yes      | No second note for the same family within this many judged calls, per agent.                            |
| `maxNotesPerTurn` | number   | `3`                                               | yes      | Reset per user turn (`agent/pre-step`).                                                                 |
| `intents`         | string[] | `[]` (all of an explicit pack's families enabled) | yes      | The enabled intent ids; unknown ids are ignored.                                                        |
| `emitOn`          | string[] | `["bash","glob","grep","read"]`                   | yes      | The judged tool names.                                                                                  |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`         | yes      | Substrings; a candidate whose path matches one is never suggested.                                      |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session/event`      | plain                         | Folds every `tool/call` event into the session's history (one touch per call, capped at 512, oldest first). This is the candidate source.                                                                                                                           |
| `tools/post-execute` | waterfall, plain registration | `next()` first; the reconciliation (below) then the HISTORY candidates (or an explicit pack), detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'test-suggester', form: 'notice', summary: '<Family> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                                                                                             |

## The candidates (the session history)

The suggestions come from the agent's OWN PREVIOUS TOOL CALLS in this workspace, never from a
literal built-in pack.

The `session/event` listener folds every `tool/call` event into one touch (the sequence number, the
normalized path and the tool) in the SESSION's history, through the fold unit of
`@playform/ets-lib-dsh-pack`. One entry per session object, created lazily; the touch array is
capped at 512, oldest first.

The path comes from the first path-shaped argument (`file_path`, `path`, `filePath`), with
backslashes normalized to slashes and a leading `./` stripped.

On a judged call the listener reads the session's touches (keyed on the agent's session, then the
agent, then one shared default entry) and calls
`Adjacent(touches, callPath, { limit: maxCandidates })`: for every touch of the anchor path, the
touches that follow it within a window of 8 calls contribute `1 / (1 + distance)` to the followed
path's score and one to its count. A repeatedly co-touched path outranks a single one, and a near
neighbour outranks a far one. The anchor itself is never a candidate.

Those co-touch rows become ONE SYNTHETIC family, so the existing Detect/gate/note pipeline judges
them exactly like a resolved pack's family:

```ts
{
  id: "History",
  priority: 0,
  threshold: 0.75,
  note: "these files were touched right after this one in this workspace",
  signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
  targets: nearby.map((entry) => ({
    path: entry.path,
    prior: 0.6,
    reason: `touched ${entry.count} time(s) after this file`,
  })),
}
```

Its confidence is therefore `k = sigmoid(2.5 - 0.6) = 0.87`. The note carries the existing
`intent=History` header, and the ledger records the existing
`suggest History <k> <n> candidates call <tool>` line.

## The explicit pack (`@playform/ets-lib-dsh-pack`, the `test/` domain)

A pack is an EXPLICIT user/repo override, never a fallback:

- `<repo>/.dsh/pack.yml` (or `.yaml`/`.json`), or
- the user layer `~/.dsh/playform/workspaces/<slug>.yml`.

The listener resolves it with `Resolve(root, { home, builtin: false })`, so a workspace with no pack
layer resolves to `undefined` and its `test/` families contribute nothing. When a layer exists, its
`test/` families (`Families(pack, "test")`) join the synthetic History family, which is placed
FIRST, and drive the same classifier, existence filter, gate and notice - so a repo that ships a
hand-written pack still gets its own families and companions.

The configured `intents` filter applies to the explicit pack's families only (empty = all), and the
config `threshold` is a FLOOR (a family may raise it, never lower it). The families are compiled
once per workspace root and tuple.

The built-in pack of this monorepo is NOT a candidate source: its projection
(`Source/Variable/Defaults.ts`) was removed from this package, so the only pack source is an
explicit repo/user pack resolved with `Resolve(root, { home, builtin: false })`.

A workspace with no pack layer and no session history has no candidate source at all and abstains
`abstained no-history  0.00` (the double space is the empty-family shape).

Confidence: `k = sigmoid(Σ weights − 0.6)`.

The note emits if and only if `k ≥ gate`, the candidate set survives the cap and the exclusion, and
the cooldown/cap allow it.

## The reconciliation (`Source/Function/Reconcile.ts`, the wave 2c re-spec)

On a judged call in a package (the nearest ancestor of the resolved call path that carries
`package.json`, at or below the workspace root), the SMOKE CLAIMS of the package are compared with
the tree it actually has.

It is READ-ONLY: `node:fs` reads only (never `ctx.fs`), and its only surface is ONE
`additionalContexts` notice.

It runs BEFORE the candidates: when the claims have drifted the reconciliation note takes the call
(one note per family, D9) and the candidate note yields to the next call.

THE EVIDENCE:

- the CLAIMS, meaning each `## Expected count` of `Source/Test/<Folder>/README.md`, parsed exactly
  as `Maintain/Run/Smokes/Index.mjs` parses it (the first `<n> PASS` after the heading);
- the TREE, meaning the folders that exist, each `Test.ts` of a folder, and the roster of the
  aggregate runner (the runner enumerates `Target/Test/<Folder>/Test.js`, so the built tree IS the
  roster);
- the INDEX, meaning, when the workspace graph service is present (`ctx.get('workspaceGraph')`,
  PROBED and never injected), its `Test` nodes for the package, where an unpopulated graph
  contributes nothing.

THE DRIFTS (each names ONE file; `expected` is the PASS count the README claims, and `actual` is the
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

THE GATE: the enabled flag and the workspace gate come first (a foreign workspace never reconciles),
then the same cooldown and per-turn cap the candidates use (under the pseudo-family
`Reconciliation`), plus a DEDUPE on the drift signature (an unchanged drift set is held).

The consistent tree logs its clear line ONCE per package root per apply and stays silent, which is
the documented abstention.

A package with no `Source/Test` tree is out of scope and silent.

## Ledger strings (byte-exact, module-owned)

```
test-suggester: activated (bundle 0.2.1, history, threshold <t>)
test-suggester: disabled (enabled=false)
test-suggester: suggest <Family> <k> <n> candidates call <tool>
test-suggester: abstained ambiguous <Family> <k>
test-suggester: abstained no-companions <Family> <k>
test-suggester: abstained foreign-workspace  0.00
test-suggester: abstained no-history  0.00
test-suggester: suppressed cooldown <Family>
test-suggester: suppressed cap <Family>
test-suggester: reconciliation clear <package> (<e> expected, <a> actual)
test-suggester: reconciliation drift <n> drifts <package> (<e> expected, <a> actual) call <tool>
test-suggester: reconciliation skipped deduped <package>
test-suggester: reconciliation skipped cooldown <package>
test-suggester: reconciliation skipped cap <package>
```

The activation line uses the `Activate` composer of the core and the own field list of the module.
Its second segment is `history` (not an intent count): there is no boot pack, because the candidates
come from the session's own tool calls and only an explicit pack may still speak.

The post-execute listener resolves the workspace root before any candidate work, with `Root` of
`@playform/ets-lib-dsh-pack`: the nearest ancestor carrying `.git` or `package.json`, taken from the
call path plus the session cwd. The root is PACK-INDEPENDENT - the declared `signature` of a pack no
longer gates the workspace.

A foreign workspace logs `abstained foreign-workspace  0.00`, because the gate runs before the
family is known, so the family segment is empty and the kappa is the no-signal 0.00.

With the root known, a target is kept when it exists under ANY of the three bases of the call: the
repo root, the package root (the nearest ancestor of the resolved call path that carries
`package.json`, at or below the repo root), and the package parent.

A family with none left logs `abstained no-companions <Family> <k>`.

Targets that carry a `<...>` placeholder (`Source/Test/<Suite>/Test.ts`,
`Source/Test/<Suite>/README.md`) are illustrative and are never existence-checked.

## Identity (the four agreeing places)

1. **Package name.**

    `@playform/hook-dsh-test-suggester`.

2. **The `name` export.**

    `test-suggester`.

3. **The `module:` option of the State build.**

    `test-suggester`.

4. **The ledger `logFile` default.**

    `~/.dsh/playform/ets-hook-dsh-test-suggester.log`.
