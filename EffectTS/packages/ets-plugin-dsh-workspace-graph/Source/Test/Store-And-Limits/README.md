# Store-And-Limits

The folder states what this test verifies.

## Intent

The folder tests the store round-trip through the fake KV domain and the gate limits.

It covers acceptance checks A6 (the store round-trips, `snapshot()` returns what `indexFile` stored, and `indexRevision` increments), A7 (zero `writeText` calls), and the validation-skip rule of section 4.4.

## Scenario

- **Group: the domain open.**

    - **Check: "store: the domain opens on the fake facility and the opened line is byte-exact".**

        The declared spec is named `workspace_graph` with the `per-record` layout and the `records` table, and the logger carries `graph: domain workspace_graph opened (0 records)`.

- **Group: the round-trip (A6).**

    - **Check: "store: indexFile persists the record and the meta revision (A6)".**

        The stored record under the path key carries version `v1` and the node and edge counts that the outcome reports, and `__meta` is `{ indexRevision: 1 }`.

    - **Check: "store: snapshot returns what indexFile stored and the revision increments (A6)".**

        The nodes and edges of the snapshot deep-equal those of the stored record, the revision string is "1", and the mirror and the fake table agree.

- **Group: the revision counter.**

    - **Check: "store: the revision increments with every successful index (A6)".**

        Two indexes produce "2".

- **Group: removeFile.**

    - **Check: "store: removeFile deletes the record, bumps the revision and logs the byte-exact removed line".**

        The record is gone, the files count is 0, the revision is "2", the exact line is `graph: removed <path>`, and a second remove is a silent false.

- **Group: the invalid stored record is skipped and counted, never guessed.**

    - **Check: "store: a stored record that fails validation is skipped and counted, never guessed".**

        A seeded record without the required shape raises State.Invalid to 1, the opened line counts only the valid record (`(1 records)`), the valid record loads, and the broken one appears in no snapshot.

- **Group: the find limits and filters.**

    - **Check: "limits: find defaults to limitDefault and caps at limitMaximum".**

        With limitMaximum lowered to 2, the default request (50) and an explicit 99 both return 2, and an explicit 1 returns 1.

    - **Check: "limits: find filters by kind, name and pattern".**

        The method filters by kind, exact name, case-insensitive pattern, and the empty combination.

- **Group: the size gate and the glob gates (byte-exact skipped lines).**

    - **Check: "limits: a file above maxFileBytes is skipped with the byte-exact line".**

        The reason is `file too large (N > 5 bytes)`, and the exact `graph: skipped ...` line appears.

    - **Check: "limits: an excluded path is skipped with the byte-exact excluded line".**

        `node_modules/**` matches, and the exact line appears.

    - **Check: "limits: a file outside the include list is skipped with the byte-exact line".**

        The reason is `not included`, and the exact line appears.

- **Group: the disabled posture.**

    - **Check: "disabled: with enabled=false indexFile skips with the byte-exact disabled line".**

        The reason is `disabled`, the exact line appears, nothing is stored, and the activation line is still present.

- **Group: the A7 purity guard.**

    - **Check: "purity: the fake fs records zero writeText calls (A7)".**

        The summed `writeText` captures of every fake ctx created in this folder is zero.

## Fixtures

- **`Content(4)`.**

    The helper gives a generated four-`const` TypeScript file served under `/proj/src/store.ts`, where each line is a braceless declaration, so the file has four Symbols and no Blocks.

- **`FakeStorage` from the Harness.**

    The helper gives the map-backed KV domain attached to both storage probes (`ctx.storage.domain` and `ctx.storageDomain`), with a seed hook for the restart scenario.

- **The gate scenarios.**

    The scenarios mutate `State.Config` through the `__workspaceGraphState` probe, because the config knobs are the live state of the service.

## Expected ledger strings (byte-exact)

- `graph: domain workspace_graph opened (0 records)` / `(1 records)`.
- `graph: removed /proj/src/store.ts`.
- `graph: skipped /proj/src/store.ts (file too large (N > 5 bytes))`.
- `graph: skipped /proj/node_modules/pkg/index.ts (excluded)`.
- `graph: skipped /proj/other/thing.ts (not included)`.
- `graph: skipped /proj/src/store.ts (disabled)`.

## Edge cases

The folder counts the seeded invalid record and never guesses it, and a double remove returns false silently.

## Expected count

13 PASS.
