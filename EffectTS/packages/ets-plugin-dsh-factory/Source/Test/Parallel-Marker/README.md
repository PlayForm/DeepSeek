# Parallel-Marker

What this test verifies.

## Intent

The ETS tree's #14 additive coverage: the `{ steps, parallel }` object form of
the direct-govern selection, alongside the legacy boolean/string/array
selections. The inner selection resolves exactly as before; `parallel: true`
switches the fold's concurrency to unbounded (`Effect.all`, fiber scheduling).
Sequential remains the DEFAULT (the live-verified race fix - unchanged), which
its own group asserts on the same marker form WITHOUT the flag. The marker's
documented SAFETY CONDITION is disjoint targets only - same-file steps race -
so this folder exercises only DISJOINT-safe steps (each step's effects land on
its OWN file) and asserts the marker semantics plus the containment
invariants; the conflicting same-file race outcomes are deliberately NOT
asserted. This folder is ETS-only: the Classic factory suite has no parallel
section, so there is no Classic twin (the parity diff intentionally adds this
folder).

## Scenario

- Group: 18a - the marker is ACCEPTED and the steps ALL run and complete.
    - Check: "#14 parallel: the `{ steps, parallel }` marker is accepted and
      both disjoint-safe steps run and settle" - the governed call resolves
      without rejection and both steps' files are written.
- Group: 18b - REAL overlap (unbounded concurrency, not just acceptance).
    - Check: "#14 parallel: real unbounded overlap - both steps started
      before either finished" - both `:start` markers precede the first
      `:done` (the sequential start/finish pattern could never interleave
      like this); both steps settled again.
- Group: 18c - the INNER SELECTION still applies in parallel mode.
    - Check: "#14 parallel: the inner selection still applies - array and
      single-name forms run only the selected steps" - the array form runs
      only par-a (the unselected step's effect is absent), the single-name
      form runs exactly par-b's start/done pair.
- Group: 18d - the OBJECT FORM DEFAULT is SEQUENTIAL.
    - Check: "#14 parallel: the object form WITHOUT the marker keeps the
      sequential fold (each step completes before the next starts)" - the
      event order is a:start, a:done, b:start, b:done; both steps settled.
- Group: 18e - CONTAINMENT in parallel mode.
    - Check: "#14 parallel: containment - a throwing step never propagates
      and the other step still runs and settles".
- Group: 18f - `steps: true` / `"all"` inside the marker.
    - Check: "#14 parallel: `steps: true` / `steps: 'all'` run every
      registered step, the throwing one contained" - all three registered
      steps' effects settle; the throwing par-boom is contained.
- Group: 18g - the no-op inner selections stay no-ops in the marker form.
    - Check: "#14 parallel: false/null/undefined inner selections stay no-ops
      in the marker form".

## Fixtures

- The Harness fake ctx + a DEDICATED factory instance (`factoryP`) - the
  parallel steps are registered on its own GovernSteps registry, disjoint
  from every other folder's registry.
- A `proj-parallel` directory with three disjoint step files
  (`parallel-a.txt`, `parallel-b.txt`, `parallel-c.txt`); each step records
  `name:start`, waits its delay, writes its OWN file with plain fs, records
  `name:done`.
- The delays (25/15/10 ms) are what make the unbounded-overlap group
  distinguishable from a sequential fold.

## Expected ledger strings (byte-exact)

None - the marker groups assert event sequences and settled files, not ledger
lines (the governed steps write directly, not through the factory's Append).

## Edge cases

- The throwing par-boom step: contained in both modes.
- The unselected step's effect is ABSENT (its file removed before the call
  and not recreated).
- false/null/undefined inner selections remain no-ops inside the marker form.
- Sequential (the default) is re-asserted on the object form without the
  flag.

## Expected count

7 PASS.
