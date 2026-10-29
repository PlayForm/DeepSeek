# @playform/ets-plugin-dsh-lesson-review

The post-turn self-improvement review, as a service.

**Plugin @ DSH @ Review @ Lesson.**

The service owns the nudge counter, the bounded digest, the review prompt, the strict reply parse,
the deterministic acceptance judge, the guarded corpus write, the usage store, and the
staleness/archive pass.

It does not own the trigger, because `@playform/ets-hook-dsh-lesson-nudge` calls it from the idle
phase of the agent.

## What it does

One review is one bounded round trip:

1. **The digest.**

    The review digests the conversation snapshot, with a verbatim tail, older turns collapsed, and a
    hard character cap applied from the front.

2. **The ask.**

    The review asks the review model once with a constant prompt that states what a skill is, which
    of the two stores a lesson belongs in, which operations exist, and what must never be captured.

3. **The parse.**

    The review parses the reply strictly as one JSON object with five operation kinds.

4. **The judge.**

    The review judges every operation against deterministic rules: class-level name, no incident
    narration, no bare negative claim, read-before-write, and pins.

5. **The apply or queue.**

    The review applies or queues the operation, and the shipped `policy.write: approve` means QUEUE,
    so nothing reaches the corpus until someone accepts it.

6. **The report.**

    The review reports the run in `run.json` and `REPORT.md`, and it writes one ledger line.

## The posture: propose, never publish

The corpus is the working memory of the user.

A review that writes to it unasked is worse than no review, so:

- `policy.write` ships `approve` → accepted operations land in `~/.dsh/lesson/pending.jsonl` and
  wait for `Accept`;
- agreement operations are ALWAYS queued, because the service never writes `~/.dsh/AGENTS.md`;
- even under `write: auto` the rules of the judge and the exact-file fence still apply, so a
  `create` never overwrites and a `patch` never invents a skill.

## The lifecycle

`Curate(now)` is the always-on, token-free half that moves `active → stale` at `staleAfterDays` and
`stale → archived` at `archiveAfterDays`, with four protections: pinned entries never move, only
`createdBy: agent` entries are in its jurisdiction, a zero-use entry keeps a grace floor, and an
archive is a rename into `.archive/` with its own undo through `Restore`.

## Ships disabled

`enabled: false` is the schema default and the patch row, which is the idle-forever posture of the
family.

The service stays resolvable while it is disabled, so the nudge hook never hard-fails on it.

## Wiring

1. **The bundle rows.**

    Add `@playform/ets-plugin-dsh-lesson-review` and `@playform/ets-hook-dsh-lesson-nudge` to the
    `dsh.profile.bundles` of the profile and to its `link:` dependencies.

2. **The patch rows.**

    Add both patch rows to `cordis.patch.yml` of the profile.

3. **The restart.**

    Restart the host.

4. **The ledgers.**

    Read the ledgers at `~/.dsh/playform/ets-plugin-dsh-lesson-review.log` and
    `~/.dsh/playform/ets-hook-dsh-lesson-nudge.log`.

5. **The run.**

    Read a run at `~/.dsh/lesson/reports/<stamp>/REPORT.md`.

## Contract

- [SCHEME.md](./SCHEME.md) covers the surface, the pipeline, the config, the rule ids of the judge,
  the ledger strings, and the seams in `§6` that must be confirmed against a live harness.
- The plan is `Documentation/Plans/LESSON-REVIEW-PLUGIN.md`.
- The corpus standard that this review writes to is `~/.dsh/skills/STANDARD.md`.
