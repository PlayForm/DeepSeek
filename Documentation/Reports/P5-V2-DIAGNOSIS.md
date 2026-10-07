# P5 v2 storage journal - live failure diagnosis

> One of the four research reports migrated from the pre-restructure flat documentation folder — see also
> `../Handoff/Packages/Package-13.md` (the fix it informed) and
> `../Handoff/Packages/Package-10.md` (the P5 finding's origin).

Date: 2026-10-06 · Read-only research, no family files touched, no commits. Scope: why
`~/.dsh/storages/package_governance.json` stopped landing records after the v2 domain bump; both
suspected loss paths examined against the code and the empirical record.

## Verdict (one paragraph)

The **v2 open fails at every boot since commit `4c0e83b`** (Oct 5 17:21:22 UTC): the file backend's
single-layout unit parser hard-rejects a `version: 2` open against an on-disk `unit.version: 1` file
(`version-mismatch`), the Open's catch swallows it silently, no sink is ever bound, and every
subsequent record from every module drains into the never-retired `PendingJournal` buffer and dies
with the process. The suspected residual boot-window drain race (`aa53c91` gap) **did not fire and
is structurally closed** in the current code: the ledger↔journal `activated` record match is 1:1
across the entire v1 era. The "20:34/20:50-boot exclusions without activations" were not boots -
they are `excluded` events from fs-observation scans inside the still-running process activated at
15:46:52 UTC.

## Path 1 - the v2 open (CONFIRMED, the live failure)

**Family side.** `dsh-plugin-factory/Source/Function/Open.ts:68-90` declares the domain with
`version: 2` (line 71) and the six-value enum (75-82); any failure hits the final `catch` and is
dropped with no log line (135-137). Installed Target identical (`Target/Function/Open.js`).

**Harness side.**

- `@deepseek-ai/dsh-storage-domain` 0.2.0-rc.2 (installed at
  `dsh-plugin-factory/node_modules/@deepseek-ai/dsh-storage-domain/lib/index.js`):
  `DomainFacility.open` (line 355) rejects a second open of the same name via the `reserved` set
  (356-357, the one-open-per-domain rule); backend errors such as `version-mismatch` pass through
  unmodified (doc lines 338-341), and the reservation is released on failure (386/395) so the next
  module's open retries and fails identically.
- `@deepseek-ai/dsh-storage-json` 0.2.0-rc.2 (runs from the harness asar,
  `dsh/node_modules/@deepseek-ai/dsh-storage-json/lib/index.js`; extracted copy inspected at
  `/tmp/dsh-storage-json.js`): for a **single**-layout unit, `openSingleUnit` (178-191) reads the
  existing file and calls `parse()`, which throws `StorageError("version-mismatch")` when
  `unit.version !== descriptor.version` (100-102). **No migration, no leniency, no
  `compatibleVersions` consultation - the exact-equality check is the whole rule for single
  layout.**
- Mount config confirmed: dsh-base wires `storage-json` with root `dshHomePath('storages')` and
  `storage-domain` with `backend: json` (asar embedded config) →
  `~/.dsh/storages/package_governance.json` is the single-layout unit.

**Why nothing persists.** The version is never "persisted on open": the file is rewritten only by
`publish()` on a successful put, stamping `state.version` (serializer lines 72-84). A failed open
writes nothing, so the file stays `unit.version: 1` forever. The zod schema is enforced **only at
open time** (`loadAll` → `parseRecord`, storage-domain lib 364-375); `KvTableImpl.put` does **no**
schema validation. All 76 stored v1 records use events that are a subset of the v2 enum, so the
schema would accept them - the version check is the _only_ blocker between the file and a successful
v2 open.

**Empirical confirmation.**

- Journal: 76 records, `unit.version: 1`, no `normalized` record at all; last records 17:34:49 /
  17:50:07 / 17:50:13 UTC (Oct 5) - before the first post-v2 boot.
- Ledgers (ISO UTC): governor `activated` at 19:21:31.954Z and 21:28:45.332Z - both after the v2
  commit - with **zero** matching journal records. Every `activated` ledger line from the v1 era
  (Oct 3 20:10:52Z → Oct 5 15:46:52Z, 13 boots) has exactly one journal `activated` record.
- `normalize-dash.log` shows live `normalized` stream lines at 21:49-21:50Z in the 21:28:45Z boot;
  the flavors journal through the same factory wrapper, and nothing landed → **the sink was never
  bound at those boots because the open failed** - the primary suspicion, confirmed.

**Post-v2 boot mechanics (why EVERYTHING is lost, not just activations).** With the open failing,
`SharedJournal` is never bound and `PendingJournal` is never drained/retired (`Open.ts:108-134` all
sit after the failing `await`). `Journal.ts` stage 2 (45-56) then buffers _every_ record from
_every_ module (all twelve hold the same factory instance) into the capped-256 buffer, which is
dropped at process exit — total loss, replacing the v1-era pattern (activations buffered, later scan
records landing through the bound sink).

## Path 2 - the boot-window drain race (NOT the live failure; closed)

- Routing order is `SharedJournal` → `PendingJournal` → per-State queue (`Journal.ts:41-59`).
  `PendingJournal` is initialized as `[]` in the factory constructor (`Library.ts:118`), so stage 2
  catches records from the very first apply. Stage 3 (per-State queue) is reachable only when
  `PendingJournal` is _not_ an array **and** no sink is bound - impossible after a successful open:
  `Factory.SharedJournal = Sink` (Open.ts:109-112) and `PendingJournal = undefined` (131) execute in
  the same synchronous block after the `await` resolves.
- A later module's `activated` journaled after the first open's drain hits stage 1 and lands;
  journaled before the drain, it hits stage 2 and is drained by the first open. Both orderings are
  covered - `aa53c91` did its job; the task's residual-loss scenario does not exist in the current
  code.
- The file data agrees: in the whole v1 era no boot has a missing `activated` (13/13 matched). The
  `excluded`-only stretches (Oct 4 16:34-17:49Z, Oct 5 11:02-11:52Z, 15:09-15:15Z, 17:34-17:50Z)
  fall between boot activations and come from `Observe.ts:45`
  (`State.Factory.Journal(State, "excluded", ...)`) - fs-observation scan events of a long-running
  process, not boot activations.
- Residual weaknesses that _do_ exist (not currently firing):
    1. If the factory probe fails in `Attach.ts:74-81` (`Factory` undefined), a successful open
       binds `State.Journal` but never `SharedJournal`, and `PendingJournal` is never retired → all
       later records still buffer into the un-drained stage 2. Unlikely, but the same silent failure
       shape.
    2. A failed first open makes stage 2 a permanent black hole (see Path 1) - no retry, no
       visibility. The `aa53c91` design assumed the first open either wins or loses to an
       already-open _successful_ peer; it never considered "the open itself always fails".

## Recommended fixes (family-side, minimal)

**Path 1 - pick ONE of (a) or (b), plus (c) always:**

- **(a) One-time rotation of the v1 file.** Rename (don't delete)
  `~/.dsh/storages/package_governance.json` → e.g. `...json.v1.bak`. The next boot's v2 open sees no
  file, creates it fresh, and stamps `version: 2` on the first publish. Fits the family doctrine
  (Open.ts:14-18: the journal is "the structured, disposable one"; the ledgers are the complete
  record); precedent: `f4aaf6b` already removed the file from `~/.dsh` git tracking once. **`~/.dsh`
  is the user's home — this is the user's call; the parent should ask before touching it.**
- **(b) Structural self-migration (no user action needed):** declare `layout: "per-record"` +
  `compatibleVersions: [1]` in the v2 spec. The per-record backend's legacy bootstrap
  (`bootstrapLegacyUnit`, storage-json lib 370-404) copies every record of a v1-stamped single file
  into per-record documents when the file's version is in `acceptedStamps` (`[2, 1]`) — the 76
  records migrate automatically on the next open, the legacy file is left untouched, and all of them
  validate against the widened enum. Bonus: one small atomic write per record instead of whole-file
  rewrites. Note `compatibleVersions` alone (without the layout switch) does **not** help:
  single-layout `parse()` checks exact equality only.
- **(c) Always: make the Open failure loud.** Replace the bare `catch` at `Open.ts:135-137` with a
  single ledger line (e.g. via the same `Factory.Append`/append path the modules use):
  `[ts] storage journal open failed (<code>): <message>`. The silence is what made this
  undiagnosable; the ledger stays the complete record either way. Also add
  `invalidRecords: "backup-and-skip"` to the spec so one corrupt record can never brick the open
  again (currently the whole open fails on a single invalid stored record).

**Path 2 - keep `aa53c91` as-is; fix the failure path, not the retirement:**

- Do **not** defer the `PendingJournal` retirement: it is correct today (stage 1 is checked first,
  so post-retirement records go straight through the shared sink); deferring only widens the window
  in which records sit in a buffer a later failing open will never drain.
- No need for "stage 3 drains through the shared sink": that is already the effective behavior of
  stage 1; the per-State queue is dead weight on the happy path.
- The real gap is the _failed_ open: (i) the loud log from (c) above; and (ii) optionally one lazy
  re-open retry - in the `Journal.ts` stage-2 branch, when the buffer crosses a threshold (e.g. 64)
  trigger a single re-attempt of the Open (a boolean flag prevents hammering), covering both the
  current permanent failure and transient ones (storage service not yet ready at apply time). Stage
  2 silently dropping at the 256 cap (`Journal.ts:46-55`) should also emit one ledger line per boot
  at most.

## Key citations

- `dsh-plugin-factory/Source/Function/{Open.ts:68-90,108-137; Journal.ts:41-59; Attach.ts:68-105; State.ts:36-62; Library.ts:118,255-283}`
  — v2 spec, three-stage routing, probes, caps (all under `~/.dsh/profiles/desktop/bundles/`)
- `@deepseek-ai/dsh-storage-domain` 0.2.0-rc.2 lib/index.js:355-395 — single-open enforcement, error
  pass-through
- Harness asar `@deepseek-ai/dsh-storage-json` 0.2.0-rc.2 lib/index.js — `parse`/version-mismatch
  91-119, `openSingleUnit` 178-191, serializer 72-84, per-record `acceptedStamps`/legacy bootstrap
  353-404
- `~/.dsh/storages/package_governance.json`; `~/.dsh/governor.log`; `~/.dsh/normalize-dash.log`
  (timestamps above)
- `~/.dsh` git: `4c0e83b` (v2 bump, Oct 5 17:21:22Z), `aa53c91` (pre-bind buffer), `952eaa1` (shared
  sink), `f4aaf6b` (file-removal precedent)
