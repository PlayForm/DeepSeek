# Chain-Pass

What this test verifies.

## Intent

The chain pass is the governor's core rewrite engine exercised end to end
through the real wired listener: Factory.Continue reads the manifest, runs the
module transform, and lands the guarded write (the replaceIfVersion intent at
the fresh-stat CURRENT version, the task-owned abort signal, no fence on a bare
backend), then the version-coherence machinery runs (the byte-identical
`governed <path> -> <version>` line on the ledger AND the module-prefixed
logger, the P5 journal record, the same-actor re-emit, the Stash
pre-registration so the re-emit is a no-op), the P2 Inflight lifecycle is
verified around the read, and the settled continuation's update stage runs the
bin-mode engine through the subprocess seam (resolved binary, built-in dep
groups, concurrency, the reject merge, the target pin, the DONE line) before
the settlement cleanup and the silent re-entrant pass. It is its own folder
because it is the longest single scenario chain in the suite and every later
folder's ledger arithmetic is relative to it. The assertions are moved
verbatim from `Classic/smokes/governor-smoke.mjs` section 5.

## Scenario

- Group: the chain pass through Factory.Continue + the module transform.
    - Sub: "chain pass: guarded write via Factory.Continue - replaceIfVersion
      intent + task-owned signal + P4 fence (bare backend)"
    - Sub: "chain pass: chain pin canonicalized to ^resolved, public dep +
      non-dependency sections preserved"
    - Sub: "chain pass: serialization JSON.stringify(next, null, 2) + newline
      (factory-owned)"
    - Sub: "version coherence: `governed <path> -> <version>` line
      byte-identical (ledger + module-prefixed logger)"
    - Sub: "version coherence: the P5 `governed` record carries the fresh
      version"
    - Sub: "version coherence: the factory re-emits fs/observed with the SAME
      actor"
    - Sub: "version coherence: Stash pre-registration before the re-emit (no
      second write)"
    - Sub: "Continue lifecycle: P2 Inflight registered during, removed after"
    - Sub: "jobs envelope: `update stage dispatched ...` line byte-identical +
      dispatched journal record"
    - Sub: "engine: bin mode - resolved binary through the seam, built-in dep
      groups, concurrency"
    - Sub: "engine: reject merge (policy + chain deps, one -x argument) +
      target latest + DONE line"
    - Sub: "settlement: breaker reset + per-dir in-flight + P2 map cleared"
    - Sub: "settlement: U-sub-2 stat-based refresh re-emitted with the same
      actor"
    - Sub: "settlement: the re-entrant pass after U-sub-2 is a no-op
      (silence)"

## Fixtures

The harness world (Boot) with `Probe.Mode = "bin"`; a `proj-a` directory with a
real `registry.json` (`effectiveLatest: { leftpad: "1.0.0" }`) and the manifest
in the harness Files map; the readText probe patch records Inflight size at
read time (`Inflight.DuringRead`). The subprocess stub serves the bin-mode
engine run.

## Expected ledger strings (byte-identical)

- `governed <path> -> fresh-1` (U+2192 arrow; also asserted on the logger with
  the `hook-dsh-governor-package: ` prefix)
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, built-in default
  policy)`
- `update: mode=bin (ncu binary ncu)`
- `update: DONE - pins bumped per policy` (U+2014 dash)
- The settlement window adds exactly 5 lines over the pre-fire baseline.

## Edge cases

- The write intent's version is the fresh-stat CURRENT version (`stat-v9`,
  this mock's stat), not the observed `v1` - the sequential-fold fix.
- The re-emit after the write is a no-op (Stash pre-registration): exactly one
  write for the path.
- The final ledger window is `before + 5` - the re-entrant pass adds nothing.

## Expected count

14 PASS.
