# SCHEME - @playform/hook-dsh-lesson-nudge

## Identity

| Place                  | Value                                       |
| ---------------------- | ------------------------------------------- |
| Package name           | `@playform/hook-dsh-lesson-nudge`           |
| Loader form            | function (`name`/`apply`/`Config`/`inject`) |
| Patch entry id         | `hook-dsh-lesson-nudge`                     |
| Ledger logFile default | `~/.dsh/playform/hook-dsh-lesson-nudge.log` |
| Injects                | `pluginFactory`                             |
| Probes (never injects) | `lesson` (the review service)               |

The loader contract is the function form (the suggester precedent): the default export carries
`name`, `apply`, `Config` and `inject` - all four, because the default object shadows the named
exports and a service accessor without `inject` throws.

`lesson` is deliberately NOT injected. An inject failure is a LOAD failure, and a profile that
enables the nudge without the review service should get one warning and an inert hook, not a plugin
that refuses to mount.

## The event surface

One listener, one event:

| Event          | Mode | Why                                                    |
| -------------- | ---- | ------------------------------------------------------ |
| `agent/status` | emit | the `idle` edge is the only moment a review may claim. |

`idle` means no driver is scheduled or active - the phase `agent.runMaintenance` exists to claim for
non-turn work. Reviewing on any other edge puts a second model call beside the live turn's.

## The four gates (in order, cheapest first)

1. **The switch.**

    `enabled` is the volatile switch, checked inside the body so a hot flip lands without a remount.

2. **The edge.**

    `status === "idle"` is the edge.

3. **The service.**

    `ctx.get("lesson")` is probed per transition (the service may load after this hook); absent
    means ONE warn per process and no work.

4. **The cadence.**

    `Lesson.Tick(agent).due` and the hook's own `maxReviewsPerSession` cap are the cadence.

The cap is the runaway guard, not the cadence: the cadence belongs to the service (`intervalTurns`).
A profile that mis-sets the service's interval to 1 still gets at most `maxReviewsPerSession`
reviews per agent.

## Config

| Key                    | Default  | Effect                                     |
| ---------------------- | -------- | ------------------------------------------ |
| `enabled`              | `false`  | the switch (schema default; the patch row) |
| `logFile`              | see §1   | the ledger path                            |
| `maxReviewsPerSession` | `3`      | the per-agent runaway guard                |
| `policy`               | D6 block | the shared per-action allowlist            |

The D6 block is the factory's: `read`/`index`/`record`/`suggest`/`message` are `auto`,
`write`/`commit`/`spawn` stay the shipped `approve`. The nudge reads a status and claims a
maintenance task - it never writes a file, commits, or creates a subagent (a maintenance task is not
a subagent).

## Ledger strings (module-owned, byte-stable)

The factory's `Append` prefixes `<module>: `, so each line reads `hook-dsh-lesson-nudge: <message>`:

- `activated (bundle=0.3.0, cap=<n>)`
- `disabled (enabled=false)`
- `reviewed <outcome> (<a> applied, <q> queued)`
- `cap reached (<n> reviews)`
- `skipped (agent cannot run maintenance)`

Warnings go to the logger, not the ledger: `no lesson service; the nudge is inert until it loads`,
`review task failed: <cause>`, `<error>; the transition passes unnudged`.

## Fail-open posture

Every listener body is one `try/catch`. A throw inside a status emit breaks the harness's status
publication, which is far worse than a skipped review: the catch warns and returns. The maintenance
task is detached from the emit (`void Promise.resolve(task).catch(...)`) so a status listener
returns immediately and a rejected review cannot become an unhandled rejection.

## What this package does NOT own

- The corpus, the usage store, the prompt, the judge, the queue - all
  `@playform/plugin-dsh-lesson-review`.
- The session projection: the snapshot comes from `Lesson.Snapshot(agent)`, so one session has one
  digest regardless of who asked.
