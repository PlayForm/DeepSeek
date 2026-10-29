# @playform/ets-plugin-dsh-ingester

> v0.1.0 - UNPUBLISHED - plan:
> [PASS-ON-AND-INGESTER](../../Documentation/Plans/PASS-ON-AND-INGESTER.md)

## The role

The INGESTER (`ctx.ingester`) is the apply direction of the batch flow
(Documentation/Plans/PASS-ON-AND-INGESTER.md section 4).

It is a DeepSeek Harness service that turns an approved batch proposal into file operations.

**THE ONLY WRITER.**

The pass-on (plugin-dsh-pass-on) and the decision never write, and the ingester is the write path of
the batch through the governed filesystem (`ctx.fs`).

```
pass-on (prepare) -> decision -> INGESTER (apply, version-fenced) -> result
```

## The surfaces

- The service `ctx.ingester`, which offers `Apply`, `WhenIdle`, and `Proposals` as the table below
  describes.
- The bus registrations: `batch/proposed` records, and `batch/decision` resolves and applies.
- The governed filesystem (`ctx.fs`) writes, which make the batch flow's ONLY writer.
- No tool.

## The service surface (`ctx.ingester`)

| Method      | Signature                                                   | Meaning                                                                                 |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Apply`     | `(proposal: Proposal, decision: Decision): Promise<Result>` | Apply per target, in the proposal's order, version-fenced. Returns the honest `Result`. |
| `WhenIdle`  | `(): Promise<void>`                                         | Await every in-flight apply (the flush seam: no sleeps in the smokes).                  |
| `Proposals` | `(): Proposal[]`                                            | The proposals recorded from `batch/proposed` (the decision consumer's read).            |

## The decision consumer (the trace adapter)

The constructor registers on the bus, where `batch/proposed` records the proposal within the
`maxProposals` bound and `batch/decision` resolves it and applies it through the same content fence,
so an approved batch applies with no caller wiring at all.

A decision for an unrecorded proposal is refused with `unknown` and
`no proposal recorded for the decision`.

**One apply per decision**, because the claim is taken synchronously and keyed by
`proposal:outcome:at`, so the same decision delivered twice, through the handoff of the tool and
through the event, applies exactly once.

## The feedback outcome

After an apply, the ingester reports the outcome to `ctx.feedback` when that service is present,
with `applied` or `rejected`, with `applied <n>, conflicts <n>, recovery <n>` as the detail, and
with the `origin` of the proposal as the session, which is the caller-side orchestration integration
of the plan.

## The validation (before any write)

The decision references this proposal, the outcome is `approved`, the proposal is not expired, and
the proposal carries operations.

Anything else rejects the whole run and reports every target as `skipped`.

## The version fence

Each target carries the sha256 of its content at prepare time.

Before applying, the ingester hashes the current content and compares the result, so a mismatch is a
**conflict** and not a silent overwrite, which covers a target that someone edited between the
preview and the apply.

Each operation is then applied as a version-fenced literal edit through `ctx.fs.editText` with the
version guard, so a racing write between edits fails `FS_STALE_VERSION` and lands as
`recovery-required`.

## The failure rule

A conflict or a write failure stops at that target when `stopOnConflict` is true, which is the
default, and reports `conflict` or `recovery-required`, while the applied targets are reported
honestly with no invisible intermediate state.

## The ledger

The plugin writes one JSONL log at `logFile`, by default
`~/.dsh/playform/ets-plugin-dsh-ingester.log`, and each line is

```text
{"at":<epoch ms>,"event":<event>,"proposal":<id>,"path":<path>,"detail":<detail>}
```

## The configuration

| Field            | Default                                       | Meaning                                                            |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `enabled`        | `true`                                        | Master switch (the patch entry ships `enabled: true`).             |
| `logFile`        | `~/.dsh/playform/ets-plugin-dsh-ingester.log` | The durable journal (one log per module).                          |
| `maxTargets`     | `20`                                          | Maximum targets in one apply run.                                  |
| `stopOnConflict` | `true`                                        | Stop at the first conflict instead of continuing.                  |
| `maxProposals`   | `16`                                          | The recorded-proposal ring bound (the decision consumer's memory). |
| `policy.*`       | D6 defaults                                   | The per-action allowlist (the shared factory block).               |

### The policy block (D6)

The schema composes the shared block of the factory, `policy: Policy()`, into the `Schema.object`
call of the plugin, and the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The ingester is the writer of the batch flow, so `write` is its own action class, and that class
stays the shipped `approve` because the approval of the decision, which the validation above
describes, IS the gate and the block records that posture, while the other verdicts are declared for
uniformity.

The `policy` section of a resolved pack overrides the defaults per action, and that wiring is the
next refinement.

`Source/Test/Policy-Defaults` arbitrates the defaults in the smoke suite.

## The build and the tests

The build is `pnpm prepublishOnly` from Source/prepublishOnly.sh, which runs the plugin build with
the ESM `Target/` and the Test tree excluded, the Test build, the harness selfcheck, and the Test
type-check.

| Folder               | What it proves                                                    | Count |
| -------------------- | ----------------------------------------------------------------- | ----- |
| `Loader-And-Journal` | the class contract, the pre-apply validation, the rejection lines | 10    |
| `Apply-And-Fences`   | the version fence, the honest failure modes, the journal          | 11    |
| `Decision-Consumer`  | the bus consumer, the one-apply claim, the feedback outcome       | 8     |
| `Policy-Defaults`    | the D6 block's defaults and the writer's `approve` posture        | 4     |

## The plan

- [PASS-ON-AND-INGESTER](../../Documentation/Plans/PASS-ON-AND-INGESTER.md) covers section 4, the
  apply direction.

## License

CC0-1.0.
