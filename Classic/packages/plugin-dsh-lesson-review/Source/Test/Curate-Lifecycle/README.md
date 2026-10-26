# Curate-Lifecycle

The always-on, token-free half: staleness, archival, the four protections, and
the restore path.

## Intent

The deterministic pass is what keeps the corpus loadable, and it is the default
posture precisely because it costs nothing. Its protections are the whole
contract: a pinned entry does not move, only `createdBy: agent` entries are in
its jurisdiction (telemetry cannot establish authorship, so the policy flag
decides), a zero-use entry gets a grace floor, and an archive is a RENAME into
`.archive/` - its own undo through `Restore`.

## Scenario

- "C1: an idle agent-created entry goes stale" - twenty days past a fourteen-day
  line.
- "C2: a long-idle entry is archived AND its directory moves" - forty days; the
  directory leaves the corpus and lands under `.archive/`.
- "C3: a pinned entry never moves".
- "C4: a user-created entry is out of the lifecycle's jurisdiction".
- "C5: a zero-use entry keeps its grace floor" - five days old with
  `archiveAfterDays: 3` goes stale, never archived, because it is younger than
  `neverUsedGraceDays`.
- "C6: Restore brings an archived skill back and reactivates it".
- "C7: a disabled service curates nothing".
- "C8: the curation line is byte-exact".

## Fixtures

The shared Harness. The usage sidecar is written to `<Home>/.dsh/lesson/usage.json`
BEFORE the construction, so the service's detached load is the real one, and
`Flush()` is awaited before every assertion - no sleep, no polling.

## Expected ledger strings (byte-exact)

- `lesson: stale <name>`
- `lesson: curated <s> stale, <a> archived`
- `lesson: archived <name> -> <path>`
- `lesson: archive failed for <name> (<reason>); kept stale`
- `lesson: restored <name>`

## Expected count

8 PASS.
