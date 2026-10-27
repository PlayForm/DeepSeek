# SCHEME - @playform/plugin-dsh-ingester

The INGESTER is the apply direction of the batch flow and provides the service `ingester` on the
context, as THE ONLY WRITER of the batch, because the pass-on and the decision never write.

## 1. The inputs

- `Proposal` (Interface/Proposal.ts) is the batch contract that the apply READS: the id, the targets
  with their version fence, the operations with their literal find/replace, the expiry, and the
  origin that becomes the session of the outcome.
- `Decision` (Interface/Decision.ts) is `{ proposal, outcome, by, at }`, the approval of the gate,
  and the decision workflow (hook-dsh-batch-decision) produces it.

## 1a. The decision consumer (the trace adapter)

The constructor registers two bus listeners in Function/Listen:

| Event            | Effect                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `batch/proposed` | the proposal is recorded (Function/Record, bounded by `maxProposals`)                                             |
| `batch/decision` | the decision is consumed (Function/Consume): the recorded proposal is resolved and applied through the same fence |

A decision for a proposal that the ingester never heard is refused with its own journal line
(`unknown` and `no proposal recorded for the decision`) and is never applied against a guessed
proposal.

**One apply per decision**, because the claim in Function/Claim is taken synchronously and keyed by
`proposal:outcome:at`, so the same decision delivered twice, through the direct handoff of the tool
and the event or through two channels, applies exactly once and every caller receives the same
result, while a genuinely new decision on the same proposal still runs.

`WhenIdle()` awaits every in-flight apply, which is the flush seam that the smokes use instead of
sleeping.

## 2. The validation (Function/Validate, before any write)

1. **The decision.**

    The decision references this proposal.

2. **The outcome.**

    The outcome is `approved`, so a `denied` or `expired` decision rejects.

3. **The expiry.**

    The proposal is not expired.

4. **The operations.**

    The proposal carries operations.

A failed validation rejects the WHOLE run, so every target is reported `skipped`, one journal line
carries the reason, and zero writes happen.

## 3. The apply loop (Function/Apply, per target in proposal order)

1. **The resolution.**

    The resolution goes through `ctx.fs.resolve`, the governed path resolution.

2. **The stat.**

    An absent target is a `conflict`.

3. **The fence.**

    The fence calls `readText`, hashes with sha256, and compares the result to `target.version`, so
    a mismatch is a `conflict` under the stale-proposal rule of plan section 9 risk 4.

4. **The match.**

    Every `find` of every operation must still be present, and a missing match is a `conflict`.

5. **The apply.**

    The apply runs one version-fenced literal edit per operation through `ctx.fs.editText` with the
    version guard, in order, and a racing write between edits fails `FS_STALE_VERSION` and lands as
    `recovery-required`.

6. **The journal.**

    The journal writes one line per event, `{ at, event, proposal, path, detail }`, with the events
    `applied`, `conflict`, `recovery-required`, and `rejected`.

`stopOnConflict`, true by default, stops the loop at the first failed target, and otherwise the loop
continues and each remaining target gets its own honest outcome.

## 4. The output

`Result` (Interface/Result.ts) is `{ proposal, perTarget[], applied, conflicts, recovery }`, which
is the BatchResult of the plan.

## 4a. The feedback outcome (Function/Outcome)

A batch outcome feeds the honest-feedback journal and summary, which is the caller-side integration
that the plan defers and this member owns, because the ingester alone knows whether the write path
applied.

The feedback service `ctx.feedback` (plugin-dsh-feedback) is probed at use time, and an absent
service is a silent skip.

The outcome vocabulary is `applied` for no conflicts and no recovery, or `rejected`, the detail is
`applied <n>, conflicts <n>, recovery <n>`, and the session and the agent come from the `origin` of
the proposal.

## 5. The write-trust boundary

- The plugin writes only through `ctx.fs`, the governed write path with the version guard, and never
  through `node:fs` and never through a plugin-side write.
- The journal at `logFile` is the diagnostic log of the plugin itself, appended with a plain
  `appendFileSync`, which is the documented exemption of the factory.
- No fs/observed listener exists, no policy file is read, and no waterfall is involved.

### 5a. The policy block (D6)

The schema composes the shared block of the factory, `policy: Policy()`, into the `Schema.object`
call of the plugin, and the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The ingester is the WRITER of the batch flow, so `write` is its own action class, and that class
stays the shipped `approve` because the approval of the decision, which is the gate in §2, IS the
gate and the block records that posture, while the other verdicts are declared for uniformity with
the block of the family.

The `policy` section of a resolved pack overrides the defaults per action, that wiring is the next
refinement, and the type already exists in `@playform/lib-dsh-pack`.

`Source/Test/Policy-Defaults` arbitrates the defaults in the smoke suite.

## 6. The relation to the other members

- The pass-on (plugin-dsh-pass-on) prepares the proposal and never writes.
- The decision (hook-dsh-batch-decision) approves or denies and never writes.
- The live view in the panel section of the end phase reads the Result.
