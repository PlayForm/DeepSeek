# @playform/plugin-dsh-lesson-review

The post-turn self-improvement review, as a service.

**Plugin @ DSH @ Review @ Lesson.**

It owns the nudge counter, the bounded digest, the review prompt, the strict reply parse, the
deterministic acceptance judge, the guarded corpus write, the usage store and the staleness/archive
pass.

It does not own the trigger - `@playform/hook-dsh-lesson-nudge` calls it from the agent's idle
phase.

## What it does

One review is one bounded round trip:

1. **The digest.**

    The review digests the conversation snapshot (a verbatim tail, older turns collapsed, a hard
    character cap applied from the front).

2. **The ask.**

    The review asks the review model once, with a constant prompt that states what a skill is, which
    of the two stores a lesson belongs in, which operations exist, and what must never be captured.

3. **The parse.**

    The review parses the reply strictly (one JSON object, five operation kinds).

4. **The judge.**

    The review judges every operation against deterministic rules (class-level name, no incident
    narration, no bare negative claim, read-before-write, pins).

5. **The apply or queue.**

    The review applies or queues the operation - the shipped `policy.write: approve` means QUEUE:
    nothing reaches the corpus until it is accepted.

6. **The report.**

    The review reports the run (`run.json` + `REPORT.md`) and writes one ledger line.

## The posture: propose, never publish

The corpus is the user's working memory.

A review that writes to it unasked is worse than no review, so:

- `policy.write` ships `approve` → accepted operations land in `~/.dsh/lesson/pending.jsonl` and
  wait for `Accept`;
- agreement operations are ALWAYS queued - the service never writes `~/.dsh/AGENTS.md`;
- even under `write: auto` the judge's rules and the exact-file fence still apply: a `create` never
  overwrites, a `patch` never invents a skill.

## The lifecycle

`Curate(now)` is the always-on, token-free half: `active → stale` at `staleAfterDays`,
`stale → archived` at `archiveAfterDays`, with four protections - pinned entries never move, only
`createdBy: agent` entries are in its jurisdiction, a zero-use entry keeps a grace floor, and an
archive is a rename into `.archive/` (its own undo through `Restore`).

## Ships disabled

`enabled: false` is the schema default and the patch row - the family's idle-forever posture.

The service stays resolvable while disabled, so the nudge hook never hard-fails on it.

## Wiring

1. **The bundle rows.**

    Add `@playform/plugin-dsh-lesson-review` and `@playform/hook-dsh-lesson-nudge` to the profile's
    `dsh.profile.bundles` (and its `link:` dependencies).

2. **The patch rows.**

    Add both patch rows to the profile's `cordis.patch.yml`.

3. **The restart.**

    Restart the host.

4. **The ledgers.**

    Read the ledgers: `~/.dsh/playform/plugin-dsh-lesson-review.log` and
    `~/.dsh/playform/hook-dsh-lesson-nudge.log`.

5. **The run.**

    Read a run: `~/.dsh/lesson/reports/<stamp>/REPORT.md`.

## Contract

- [SCHEME.md](./SCHEME.md) - the surface, the pipeline, the config, the judge's rule ids, the ledger
  strings, and the seams (`§6`) that must be confirmed against a live harness.
- Plan: `Documentation/Plans/LESSON-REVIEW-PLUGIN.md`.
- The corpus standard this review writes to: `~/.dsh/skills/STANDARD.md`.
