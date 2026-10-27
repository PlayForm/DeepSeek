# @playform/hook-dsh-lesson-nudge

The post-turn nudge of the lesson-review family changes the `idle` edge of `agent/status` into a
self-improvement review.

**Hook @ DSH @ Nudge @ Lesson.**

It has no corpus and no prompt.

The hook watches the agent lifecycle and asks `@playform/plugin-dsh-lesson-review` whether a review
is due.

It then runs that review from the idle phase through `agent.runMaintenance`.

So the review never shares the endpoint with the live turn, and it never writes to the log of that
turn.

## Why the split

The family separates a SERVICE (state, storage, writes) from a HOOK (an event surface).

The review needs both: a corpus with a usage store and a queue, and a moment to run.

Each half can change on its own.

A different trigger, such as a cron or a manual tool, can start the same service, and the same
trigger can start another review implementation.

## The four gates

1. **Switch.**

    The listener body checks `enabled`, so a change to the cell takes effect at the next status
    transition without a remount.

2. **Edge.**

    The edge is `status === "idle"`.

3. **Service.**

    The hook gets the service from `ctx.get("lesson")` at each transition.

    If the service is absent, the hook writes one warning per process and does not throw.

4. **Cadence.**

    The cadence is `Lesson.Tick(agent).due`.

    Then the hook applies its own `maxReviewsPerSession` cap, which is the runaway guard for an
    incorrect service interval.

## Fail open

A throw inside a status emit breaks the status publication of the harness.

Each listener body has one `try/catch` block.

The hook detaches the maintenance task from the emit, so the listener returns immediately and a
rejected review cannot become an unhandled rejection.

## Ships disabled

The schema default and the patch row set `enabled: false`, which is the idle-forever posture of the
family.

A cold mount logs `disabled (enabled=false)`, and the listener stays inert.

The next status transition makes a change to the cell take effect.

## Wiring

1. **Bundle rows.**

    Add `@playform/plugin-dsh-lesson-review` and `@playform/hook-dsh-lesson-nudge` to the
    `dsh.profile.bundles` of the profile and to its `link:` dependencies.

2. **Patch rows.**

    Add both patch rows to `cordis.patch.yml` of the profile.

3. **Restart.**

    Restart the host.

4. **Ledgers.**

    Read each ledger: `~/.dsh/playform/hook-dsh-lesson-nudge.log` and
    `~/.dsh/playform/plugin-dsh-lesson-review.log`.

Enabling the hook without the service is safe, because it gives one warning and no reviews.

## Contract

- [SCHEME.md](./SCHEME.md) - the event surface, the gates, the config, the byte-stable ledger
  strings.
- Plan: `Documentation/Plans/LESSON-REVIEW-PLUGIN.md`.
