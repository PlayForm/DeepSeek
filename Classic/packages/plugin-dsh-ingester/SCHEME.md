# SCHEME - @playform/plugin-dsh-ingester

The INGESTER: the apply direction of the batch flow. Service `ingester` on
the context. THE ONLY WRITER of the batch (the pass-on and the decision
never write).

## 1. The inputs

- `Proposal` (Interface/Proposal.ts) - the pass-on's batch contract.
- `Decision` (Interface/Decision.ts) - `{ proposal, outcome, by, at }`; the
  gate's approval. Produced by the decision workflow
  (hook-dsh-batch-decision, end-phase).

## 2. The validation (Function/Validate, before any write)

1. The decision references this proposal.
2. The outcome is `approved` (a `denied`/`expired` decision rejects).
3. The proposal is not expired.
4. The proposal carries operations.

A failed validation rejects the WHOLE run: every target reported `skipped`,
one journal line with the reason, zero writes.

## 3. The apply loop (Function/Apply, per target in proposal order)

1. **Resolve** through `ctx.fs.resolve` (the governed path resolution).
2. **Stat** - an absent target is a `conflict`.
3. **Fence** - `readText`, sha256, compare to `target.version`; a mismatch
   is a `conflict` (the stale-proposal rule, plan section 9 risk 4).
4. **Match** - every operation's `find` must still be present; a missing
   match is a `conflict`.
5. **Apply** - one version-fenced literal edit per operation
   (`ctx.fs.editText` with the version guard, in order). A racing write
   between edits fails `FS_STALE_VERSION` and lands as
   `recovery-required`.
6. **Journal** - one line per event: `{ at, event, proposal, path, detail }`
   with events `applied` / `conflict` / `recovery-required` / `rejected`.

`stopOnConflict` (default true) stops the loop at the first failed target;
otherwise the loop continues and each remaining target gets its own honest
outcome.

## 4. The output

`Result` (Interface/Result.ts): `{ proposal, perTarget[], applied,
conflicts, recovery }` - the plan's BatchResult.

## 5. The write-trust boundary

- Writes only through `ctx.fs` (the governed write path with the version
  guard); never `node:fs`, never a plugin-side write.
- The journal (`logFile`) is the plugin's own diagnostic log, appended with
  a plain `appendFileSync` (the factory's documented exemption).
- No fs/observed listener, no policy file, no waterfall involvement.

## 6. The relation to the other members

- The pass-on (plugin-dsh-pass-on) prepares the proposal; it never writes.
- The decision (hook-dsh-batch-decision) approves/denies; it never writes.
- The live view (the panel section, end-phase) reads the Result.
