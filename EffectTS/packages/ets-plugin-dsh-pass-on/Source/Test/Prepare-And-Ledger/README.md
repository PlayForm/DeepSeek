# Prepare-And-Ledger - the prepare paths and the journal

This folder covers the prepare direction: the explicit-target version bump with the byte-exact target/operation/digest shapes, the Get read and the expiry, the null paths, the glob walk with its exclusions and cap, the bounded preview, the replace kind, the determinism, and the read-only law.

## Scenarios

- P1: the target carries the exact path, the content-hash version token
  (recomputed in the test with the plugin's own hashing), and the why; the
  operation is the exact find/replace; the digest is the plugin's own
  sha256 over targets and operations; the id is the digest prefix; the
  intent/revision/timestamps are stamped.
- P2: the journal line is the exact JSON line with the plugin's field
  order (`at`, `event`, `proposal`, `digest`, `targets`, `note`).
- P3: `Get` returns the stored proposal; an expired proposal reads as
  null, never resurrected.
- P4: the null paths - an already-applied version, an unknown kind, a kind
  with no resolvable targets, a null intent - each journaled with its
  refusal note.
- P5: the replace kind produces the literal find/replace with the byte
  count in the why.
- P6: the glob walk finds the workspace packages, skips `node_modules`,
  and is capped at `maxTargets`.
- P7: the preview is the matched region (not the whole file) capped at
  `maxPreviewBytes` with the `... [capped]` marker on both sides.
- P8: preparing the same intent twice yields the same id (the content
  never changed, so the digest is stable).
- P9: the READ-ONLY law - the target file is untouched; the only file the
  plugin writes is its own journal.

## Fixtures

The harness is the shared Harness, with a fresh temporary directory per folder process and fixture files seeded into it.

It uses the real built Target, including the Digest module recomputed for the byte-exact digest assertions.

## Expected journal strings (byte-exact, JSON lines)

The shapes match Service-And-Contract.

## Expected count

17 PASS.
