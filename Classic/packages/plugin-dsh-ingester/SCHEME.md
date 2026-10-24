# SCHEME - @playform/plugin-dsh-ingester

The INGESTER: the apply direction of the batch flow. Service `ingester` on the context. THE ONLY
WRITER of the batch (the pass-on and the decision never write).

## 1. The inputs

- `Proposal` (Interface/Proposal.ts) - the batch contract the apply READS: the id, the targets (the
  version fence), the operations (the literal find/replace), the expiry and the origin (the
  outcome's session).
- `Decision` (Interface/Decision.ts) - `{ proposal, outcome, by, at }`; the gate's approval.
  Produced by the decision workflow (hook-dsh-batch-decision).

## 1a. The decision consumer (the trace adapter)

The constructor registers two bus listeners (Function/Listen):

| Event            | Effect                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `batch/proposed` | the proposal is recorded (Function/Record, bounded by `maxProposals`)                                             |
| `batch/decision` | the decision is consumed (Function/Consume): the recorded proposal is resolved and applied through the same fence |

A decision for a proposal the ingester never heard is refused with its own journal line (`unknown` /
`no proposal recorded for the decision`) - never applied against a guessed proposal.

**One apply per decision**: the claim (Function/Claim) is taken synchronously, keyed by
`proposal:outcome:at`, so the same decision delivered twice (the tool's direct handoff and the
event, or two channels) applies exactly once and every caller receives the same result. A genuinely
new decision on the same proposal still runs.

`WhenIdle()` awaits every in-flight apply - the flush seam the smokes use instead of sleeping.

## 2. The validation (Function/Validate, before any write)

1. The decision references this proposal.
2. The outcome is `approved` (a `denied`/`expired` decision rejects).
3. The proposal is not expired.
4. The proposal carries operations.

A failed validation rejects the WHOLE run: every target reported `skipped`, one journal line with
the reason, zero writes.

## 3. The apply loop (Function/Apply, per target in proposal order)

1. **Resolve** through `ctx.fs.resolve` (the governed path resolution).
2. **Stat** - an absent target is a `conflict`.
3. **Fence** - `readText`, sha256, compare to `target.version`; a mismatch is a `conflict` (the
   stale-proposal rule, plan section 9 risk 4).
4. **Match** - every operation's `find` must still be present; a missing match is a `conflict`.
5. **Apply** - one version-fenced literal edit per operation (`ctx.fs.editText` with the version
   guard, in order). A racing write between edits fails `FS_STALE_VERSION` and lands as
   `recovery-required`.
6. **Journal** - one line per event: `{ at, event, proposal, path, detail }` with events `applied` /
   `conflict` / `recovery-required` / `rejected`.

`stopOnConflict` (default true) stops the loop at the first failed target; otherwise the loop
continues and each remaining target gets its own honest outcome.

## 4. The output

`Result` (Interface/Result.ts): `{ proposal, perTarget[], applied, conflicts, recovery }` - the
plan's BatchResult.

## 4a. The feedback outcome (Function/Outcome)

A batch outcome feeds the honest-feedback journal and summary (the plan's caller-side integration,
deferred there and owned here - the ingester alone knows whether the write path applied). The
feedback service (`ctx.feedback`, plugin-dsh-feedback) is probed at use time; absent is a silent
skip. The outcome vocabulary is `applied` (no conflicts, no recovery) or `rejected`; the detail is
`applied <n>, conflicts <n>, recovery <n>`; the session and the agent are the proposal's `origin`.

## 5. The write-trust boundary

- Writes only through `ctx.fs` (the governed write path with the version guard); never `node:fs`,
  never a plugin-side write.
- The journal (`logFile`) is the plugin's own diagnostic log, appended with a plain `appendFileSync`
  (the factory's documented exemption).
- No fs/observed listener, no policy file, no waterfall involvement.

### 5a. The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call; the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The ingester is the batch flow's WRITER, so `write` is its own action class - and it stays the
shipped `approve`: the decision's approval (the gate in §2) IS the gate, and the block records that
posture; the other verdicts are declared for uniformity with the family's block. A resolved pack's
`policy` section overrides the defaults per action (the wiring is the next refinement; the type
already exists in `@playform/lib-dsh-pack`). The defaults are smoke-arbitrated in
`Source/Test/Policy-Defaults`.

## 6. The relation to the other members

- The pass-on (plugin-dsh-pass-on) prepares the proposal; it never writes.
- The decision (hook-dsh-batch-decision) approves/denies; it never writes.
- The live view (the panel section, end-phase) reads the Result.
