# Rename-And-Replace - the rename and the replace tests

The folder tests the scope-honest rename, the whole-word rule, the span forms and guards of the replace, the applied write through the REAL factory `GuardedWrite` with the version fence, and the honest outcomes of the reply union.

## Scenarios

- **R1.**

    A block-scope rename applies only inside the span, carries the new version ("2") in the reply, and logs the byte-exact `rename /repo/a.ts alpha -> delta (applied)` line in the logger AND the durable file.

- **R2.**

    A `scope: "file"` rename applies to every whole-word occurrence and ONLY to whole words, so `alphaBeta` is never touched.

- **R3.**

    The rejections are zero occurrences (`no occurrences in scope`, zero writes), a no-op rename, an incomplete identity, a non-integral span, and a missing file (`not an observed file`, never a fabricated read).

- **R4.**

    The size and span guards reject a file larger than `maxFileBytes` before any read (`file too large`), and they reject a span wider than `maxBlockLines` (`span too large`) with zero writes.

- **P1.**

    A replace swaps the lines of the span exactly and logs the byte-exact `replace /repo/a.ts lines 2-2 (applied)` line, and an empty text deletes the span.

- **P2.**

    The plugin rejects a span outside the file and a span wider than `maxBlockLines`.

- **X1.**

    In the version fence a file whose version moved between the observe and the write yields a `conflict` reply and the byte-exact `conflict /repo/a.ts (expected 7)` line, and the file is NOT overwritten.

- **X2.**

    An unclassifiable write failure maps to `outcome-unknown` with the byte-exact `failed /repo/a.ts (raid array on fire)` line.

- **X3.**

    The cold mount denies every op (`denied (enabled=false)`) with zero writes.

## Fixtures

The shared Harness supplies the WORKING fake fs: the write path runs through the REAL factory `GuardedWrite` (the replaceIfVersion intent, the P4 fence), and the fake fs implements the version fence, so the real code produces conflict and applied and no mock does.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`rename <path> <old> -> <new> (applied)`, `replace <path> lines <s>-<e>
(applied)`, `rejected <path> (<reason>)`, `conflict <path> (expected
<version>)`, `failed <path> (<detail>)`, `denied (enabled=false)`.

## Expected count

19 PASS.
