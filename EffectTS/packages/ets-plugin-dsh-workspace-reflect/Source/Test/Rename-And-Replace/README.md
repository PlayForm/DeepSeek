# Rename-And-Replace - the rename and the replace tests

The scope-honest rename, the whole-word rule, the replace span forms and
guards, the applied write through the REAL factory `GuardedWrite` with the
version fence, and the reply union's honest outcomes.

## Scenarios

- R1: a block-scope rename applies only inside the span, carries the new
  version ("2") in the reply, and logs the byte-exact
  `rename /repo/a.ts alpha -> delta (applied)` line in the logger AND the
  durable file.
- R2: a `scope: "file"` rename applies to every whole-word occurrence -
  and ONLY whole words (`alphaBeta` is never touched).
- R3: the rejections - zero occurrences (`no occurrences in scope`, zero
  writes), a no-op rename, an incomplete identity, a non-integral span, and
  a missing file (`not an observed file`, never a fabricated read).
- R4: the size and span guards - a file larger than `maxFileBytes` is
  rejected before any read (`file too large`); a span wider than
  `maxBlockLines` is rejected (`span too large`) with zero writes.
- P1: a replace swaps the span's lines exactly and logs the byte-exact
  `replace /repo/a.ts lines 2-2 (applied)` line; an empty text deletes the
  span.
- P2: a span outside the file and a span wider than `maxBlockLines` are
  each rejected.
- X1: the version fence - a file whose version moved between the observe
  and the write yields a `conflict` reply and the byte-exact
  `conflict /repo/a.ts (expected 7)` line; the file is NOT overwritten.
- X2: an unclassifiable write failure maps to `outcome-unknown` with the
  byte-exact `failed /repo/a.ts (raid array on fire)` line.
- X3: the cold mount denies every op (`denied (enabled=false)`) with zero
  writes.

## Fixtures

The shared Harness with the WORKING fake fs: the write path runs through
the REAL factory `GuardedWrite` (the replaceIfVersion intent, the P4
fence), and the fake fs implements the version fence so conflict/applied
are produced by real code, not a mock.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`rename <path> <old> -> <new> (applied)`, `replace <path> lines <s>-<e>
(applied)`, `rejected <path> (<reason>)`, `conflict <path> (expected
<version>)`, `failed <path> (<detail>)`, `denied (enabled=false)`.

## Expected count

19 PASS.
