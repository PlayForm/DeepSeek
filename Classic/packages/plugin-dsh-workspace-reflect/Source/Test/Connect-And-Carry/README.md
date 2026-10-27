# Connect-And-Carry - the connect op and the reflective carry tests

The test covers the one-call connect (import insertion, comment form, idempotence) and the graph carry (absent, present, failing).

## Scenarios

- C1: a connect with a symbol inserts `import { Beta } from "./beta.ts";` at the top and logs the byte-exact `connect /repo/src/a.ts -> /repo/src/beta.ts (applied)` line.
- C2: without a symbol the op inserts a `// connect: <to>` comment, and the specifier is relative to the directory of the from-file.
- C3: an already-connected from-file is rejected (`already connected`) with zero writes and never a duplicated import.
- C4: an incomplete identity is rejected with the byte-exact `rejected  (connect identity incomplete)` line.
- K1: an absent graph is a silent skip, so the write still applies and no `carried` line appears.
- K2: a present graph reindexes the changed file (the call lands with the exact path) and the byte-exact `carried /repo/src/a.ts (graph reindexed)` line appears.
- K3: a graph failure is swallowed after one byte-exact `failed /repo/src/a.ts (carry: graph offline)` line, so the applied write is never undone.

## Fixtures

The shared Harness supplies the WORKING fake fs and the `Graph` helper, a capturing handle attached through the pre-apply hook and read by Carry through ctx.get, never through inject.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`connect <from> -> <to> (applied)`, `rejected  (connect identity
incomplete)`, `rejected <from> (already connected)`, `carried <path>
(graph reindexed)`, `failed <path> (carry: <reason>)`.

## Expected count

9 PASS.
