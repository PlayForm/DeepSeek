# @playform/hook-dsh-lesson-nudge

The post-turn nudge of the lesson-review family: it turns the `idle` edge of `agent/status` into a
self-improvement review.

**Hook @ DSH @ Nudge @ Lesson.** It owns no corpus and no prompt. It watches the agent's lifecycle,
asks `@playform/plugin-dsh-lesson-review` whether a review is due, and runs that review from the
true idle phase (`agent.runMaintenance`) - so the review never competes with the live turn for the
endpoint and never enters the turn's own log.

## Why the split

The family separates a SERVICE (state, storage, writes) from a HOOK (an event surface). The review
needs both: a corpus with a usage store and a queue, and a moment to run. Splitting them means
either half can be replaced - a different trigger (a cron, a manual tool) can drive the same
service, and a different review implementation can be driven by the same trigger.

## The four gates

1. **the switch** - `enabled`, checked inside the listener body so a hot flip lands without a
   remount;
2. **the edge** - `status === "idle"`;
3. **the service** - `ctx.get("lesson")`, probed per transition; absent is ONE warning per process,
   never a throw;
4. **the cadence** - `Lesson.Tick(agent).due`, then this hook's own `maxReviewsPerSession` cap (the
   runaway guard for a mis-set service interval).

## Fail-open, always

A throw inside a status emit breaks the harness's status publication. Every body is one `try/catch`;
the maintenance task is detached from the emit so the listener returns immediately and a rejected
review cannot become an unhandled rejection.

## Ships disabled

`enabled: false` is the schema default and the patch row - the family's idle-forever posture. A cold
mount logs `disabled (enabled=false)` and registers the listener inert; flipping the cell lands on
the next status transition.

## Wiring

1. add `@playform/plugin-dsh-lesson-review` and `@playform/hook-dsh-lesson-nudge` to the profile's
   `dsh.profile.bundles` (and its `link:` dependencies);
2. add both patch rows to the profile's `cordis.patch.yml`;
3. restart the host;
4. read each ledger: `~/.dsh/playform/hook-dsh-lesson-nudge.log` and
   `~/.dsh/playform/plugin-dsh-lesson-review.log`.

Enabling the hook without the service is safe: one warning, no reviews.

## Contract

- [SCHEME.md](./SCHEME.md) - the event surface, the gates, the config, the byte-stable ledger
  strings.
- Plan: `Documentation/Plans/LESSON-REVIEW-PLUGIN.md`.
