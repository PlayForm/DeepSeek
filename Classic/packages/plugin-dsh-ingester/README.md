# @playform/plugin-dsh-ingester

The INGESTER (ctx.ingester) - the apply direction of the batch flow
(Documentation/Plans/PASS-ON-AND-INGESTER.md section 4). A DeepSeek Harness service that turns an
approved batch proposal into file operations.

**THE ONLY WRITER.** The pass-on (plugin-dsh-pass-on) and the decision never write; the ingester is
the batch's write path, through the governed filesystem (`ctx.fs`).

```
pass-on (prepare) -> decision -> INGESTER (apply, version-fenced) -> result
```

## The service surface (`ctx.ingester`)

| Method      | Signature                                                   | Meaning                                                                                 |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Apply`     | `(proposal: Proposal, decision: Decision): Promise<Result>` | Apply per target, in the proposal's order, version-fenced. Returns the honest `Result`. |
| `WhenIdle`  | `(): Promise<void>`                                         | Await every in-flight apply (the flush seam: no sleeps in the smokes).                  |
| `Proposals` | `(): Proposal[]`                                            | The proposals recorded from `batch/proposed` (the decision consumer's read).            |

## The decision consumer (the trace adapter)

The constructor registers on the bus: `batch/proposed` records the proposal (bounded by
`maxProposals`), `batch/decision` resolves it and applies it through the same content fence - so an
approved batch applies with no caller wiring at all. A decision for an unrecorded proposal is
refused (`unknown` / `no proposal recorded for the decision`).

**One apply per decision**: the claim is taken synchronously, keyed by `proposal:outcome:at`, so the
same decision delivered twice (the tool's handoff and the event) applies exactly once.

## The feedback outcome

After an apply, the ingester reports the outcome to `ctx.feedback` (when present): `applied` or
`rejected`, with `applied <n>, conflicts <n>, recovery <n>` as the detail and the proposal's
`origin` as the session - the plan's caller-side orchestration integration.

## The validation (before any write)

The decision references this proposal; the outcome is `approved`; the proposal is not expired; the
proposal carries operations. Anything else rejects the whole run with every target reported as
`skipped`.

## The version fence

Each target carries the sha256 of its content at prepare time. Before applying, the current content
is hashed and compared: a mismatch is a **conflict**, not a silent overwrite (a target edited
between the preview and the apply). Each operation is then applied as a version-fenced literal edit
(`ctx.fs.editText` with the version guard), so a racing write between edits fails `FS_STALE_VERSION`
and lands as `recovery-required`.

## The failure rule

A conflict or a write failure stops at that target (when `stopOnConflict`, default true) and reports
`conflict` / `recovery-required`; the applied targets are reported honestly - no invisible
intermediate state.

## Config

| Field            | Default                                   | Meaning                                                            |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `enabled`        | `true`                                    | Master switch (the patch entry ships `enabled: true`).             |
| `logFile`        | `~/.dsh/playform/plugin-dsh-ingester.log` | The durable journal (one log per module).                          |
| `maxTargets`     | `20`                                      | Maximum targets in one apply run.                                  |
| `stopOnConflict` | `true`                                    | Stop at the first conflict instead of continuing.                  |
| `maxProposals`   | `16`                                      | The recorded-proposal ring bound (the decision consumer's memory). |
| `policy.*`       | D6 defaults                               | The per-action allowlist (the shared factory block).               |

### The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call; the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The ingester is the batch flow's writer, so `write` is its own action class - and it stays the
shipped `approve`: the decision's approval (the validation above) IS the gate, and the block records
that posture; the other verdicts are declared for uniformity. A resolved pack's `policy` section
overrides the defaults per action (the wiring is the next refinement). The defaults are
smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The smokes

| Folder               | What it proves                                                    | Count |
| -------------------- | ----------------------------------------------------------------- | ----- |
| `Loader-And-Journal` | the class contract, the pre-apply validation, the rejection lines | 10    |
| `Apply-And-Fences`   | the version fence, the honest failure modes, the journal          | 11    |
| `Decision-Consumer`  | the bus consumer, the one-apply claim, the feedback outcome       | 8     |
| `Policy-Defaults`    | the D6 block's defaults and the writer's `approve` posture        | 4     |
