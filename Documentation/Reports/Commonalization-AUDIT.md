# Commonalization Audit - Write Executors + Family Machinery (register item #6)

> One of the four research reports migrated from the pre-restructure flat documentation folder — see also
> `../Handoff/Register.md` (item #6) and `../Handoff/Packages/Package-13.md` (the pass executed).
> Companion reports live alongside this file in `Documentation/Reports/`.

Status: **AUDIT COMPLETE, DESIGN PROPOSED (read-only; nothing edited, nothing committed).** Scope:
the eleven family packages at `~/.dsh/profiles/desktop/bundles/` (post-rename state:
`hook-dsh-normalize-dash` already carries the new name) and the archived smokes at `~/.dsh/smokes/`.
The built-in write tool source was extracted from the installed app's asar for the tiebreaker
(`dsh/node_modules/@deepseek-ai/dsh-tool-fs/lib/index.js`, v0.2.0-rc.2; cited below as
`tool-fs/index.js:N` with the line numbers of the extracted file). Doc contract:
`~/Developer/Documentation/Module/deepseek-harness/docs/subsystems/filesystem.md`.

The user request (verbatim): _"further commonalize - abstract away the commonalities between the
different plugins, as we have now multiple write hooks that do the same, just to avoid repetition
for maintainability cost optimization."_

---

## 1. The write-path audit - three executors, one shared pipeline

All three executors implement the same five-step pipeline the harness's `write` tool owns
(filesystem.md:278 - resolve → `fs/write-intent` waterfall → sandbox policy → `writeText` →
`fs/observed`). The per-step inventory:

| Shared step                    | Built-in `write` (tool-fs/index.js)                                                                                                               | Family `raw-write` (normalize-dash)                                                                            | Factory `GuardedWrite`                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1. resolve                     | :582 (+ `sessionResolveOptions` :177-190 - session cwd, escalation root)                                                                          | Write.ts:112-114 - **no cwd option** (backend default; a real divergence from the built-in)                    | none - target arrives pre-resolved                                                                 |
| 2. `fs/write-intent` waterfall | :583 `next() => void 0`                                                                                                                           | Write.ts:115-120, identical `next() => undefined`                                                              | none - builds the intent inline :42 `{ kind: "replaceIfVersion", version }`                        |
| 3. sandbox policy              | `FsSandboxController` ctor :1082-1088 (fail-closed missing-policy throw) + `resolvePolicy` :1120-1146 (standing session policy, escalation retry) | Write.ts:125-132 - **verbatim replica** of the no-escalation branch (~8 lines), incl. the missing-policy throw | Write.ts:44-49 - the **P4 fence**: per-call `workspace-write` rooted at the target's own directory |
| 4. `writeText`                 | :586 (5 args: target, content, intent, signal, policy) + denial remediation :587-589                                                              | Write.ts:133-139, same 5 args, no remediation                                                                  | Write.ts:39-50, same 5 args, no remediation                                                        |
| 5. `fs/observed` present emit  | :590-593 `{ kind:"present", version }`, actor `exec`                                                                                              | Write.ts:140, byte-identical shape, actor `exec`                                                               | none - delegated to `Refresh` (Refresh.ts:24-30: Stash set + same-actor re-emit, best-effort)      |
| signal                         | `exec.signal` end to end                                                                                                                          | `exec.signal` end to end (Write.ts:33-34)                                                                      | caller's signal (Continue.ts:102 task-owned `Control.signal`)                                      |
| error path                     | denial-marker mapping + `FsError` retention                                                                                                       | plain `Error` (Write.ts:127-131)                                                                               | fully contained in `Continue` (Continue.ts:117-126, logger-only)                                   |
| version/Stash                  | none (policy plugin owns records)                                                                                                                 | none                                                                                                           | Write.ts:53 `Stash.set` pre-registration (the idempotence gate)                                    |

Duplication quantification (lines implementing the shared pipeline):

- **Built-in**: execute body :575-600 ≈ 26 lines (+ the ~120-line controller, shared with `edit`).
- **raw-write**: execute body Write.ts:110-147 = 38 lines, of which ~35 mirror the built-in's steps
  1-5 verbatim (the file's own header admits it: Write.ts:16-31). Plus presenters ~30 lines.
- **GuardedWrite**: 55 lines, of which ~17 overlap (policy resolution + `writeText`); its Stash and
  P4-fence behavior is unique but the _resolution mechanics_ (sandboxMode ternary → policy shape)
  are the third hand-rolled copy of the same decision.

Bottom line: **three implementations of the sandbox-posture decision, three of the `writeText` call
shape, two of the `fs/observed` present emit, plus a third variant (`Refresh`)** - the exact
repetition the user flagged.

## 2. The broader audit (inventory only)

**Activation lines.** Eleven `Apply.ts` sites hand-compose `activated (...)` strings - six variants
of one template: replacement+reasoning+toolArgs+logFile (dash Apply.ts:67, spaces :59, ellipsis :59,
invisible :62), no-replacement (quotes :59, fullwidth :59), and the governor Journal forms
(package-governor Apply.ts:67-69, cargo-governor :73-75, pinner :48-50). Same mechanics
(`Factory.Append` pre-Open or `Factory.Journal` queued), only the field lists differ.

**Smoke fake-ctx harnesses.** Six independent implementations of the same fake ctx:
quotes/ellipsis/spaces/invisible/fullwidth smokes are **byte-near-identical 208-line files** whose
`Make()` (quotes-smoke.mjs:24-44 et al.) duplicates capture seams verbatim; normalize-dash extends
it with fs/tools/waterfall seams (normalize-dash-smoke.mjs:28-90); factory (:36-80), governor
(:48-100), cargo (:46-107 + `boot`), and pinner (:29-85, real temp-dir fs with version tokens) each
re-implement `on/emit/effect/get/reflect/fs`. Variance: real-I/O vs capturing fs, effect-disposal
semantics, the `ProbeState`/`__*State` coupling. Roughly **~300 duplicated harness lines** across
the eleven suites.

**Update-stage envelopes.** package-governor `Dispatch.ts` (156 lines) vs cargo-governor
`Dispatch.ts` (166): identical gates (breaker → in-flight → cooldown), identical jobs envelope
(unowned job, `cancel`/`done` semantics, P2 `Inflight` under `Factory.UpdateKey`). `Settle.ts` 52 vs
66 lines: identical breaker update, failure-line string, P5 journal record, and U₂ (stat →
`Factory.Refresh`). Only drift: the child execution stage and cargo's explicit `Factory` parameter.
This pair is the next-highest-value commonalization after the write path.

## 3. The design - ONE shared write executor, owned by the factory

The factory is the family's service and the only package both tool-style (`raw-write`) and
continuation-style (`GuardedWrite`/`Continue`) writes already depend on. The harness's built-in
`write` tool is **OUT of scope** (harness-owned `dsh-tool-fs`); the abstraction is family-side and
mirrors the built-in's mechanics so `fs/observed` chains stay identical.

Proposed signature - `dsh-plugin-factory/Source/Function/Write.ts` becomes the shared executor
(`GuardedWrite` folds into it; SCHEME.md §2.7 keeps the name as the guarded alias):

```ts
export default async (
  State: State,
  Target: FsTarget,            // pre-resolved; resolve stays caller-side (cwd semantics differ legitimately)
  Content: string,
  Over: {                      // "what the caller adds on top" - the option bundle
    intent?: FsWriteIntent | { waterfall: true },  // default { waterfall: true } (fs/write-intent, next() => undefined)
    signal?: AbortSignal | undefined,
    policy?: "standing" | "p4" | SandboxExecutionPolicy | undefined, // default "standing" (built-in no-escalation replica)
    actor?: object | undefined,                    // fs/observed actor; default undefined for family-internal writes
    observe?: boolean,                             // default true: emit fs/observed { kind:"present", version } after success
    stash?: boolean,                               // default false: pre-register Outcome.version in State.Stash
    transform?: (content: string) => string,       // caller's content step (raw-write's six-fold Rewrite chain)
  } = {},
): Promise<FsWriteOutcome>
```

**Migration shapes.**

1. **raw-write** (normalize-dash Write.ts:110-147): collapses to `resolve` (unchanged, 3 lines) +
   one
   `Factory.Write(State, target, AsWritten(...), { signal: exec.signal, actor: exec, policy: "standing" })`
   call - ~35 lines → ~10. Schema, presenters, and `AsWritten` (shared with the presenters,
   Write.ts:51-52) are untouched. The missing-policy error message moves into the executor (keep the
   exact string: Write.ts:129).
2. **GuardedWrite** (factory Write.ts): the executor itself -
   `intent: { kind:"replaceIfVersion", version }`, `policy: "p4"`, `stash: true`, `observe: false`;
   `Continue` (Continue.ts:95-103) and `Settle` callers keep their call sites modulo the options
   object.
3. **Built-in `write`**: unchanged; it remains the reference the executor mirrors. Known accepted
   divergences stay harness-side: escalation schema fields, session-cwd resolve options, the
   `[sandbox: ...]` denial marker, and presentationMeta hunk diffs.

## 4. Risk map - smoke coverage per executor (zero-assertion-change arbiter)

- **GuardedWrite / chain pass**: factory-smoke.mjs:229-240 (intent deep-equal, both P4 postures,
  Stash pre-registration), :473-478 (signal forwarding), :296 (chain-pass intent);
  governor-smoke.mjs:327-360 (chain pass via `Factory.Continue` - intent, bare fence, task-owned
  signal, serialization), :512+ (confined fence posture), :410-419 (U₂ same-actor refresh);
  cargo-smoke.mjs factory-wiring checks + :911 (FS_STALE_VERSION propagation). → gates Stage 1.
- **raw-write**: normalize-dash-smoke.mjs Run 8 (:298-355 - schema, verbatim default,
  `normalize: true` six transforms, replacement knob, explicit false, update before/after,
  pre-aborted signal, `fs/observed` shape, `intent === undefined` passthrough, bare-backend
  `policy === undefined`); core-smoke.mjs:276-295 (the `raw-write` **name** exemption in the
  stream - the tool name must not change). → gates Stage 2.
- **Arbiter**: every smoke suite must pass with **zero assertion edits**. The executor must be
  behavior-preserving byte-for-byte: intent passthrough, fence values, Stash side effect, emit
  shape/actor, outcome envelope, abort semantics, ledger strings.

## 5. Sequencing recommendation

**One coder, two stages** (not one big-bang package, not separate coders):

- **Stage 1 - factory absorbs the executor**: `GuardedWrite` folds into the shared `Write` with the
  `Over` options; `Continue`/`Refresh`/`Settle` call sites adapt in the same change. Gates: factory,
  governor, cargo smokes green unmodified. This proves the union (intent, P4 vs standing policy,
  Stash, observe, actor) against the strictest suites first.
- **Stage 2 - raw-write delegates**: normalize-dash's exec collapses onto `Factory.Write(...)`;
  gates: normalize-dash Run 8 + core's name-exemption cases green unmodified. Mechanical, low-risk,
  independently revertable.

Stage 1 first is deliberate: the executor's home is the factory, so migrating the factory's own
write proves the union before the tool depends on it. If the maintainer prefers a single change, it
is safe only with all eleven smokes run between the two commits.

**Follow-on candidates (same lens, separate items)**: the governor/cargo `Dispatch`/`Settle` pair
(§2), the activation-line template, and a shared smoke fake-ctx module (~300 duplicated harness
lines).
