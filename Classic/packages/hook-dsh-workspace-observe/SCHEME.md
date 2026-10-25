# SCHEME.md - @playform/hook-dsh-workspace-observe (v0.1.0, TypeScript, object plugin)

Status: **IMPLEMENTED and VERIFIED** (deterministic build zero errors; minified build; the
package-internal per-test suite green - 45 checks across 3 folders, see section 7).

## 0. What this plugin is

The workspace-observe hook: the first step of the invisible flow. On every `fs/observed` event it
records one observation stamp (path, observed version, origin, the plugin's own monotonic sequence)
in its own KV storage domain. The conversation never sees the stamps; a later wave's events surface
them. The hook reads the event only - it never reads file content and never writes a file.

Source of truth: `Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md` section 5 (the frozen
contract).

## 1. The plugin form and the service

The OBJECT form: `export const name` = `hook-dsh-workspace-observe`, `export const apply`,
`export const Config`, `export const inject` = `["pluginFactory", "fs"]`, and the default object
carries all four.

The `workspaceObserve` service is a `Service` subclass in its own module
(`Source/Function/Service.ts`) and is **registered from apply** (the Service base constructor calls
`ctx.reflect.provide("workspaceObserve", this)`). Declaration merging gives the typed accessor:

```ts
ctx.workspaceObserve.stamp(path: string): Stamp | undefined
ctx.workspaceObserve.stamps(limit?: number): Stamp[]   // the ring, newest first
await ctx.workspaceObserve.manual(path: string): Promise<Stamp>
ctx.workspaceObserve.statistics(): { paths, stamps, sequence }
```

`manual` resolves through `ctx.fs` (`resolve` + `stat`), records with origin `manual`, and ledgers
`manual <path> version <version>`. An absent target records version `absent` - never a fabricated
token.

## 2. The listener

Registered on the ROOT context through the factory's `Wire`
(`ctx.root.on("fs/observed", (target, observation, actor) => void)`), the posture that hears ALL
`fs/observed` emissions. The listener is a synchronous recorder: no awaits, no throws, no I/O, no
file content read.

The repeat-event guard (`Function/Duplicate`): a repeat event for the same path carrying the same
version within a short coalescing window (2 s on the module's clock; the `State.Now` test seam
overrides it, no real timer anywhere) is dropped silently - that file state is already recorded (the
version token identifies the state), so no sequence, no stamp, no storage put, no trace emission, no
line. A different version, or the same version after the window, is stamped normally: the last
distinct version always wins. The manual path is never guarded.

Each RECORDED stamp is then emitted on the family's trace bus as `observe/stamp` (the indexer's
first source, D5) through `Source/Trace/Adapter.ts`: the payload is `{ path, version, origin }` (the
hook's own sequence stays private). The bus (`ctx.trace`) is provided by
`@playform/plugin-dsh-factory`, which the hook already injects; the adapter resolves it through the
factory's probe-once `Seam` accessor, so a context without the bus records stamps exactly as before
and emits nothing. The emission never throws into the recorder.

The `FsObservation` version field is verified from the installed `@deepseek-ai/dsh-fs` types
(`lib/types/types.d.ts`): a present observation carries `readonly version: FsVersion`; an absent one
has no version - the stamp records `absent`.

The event vocabulary (`FsTarget`, `FsObservation`) is type-only: the built Target has no runtime
import of `@deepseek-ai/dsh-fs`.

## 3. Config (the full schema, every knob volatile)

Composed via the factory's standalone `Schema(false, {...})` helper - the NON-MANIFEST posture.
Every knob is `.volatile()`.

| Field       | Type      | Default                                          | Meaning                                      |
| ----------- | --------- | ------------------------------------------------ | -------------------------------------------- |
| `logFile`   | string    | `~/.dsh/playform/hook-dsh-workspace-observe.log` | the module's OWN ledger, one log per module  |
| `log`       | boolean   | `true`                                           | the durable ledger file enabled              |
| `enabled`   | boolean   | `false`                                          | the MASTER switch - the IDLE-forever posture |
| `domain`    | string    | `workspace_observe`                              | the KV domain NAME (non-empty, fail-loud)    |
| `maxStamps` | number    | `1000`                                           | the ring bound (integer ≥ 1, fail-loud)      |
| `include`   | string[]  | `[]`                                             | the optional allowlist; empty = every path   |
| `exclude`   | string[]  | `node_modules/**, **/Target/**, **/.git/**`      | the excluded path patterns                   |
| `policy`    | Allowlist | the D6 defaults (see below)                      | the per-action allowlist (D6)                |

Fail-loud validation runs BEFORE the State build: an empty `domain`, a non-integer or sub-1
`maxStamps`, or a non-array `include`/`exclude` throws at load with the `observe: ` message prefix.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The hook's action class is RECORD, which is **automatic**: it records a stamp and nothing else. The
package has **NO gated action** (no file write, no batch commit, no spawn), so the block documents
the posture and refuses nothing. The block is one volatile object, so a policy flip is hot-editable
without a remount; a resolved pack's `policy` section overrides the defaults per action (the wiring
is the next refinement). No new ledger line: the package has no gated action.

## 4. The storage domain

The hook's OWN domain - named config `domain` (default `workspace_observe`), version 1, layout
`per-record`, `compatibleVersions: [1]`, `invalidRecords: "backup-and-skip"`, TWO tables:

- `stamps` - one record per path: the latest stamp, keyed by the path;
- `ring` - ONE meta record `__ring`: the bounded ring snapshot.

Puts are fire-and-forget from the synchronous listener (`void .catch()`). The open is kicked off
from the plugin's own effect with `void`; an ABSENT facility (no `storageDomain` service) is a
silent skip; a PRESENT facility whose open fails is LOUD (`storage open failed: <reason>`, never
rethrown). The recovery runs on mount: the `stamps` records rebuild the latest map, the `__ring`
record rebuilds the ring, and the sequence restarts at the MAXIMUM loaded sequence - the counter is
monotonic across restarts. A record that fails validation is skipped, never guessed.

## 5. The match (module-owned)

The factory's `Match` is the segment match; the hook's frozen default exclude list is the glob
triple, so the module owns its leaf (`Function/Match.ts`): a pattern containing `*` compiles to an
anchored regex (`**` → `.*`, `*` → `[^/]*`) tested against the full path AND every path suffix
starting at a segment boundary; a plain pattern is the segment match.

## 6. The ledger strings (the contract)

Byte-exact, `observe: ` prefix - the module identity for the State build is `observe`, which is what
makes the frozen lines of the brief's section 5.7 byte-exact through the factory's Append layer. The
npm identity (`hook-dsh-workspace-observe`) lives in the package name and the `name` export; the
ledger prefix is the module's own contract string. The one string beyond the frozen set is the P5
incident posture's `storage open failed: <reason>` (loud open failure, documented in the README).

## 7. The test battery (the package-internal per-test folders)

| Folder                | PASS | Covers                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Wiring-And-Stamps`   | 16   | the cold mount, the root registration with the distinct root identity, the apply-registered service, the activation proof, the stamp mechanics (monotonic sequence, event version, origin), the fail-loud validation, the statistics triple                                                                                                                                            |
| `Guards-And-Ring`     | 19   | the excluded path, the own-actor identity check, the include allowlist, the latest overwrite, the ring cap with the byte-exact capped line, the malformed-event containment, the volatile flip of the ring bound, the repeat-event guard (Function/Duplicate: the same path and version inside the window is dropped silently; a different version or a post-window repeat is stamped) |
| `Storage-And-Service` | 14   | the domain spec, the record persistence, the restart recovery with the continued sequence, the persisted cap, the manual path, the ZERO writeText/readText guarantee, the absent facility, the loud open failure                                                                                                                                                                       |

Every folder runs standalone (`node Target/Test/<Name>/Test.js`) and its `README.md` declares the
expected count under `## Expected count`.

## 8. What this plugin does NOT do (scope)

No fingerprint (the graph owns content hashes - W1 record decision), no fs/write-intent or
fs/edit-intent registration (the single-slot waterfalls belong to the observation policy), no tools,
no surfaces, no file content reads, no wall clock, no profile activation (the IDLE-forever posture),
and no surfacing of the stamps to the conversation (a later wave's events do that).

## 9. The EffectTS twin

Deferred to W8 (the brief's wave order); the Classic tree is the contract source for it.
