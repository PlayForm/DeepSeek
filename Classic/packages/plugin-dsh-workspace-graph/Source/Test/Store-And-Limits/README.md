# Store-And-Limits

What this test verifies.

## Intent

The store round-trip through the fake KV domain and the gate limits. Covers
acceptance checks A6 (the store round-trips; `snapshot()` returns what
`indexFile` stored; `indexRevision` increments), A7 (zero `writeText` calls),
and the validation-skip rule of section 4.4.

## Scenario

- Group: the domain open.
    - Check: "store: the domain opens on the fake facility and the opened
      line is byte-exact" - the declared spec is named `workspace_graph` with
      the `per-record` layout and the `records` table; the logger carries
      `graph: domain workspace_graph opened (0 records)`.
- Group: the round-trip (A6).
    - Check: "store: indexFile persists the record and the meta revision
      (A6)" - the stored record under the path key carries version `v1`, the
      node and edge counts the outcome reports, and `__meta` is
      `{ indexRevision: 1 }`.
    - Check: "store: snapshot returns what indexFile stored and the revision
      increments (A6)" - the snapshot's nodes and edges deep-equal the stored
      record's, the revision string is "1", and the mirror and the fake table
      agree.
- Group: the revision counter.
    - Check: "store: the revision increments with every successful index
      (A6)" - two indexes produce "2".
- Group: removeFile.
    - Check: "store: removeFile deletes the record, bumps the revision and
      logs the byte-exact removed line" - the record is gone, files count 0,
      revision "2", the exact `graph: removed <path>` line, and a second
      remove is a silent false.
- Group: the invalid stored record is skipped and counted, never guessed.
    - Check: "store: a stored record that fails validation is skipped and
      counted, never guessed" - a seeded record without the required shape
      raises State.Invalid to 1, the opened line counts only the valid record
      (`(1 records)`), the valid record loads, and the broken one appears in
      no snapshot.
- Group: the find limits and filters.
    - Check: "limits: find defaults to limitDefault and caps at
      limitMaximum" - with limitMaximum lowered to 2, the default request
      (50) and an explicit 99 both return 2, an explicit 1 returns 1.
    - Check: "limits: find filters by kind, name and pattern" - kind, exact
      name, case-insensitive pattern, and the empty combination.
- Group: the size gate and the glob gates (byte-exact skipped lines).
    - Check: "limits: a file above maxFileBytes is skipped with the
      byte-exact line" - reason `file too large (N > 5 bytes)` and the exact
      `graph: skipped ...` line.
    - Check: "limits: an excluded path is skipped with the byte-exact
      excluded line" - `node_modules/**` matches; the exact line.
    - Check: "limits: a file outside the include list is skipped with the
      byte-exact line" - reason `not included`; the exact line.
- Group: the disabled posture.
    - Check: "disabled: with enabled=false indexFile skips with the byte-exact
      disabled line" - reason `disabled`, the exact line, nothing stored, and
      the activation line still present.
- Group: the A7 purity guard.
    - Check: "purity: the fake fs records zero writeText calls (A7)" - the
      summed `writeText` captures of every fake ctx created in this folder is
      zero.

## Fixtures

- `Content(4)`: a generated four-`const` TypeScript file served under
  `/proj/src/store.ts` (each line a braceless declaration, so four Symbols,
  no Blocks).
- `FakeStorage` from the Harness: the map-backed KV domain attached to both
  storage probes (`ctx.storage.domain` and `ctx.storageDomain`), with a seed
  hook for the restart scenario.
- The gate scenarios mutate `State.Config` through the
  `__workspaceGraphState` probe (the config knobs are the service's live
  state).

## Expected ledger strings (byte-exact)

- `graph: domain workspace_graph opened (0 records)` / `(1 records)`.
- `graph: removed /proj/src/store.ts`.
- `graph: skipped /proj/src/store.ts (file too large (N > 5 bytes))`.
- `graph: skipped /proj/node_modules/pkg/index.ts (excluded)`.
- `graph: skipped /proj/other/thing.ts (not included)`.
- `graph: skipped /proj/src/store.ts (disabled)`.

## Edge cases

- The seeded invalid record is counted, never guessed; a double remove
  returns false silently.

## Expected count

13 PASS.
