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

| Method  | Signature                                                   | Meaning                                                                                 |
| ------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Apply` | `(proposal: Proposal, decision: Decision): Promise<Result>` | Apply per target, in the proposal's order, version-fenced. Returns the honest `Result`. |

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

| Field            | Default                        | Meaning                                                |
| ---------------- | ------------------------------ | ------------------------------------------------------ |
| `enabled`        | `true`                         | Master switch (the patch entry ships `enabled: true`). |
| `logFile`        | `~/.dsh/ingester/ingester.log` | The durable journal (one log per module).              |
| `maxTargets`     | `20`                           | Maximum targets in one apply run.                      |
| `stopOnConflict` | `true`                         | Stop at the first conflict instead of continuing.      |
