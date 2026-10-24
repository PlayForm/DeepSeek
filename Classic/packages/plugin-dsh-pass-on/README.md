# @playform/plugin-dsh-pass-on

The PASS-ON (ctx.passOn) - the prepare direction of the batch flow
(Documentation/Plans/PASS-ON-AND-INGESTER.md section 3). A DeepSeek Harness service that turns an
intent into a batch proposal.

**READ-ONLY.** The pass-on never writes a file. It resolves the targets, computes the operations,
renders the bounded preview, and computes the digest; the decision decides; the ingester
(plugin-dsh-ingester) applies.

```
Suggester / user intent -> PASS-ON (prepare) -> decision -> INGESTER (apply)
```

## The service surface (`ctx.passOn`)

| Method    | Signature                                             | Meaning                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Prepare` | `(intent: Intent, origin?: string): Proposal \| null` | The batch proposal: targets (path, version, why), operations, bounded preview, digest. Returns `null` when the proposal is empty or ambiguous - never an empty batch. Then PUBLISHES it: `batch/proposed` on the bus and the proposal block into the harness inbox. |
| `Get`     | `(id: string): Proposal \| null`                      | Fetch a prepared proposal (the decision's read); `null` when unknown or expired.                                                                                                                                                                                    |

## The publication (the real batch-contract wiring)

A prepared proposal is converted to the canonical batch contract (Function/Batch) and published two
ways, so it actually reaches the consumers:

1. `batch/proposed` on the bus - the decision hook records it, the ingester holds it;
2. the harness agent-team inbox - `agent.inject(message)` on the origin agent, carrying

    ```
    [BATCH PROPOSAL - <id>]
    <the canonical proposal JSON>
    ```

    which commits the durable `agent/inbox/spliced` event plugin-dsh-batchstate splices from.

The origin is the caller's explicit argument, else the harness initiator, else `""` (the delivery
then journals `inbox none` honestly - the bus emission still carries the proposal).

## The batch contract (plan section 2)

The internal `Proposal` (Interface/Proposal.ts):
`{ id, intent: { kind, params }, targets, operations, preview, digest, revision, expiresAt, createdAt }`;
the canonical wire `Batch` (Interface/Batch.ts):
`{ id, intent: <label>, targets, operations, preview: { entries, changes, skipped }, digest, revision, expiresAt, origin? }`.
The digest is the fence: sha256 over the targets (path + version) and the operations (find +
replace); the ingester applies only the proposal whose digest and versions still match.

## Config

| Field             | Default                                  | Meaning                                                 |
| ----------------- | ---------------------------------------- | ------------------------------------------------------- |
| `enabled`         | `true`                                   | Master switch (the patch entry ships `enabled: true`).  |
| `logFile`         | `~/.dsh/playform/plugin-dsh-pass-on.log` | The durable journal (one log per module).               |
| `root`            | `process.cwd()`                          | The workspace root the globs resolve against.           |
| `maxTargets`      | `20`                                     | Maximum targets in one proposal.                        |
| `maxPreviewBytes` | `2048`                                   | Cap per preview entry.                                  |
| `expiresSeconds`  | `3600`                                   | Proposal lifetime.                                      |
| `kinds`           | 3 shipped kinds                          | The kind table: `version-bump`, `set-field`, `replace`. |
| `policy.*`        | D6 defaults                              | The per-action allowlist (the shared factory block).    |

### The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call; the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The pass-on is read-only - `read` and `suggest` are automatic; the write/commit/spawn verdicts are
declared for uniformity and stay the shipped `approve` (the pass-on never writes, commits or
spawns). A resolved pack's `policy` section overrides the defaults per action (the wiring is the
next refinement). The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The abstention rule

If the proposal is empty or ambiguous - an unknown kind, no resolved targets, no effective
operations - the pass-on returns no batch, not an empty one.

## The smokes

| Folder                 | What it proves                                                       | Count |
| ---------------------- | -------------------------------------------------------------------- | ----- |
| `Service-And-Contract` | the class-form contract, the disabled posture, the silence invariant | 8     |
| `Prepare-And-Ledger`   | the prepare paths, the digest, the preview, the read-only law        | 17    |
| `Batch-Proposal`       | the canonical conversion, the bus emission, the inbox delivery       | 9     |
| `Policy-Defaults`      | the D6 block's defaults and the read-only posture                    | 4     |
