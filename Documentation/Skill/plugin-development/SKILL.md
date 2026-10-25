---
name: plugin-development
description: "The DeepSeek Harness (Cordis) plugin API: five dispatch modes, plugin anatomy, Config schemas, services, fibers and effects, tools and the execution pipeline, event-listener performance rules, packaging, review checklist, pitfalls catalog."
whenToUse: Before creating a DSH plugin, hooking a Cordis event, exporting a Config schema, providing or consuming a service, registering a tool, packing a bundle, or diagnosing a plugin that did not activate. For the family contract, load plugin-system too.
version: 2.0.0
updated: 2026-10-20
---

# DSH Plugin Development

A DSH plugin is a Cordis plugin: it receives `ctx` and `config`, declares what it needs, and
integrates only through the API. The harness is a microkernel with no privileged core to patch, so
free-floating Node.js inside a plugin is the anti-pattern. This skill is the API manual; the
family's conventions are `plugin-system`.

## When to use

- Creating a plugin, hook, or tool for the harness.
- Choosing an event mode, a service shape, or a config schema.
- Diagnosing an activation, an event that never fires, or a tool that fails after a mutation.
- Do not use for: the family's bundle anatomy, build, and ledger (`plugin-system`) or the smoke
  suites (`smoke-writing`).

## The API map

| Seam       | What it provides                                                                |
| ---------- | ------------------------------------------------------------------------------- |
| Events     | `ctx.on`, `ctx.emit`, `ctx.parallel`, `ctx.serial`, `ctx.bail`, `ctx.waterfall` |
| Config     | The `Config` schema; validated at load, hot-replaced on edit                    |
| Services   | `Service` base, `provide`/`get`, PENDING-until-satisfied                        |
| Tools      | `defineTool`, the execution pipeline, presenters                                |
| Effects    | `ctx.effect` for resources; fiber-owned disposal                                |
| Logger     | `ctx.logger`, never `console`                                                   |
| Subprocess | The subprocess seam; absolute binaries, the host PATH                           |
| Jobs       | `ctx.jobs` with a controller at root                                            |

## The five dispatch modes

| Mode        | Awaited      | Order           | Return |
| ----------- | ------------ | --------------- | ------ |
| `emit`      | No           | registration    | No     |
| `waterfall` | Via `next()` | registration    | Yes    |
| `parallel`  | Yes          | all in parallel | No     |
| `serial`    | Yes          | registration    | Yes    |
| `bail`      | No           | until one bails | Yes    |

The mode is the event's public contract. A listener cannot opt out of it.

- `emit` is fire-and-forget: returned promises are dropped. Listeners must be synchronous recorders.
- `waterfall` observers must call `next()`. Omitting it silently swallows the default behavior
  downstream. Use `prepend: true` only when ordering matters.

## Plugin anatomy

- The default export is a function, a constructor, or an object with `name`, `apply`, `Config`,
  `inject`.
- `apply` returns nothing. A returned value silently kills event delivery.
- A bad config fails loud at load.
- `inject` declares the services; the loader's PENDING state orders the loads.
- Declaration merging into `Context` and `Events` gives typed accessors and typed events.

## Config

- A real `Schema.object` with defaults, not a plain object.
- Every tunable is a config field (the cordis.yml test).
- Volatile cells apply on the next dispatch without a remount.
- `!!js` scope for computed values.
- A config edit hot-replaces the plugin.

## Services

- Extend `Service`, call `super(ctx, name)`.
- `provide`/`get`; static hooks for typed access.
- PENDING-until-satisfied: load order never matters.
- Optional dependencies by probing; a plugin with no service is a valid archetype.

## Fibers and effects

- A fiber owns its registrations; disposal runs in reverse order.
- Async disposers run concurrently.
- Wrap raw resources in `ctx.effect`.
- Stable row ids for HMR diffs; HMR idempotence is part of the checklist.

## Tools

- `defineTool` with typed parameters.
- One canonical JSON value per result; render purely.
- Readonly after registration; honor `exec.signal`.
- The pipeline: pre-execute, guard, execute, projectContent, post-execute, finalizeContent, result.
- The guard is monotonic; presenters are pure.

## Performance rules

- `emit` listeners are synchronous recorders: no awaits, no throws, no I/O. A throw in an `emit`
  listener fails the tool call after the mutation.
- Heavy work goes through `ctx.jobs.start`.
- Throttles belong in config.
- Contained exceptions log to the logger and the ledger only.
- Model-visible behavior is logged.

## Packaging

- `dsh.bundle` patch layers: `- insert:` for new rows, a bare `id:` to override.
- An override replaces the config wholesale, not merge.
- Layer order matters; peer dependencies must be declared.
- The directory-link dev loop; same-version reinstall is a no-op.

## The review checklist

A well-integrated plugin has: one entry, declared injects, a real schema, tunables as config fields,
effects everywhere, one-disposer teardown, waterfall discipline, synchronous emit recorders,
seam-only I/O, policy as listeners, `defineTool` rules, declaration merging, logger not console,
packaging per the publish rules, and HMR idempotence.

## Verification

- The plugin loads with a valid config and announces its activation.
- The activation is verified by Inspect and a durable ledger line, not by a restart.
- The event mode matches the listener's behavior.
- The tool's result is one canonical JSON value and its presenter is pure.

## Anti-patterns

| Mistake                          | Cost                                      | Do instead           |
| -------------------------------- | ----------------------------------------- | -------------------- |
| Returning a value from `apply`   | Event delivery stops silently             | Return nothing       |
| Async listener on `emit`         | Dropped promise; rejection after mutation | Synchronous recorder |
| Omitting `next()` in a waterfall | The default behavior downstream vanishes  | Call `next()`        |
| `console` logging                | Invisible to the harness's log surface    | `ctx.logger`         |
| Free-floating Node.js            | No seam, no lifecycle, no governance      | Use the API          |

## References

| File                                   | Covers                                                    | Read when            |
| -------------------------------------- | --------------------------------------------------------- | -------------------- |
| `references/dispatch-and-events.md`    | The modes, the waterfall, listeners, and scoping          | Hooking an event     |
| `references/anatomy-and-config.md`     | Export shapes, inject, Config, services, declaration      | Creating a plugin    |
| `references/fibers-and-tools.md`       | Fiber lifecycle, effects, HMR, `defineTool`, the pipeline | Resources and tools  |
| `references/packaging-and-pitfalls.md` | Bundles, patch layers, the 19 verified pitfalls           | Packing or debugging |
