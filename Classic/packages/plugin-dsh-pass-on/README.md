# @playform/plugin-dsh-pass-on

The PASS-ON (ctx.passOn) - the prepare direction of the batch flow
(Documentation/Plans/PASS-ON-AND-INGESTER.md section 3). A DeepSeek Harness
service that turns an intent into a batch proposal.

**READ-ONLY.** The pass-on never writes a file. It resolves the targets,
computes the operations, renders the bounded preview, and computes the
digest; the decision decides; the ingester (plugin-dsh-ingester) applies.

```
Suggester / user intent -> PASS-ON (prepare) -> decision -> INGESTER (apply)
```

## The service surface (`ctx.passOn`)

| Method | Signature | Meaning |
| --- | --- | --- |
| `Prepare` | `(intent: Intent): Proposal \| null` | The batch proposal: targets (path, version, why), operations, bounded preview, digest. Returns `null` when the proposal is empty or ambiguous - never an empty batch. |
| `Get` | `(id: string): Proposal \| null` | Fetch a prepared proposal (the decision's read); `null` when unknown or expired. |

## The batch contract (plan section 2)

`Proposal` (Interface/Proposal.ts): `{ id, intent, targets, operations,
preview, digest, revision, expiresAt, createdAt }`. The digest is the fence:
sha256 over the targets (path + version) and the operations (find + replace);
the ingester applies only the proposal whose digest and versions still match.

## Config

| Field | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Master switch (the patch entry ships `enabled: true`). |
| `logFile` | `~/.dsh/pass-on/pass-on.log` | The durable journal (one log per module). |
| `root` | `process.cwd()` | The workspace root the globs resolve against. |
| `maxTargets` | `20` | Maximum targets in one proposal. |
| `maxPreviewBytes` | `2048` | Cap per preview entry. |
| `expiresSeconds` | `3600` | Proposal lifetime. |
| `kinds` | 3 shipped kinds | The kind table: `version-bump`, `set-field`, `replace`. |

## The abstention rule

If the proposal is empty or ambiguous - an unknown kind, no resolved targets,
no effective operations - the pass-on returns no batch, not an empty one.
