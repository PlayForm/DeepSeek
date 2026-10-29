# @playform/ets-plugin-dsh-pass-on

> v0.1.0 - UNPUBLISHED - plan:
> [PASS-ON-AND-INGESTER](../../Documentation/Plans/PASS-ON-AND-INGESTER.md)

## The role

The PASS-ON (ctx.passOn) is the prepare direction of the batch flow
(Documentation/Plans/PASS-ON-AND-INGESTER.md section 3).

It is a DeepSeek Harness service that turns an intent into a batch proposal.

**READ-ONLY.**

The pass-on never writes a file.

It resolves the targets, computes the operations, renders the bounded preview, and computes the
digest.

The decision decides, and the ingester (plugin-dsh-ingester) applies.

```
Suggester / user intent -> PASS-ON (prepare) -> decision -> INGESTER (apply)
```

## The surfaces

- The service `ctx.passOn` (`Prepare`, `Get` - the table below).
- The publication channels: the `batch/proposed` bus emission and the harness agent-team inbox
  (`agent.inject`).
- READ-ONLY: no file write, no tool.

## The service surface (`ctx.passOn`)

| Method    | Signature                                             | Meaning                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Prepare` | `(intent: Intent, origin?: string): Proposal \| null` | The batch proposal: targets (path, version, why), operations, bounded preview, digest. Returns `null` when the proposal is empty or ambiguous - never an empty batch. Then PUBLISHES it: `batch/proposed` on the bus and the proposal block into the harness inbox. |
| `Get`     | `(id: string): Proposal \| null`                      | Fetch a prepared proposal (the decision's read); `null` when unknown or expired.                                                                                                                                                                                    |

## The publication (the real batch-contract wiring)

A prepared proposal is converted to the canonical batch contract (Function/Batch) and published two
ways, so it actually reaches the consumers:

1. `batch/proposed` on the bus - the decision hook logs it, and the ingester holds it;
2. the harness agent-team inbox - `agent.inject(message)` on the origin agent, carrying

    ```
    [BATCH PROPOSAL - <id>]
    <the canonical proposal JSON>
    ```

    which commits the durable `agent/inbox/spliced` event plugin-dsh-batchstate splices from.

The origin is the caller's explicit argument, else the harness initiator, else `""`.

The delivery then journals `inbox none` honestly, and the bus emission still carries the proposal.

## The batch contract (plan section 2)

The internal `Proposal` (Interface/Proposal.ts) is:
`{ id, intent: { kind, params }, targets, operations, preview, digest, revision, expiresAt, createdAt }`.

The canonical wire `Batch` (Interface/Batch.ts) is:
`{ id, intent: <label>, targets, operations, preview: { entries, changes, skipped }, digest, revision, expiresAt, origin? }`.

The digest is the fence: sha256 over the targets (path + version) and the operations (find +
replace).

The ingester applies only the proposal whose digest and versions still match.

## The configuration

| Field             | Default                                      | Meaning                                                 |
| ----------------- | -------------------------------------------- | ------------------------------------------------------- |
| `enabled`         | `true`                                       | Master switch (the patch entry ships `enabled: true`).  |
| `logFile`         | `~/.dsh/playform/ets-plugin-dsh-pass-on.log` | The durable journal (one log per module).               |
| `root`            | `process.cwd()`                              | The workspace root the globs resolve against.           |
| `maxTargets`      | `20`                                         | Maximum targets in one proposal.                        |
| `maxPreviewBytes` | `2048`                                       | Cap per preview entry.                                  |
| `expiresSeconds`  | `3600`                                       | Proposal lifetime.                                      |
| `kinds`           | 3 shipped kinds                              | The kind table: `version-bump`, `set-field`, `replace`. |
| `policy.*`        | D6 defaults                                  | The per-action allowlist (the shared factory block).    |

### The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call, and the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The pass-on is read-only, so `read` and `suggest` are automatic.

The write/commit/spawn verdicts are declared for uniformity and stay the shipped `approve`, because
the pass-on never writes, commits, or spawns.

A resolved pack's `policy` section overrides the defaults per action, and that wiring is the next
refinement.

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The abstention rule

If the proposal is empty or ambiguous, because of an unknown kind, no resolved targets, or no
effective operations, the pass-on returns no batch, not an empty one.

## The ledger

One JSONL log (`logFile`, default `~/.dsh/playform/ets-plugin-dsh-pass-on.log`): each line is

```text
{"at":<epoch ms>,"event":"prepared","proposal":<id|null>,"digest":<digest|null>,"targets":<n>,"note":<note>}
```

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

| Folder                 | What it proves                                                       | Count |
| ---------------------- | -------------------------------------------------------------------- | ----- |
| `Service-And-Contract` | the class-form contract, the disabled posture, the silence invariant | 8     |
| `Prepare-And-Ledger`   | the prepare paths, the digest, the preview, the read-only law        | 17    |
| `Batch-Proposal`       | the canonical conversion, the bus emission, the inbox delivery       | 9     |
| `Policy-Defaults`      | the D6 block's defaults and the read-only posture                    | 4     |

## The plan

- [PASS-ON-AND-INGESTER](../../Documentation/Plans/PASS-ON-AND-INGESTER.md) - section 3, the prepare
  direction (section 2, the batch contract).

## License

CC0-1.0.
