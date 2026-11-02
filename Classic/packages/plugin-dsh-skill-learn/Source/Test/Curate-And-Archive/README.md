# Curate-And-Archive

This folder covers the always-on, token-free half of the curator: the deterministic transitions
R1-R10, the cutoffs and their floor, the one-transition-per-pass rule, and the archive/restore pair.

## Intent

A corpus that only ever grows is a corpus nobody loads, and ageing it needs no model's opinion. The
pass runs on the usage store alone and costs no tokens, which is why it is the default posture.

Five properties are the whole contract:

- **The order is the rule.** R1 to R6 are `continue` guards and R7 to R9 are one chain, so at most
  ONE transition happens per skill per pass. A record deep past the archive cutoff is archived
  directly, never marked stale on the way; the pin precedes the seeding, and the archive precedes
  the stale.
- **The anchor is `lastActivityAt`**, the maximum of the two activity stamps, and it deliberately
  EXCLUDES `createdAt`. A skill created today but used forty days ago is an old skill.
- **A zero-use record inside the grace floor is forced active**, and then the pass continues
  unconditionally: zero uses is absence of evidence, not proof.
- **The thresholds are floored at one day**, because a cutoff at or past now would transition the
  whole corpus on one bad config. The boundary is inclusive.
- **Archived is terminal.** No arm reaches `archived`, and only `Restore` leaves it.

The archive is a COPY plus a NEUTRALIZATION, because the harness seam has no move and no delete: the
live package keeps its bytes and gains `disable-model-invocation: true`, the archive holds a copy
under `<archiveRoot>/<name>/` (or `<name>-<YYYYMMDDHHMMSS>` on a collision), and `Restore` reads the
archived `SKILL.md`, drops the flag, and writes the live path behind a version guard. A live file
the pass did not neutralize is refused, because restoring over it would clobber bytes this pass
never took.

R2 (the referenced-elsewhere exemption) and R4 (the bundled zero-use re-anchor) have no subject in
this harness and are stated as absent in the plan rather than faked here.

## Scenario

- "R1: a pinned record is skipped entirely, seeding included" - no transition, no clock, and the
  record is still counted as examined.
- "R3: a record with no clock is seeded and does not transition" - one full window, never an age
  from the epoch.
- "R5: the anchor is the activity stamp, never `createdAt`" - a fresh creation stamp with an old use
  is archived.
- "R6: a zero-use record inside the grace floor is forced active" - a stale zero-use record comes
  back and is never archived.
- "R7: a record past the archive cutoff is archived" - the state, the stamp, the archive copy, the
  neutralized live file, and the curator's ledger row.
- "R8: a record past the stale cutoff becomes stale" - twenty days is past stale and short of
  archive.
- "R9: a stale record whose anchor moved back becomes active".
- "R10: an archived record is terminal" - no arm reaches it.
- "C1: one transition per pass - a deep record is archived, never staled first".
- "C2: the cutoffs are inclusive and the floor is one day" - exactly fourteen days is stale, and
  `staleAfterDays: 0` is one day, so an hour-old record does not move.
- "C3: a second archive of the same skill takes the stamped suffix" - the first copy is never
  overwritten, because every copy is `createIfAbsent`.
- "C4: a flat restore drops the flag, and a live file it did not neutralize is refused" - the
  second restore is `destination-exists`.

## Fixtures

The fixtures are the shared Harness: a real `Usage` store per scenario under
`<Home>/.dsh/skill-learn/<tag>/usage.json`, a fake corpus seeded with one `SKILL.md` per skill, and
the real built `Target/Function/{Curate,Archive}.js` leaves.

The clock is explicit: `Now` is a fixed instant and every stamp is derived from it with `Ago`, so no
assertion depends on wall time. The store's own writers (`Created`, `Seeded`, `Use`, `State`,
`Pinned`) build each record, which is also how the live service builds one.

## Expected ledger strings (byte-exact)

The archive row is a JSONL record rather than a log line, and this folder asserts its `action`
(`archive`) and `actor` (`curator`) rather than its formatted text; the service's log line is
`Source/Library.ts`'s.

## Expected count

12 PASS.
