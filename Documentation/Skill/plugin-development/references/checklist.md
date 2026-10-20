# The Well-Integrated Plugin Checklist (15 Items)

> Source: SKILL.md, section 10 "Well-integrated plugin checklist (15 items)".
> Each item condenses a rule documented fully in a sibling reference.
> This file carries the full list with per-item pointers; SKILL.md only
> points here.

## The Rule

A plugin is well integrated when all 15 hold. The list is the review
instrument: walk it top to bottom before shipping or reviewing any plugin.

1. Single entry with named exports (`name` + `apply`, optional
   `Config`/`inject`/class). - see ./references/plugin-anatomy.md
2. Required services declared via `inject` - never rely on load order. -
   see ./references/services.md
3. Real `Config` schema (Schemastery/Standard Schema), defaults on fields,
   fail-loud. - see ./references/config-contract.md
4. Every tunable is a config field (the cordis.yml test). - see
   ./references/config-contract.md
5. All registrations through `ctx` are effects; raw resources wrapped in
   `ctx.effect`. - see ./references/fibers-and-effects.md
6. Order-sensitive teardown inside ONE disposer. - see
   ./references/fibers-and-effects.md
7. Waterfall discipline: observers call `next()`; only decision-owners
   short-circuit. - see ./references/waterfall.md
8. `emit` listeners are synchronous recorders: no awaits, no throws; heavy
   work detached. - see ./references/performance-pressure.md
9. Capability I/O through the seams (`ctx.fs` + fs/*, `ctx.subprocess`,
   `ctx.sandbox`); never parse opaque ids (`targetKey`, `FsVersion`,
   `exec.token`). - see ./references/api-map.md
10. Policy as listeners, not service calls (guard/execute/post-execute/
    result roles). - see ./references/tool-pipeline.md
11. Tools via `defineTool`: typed parameters, one canonical value, pure
    render/presenters, readonly after registration, honor `exec.signal`. -
    see ./references/tools.md
12. Typed vocabulary via declaration merging (`Context`, `Events`). - see
    ./references/declaration-merging.md
13. `ctx.logger(name)`, never console. - see ./references/api-map.md
14. Bundle packaging per publish.md (stable ids, defaults designed for
    override, peers+devDeps). - see ./references/packaging.md
15. Idempotent under HMR: no module-level side effects; disposal complete
    before reload; stable row ids; load failure is loud. - see
    ./references/fibers-and-effects.md and ./references/plugin-anatomy.md

## Why: The Full Philosophy

1. The checklist is the compression of the whole manual into a reviewable
   form: each item names the failure it prevents, and each failure mode has
   a dedicated reference with rationale, examples, and arbiters.
2. Items 1-4 are the declaration layer (entry, dependencies, config);
   items 5-8 are the lifecycle and event-discipline layer; items 9-13 are
   the capability-use layer; items 14-15 are the packaging and reload
   layer. The order is deliberate: structural problems first, behavioral
   next, packaging last.
3. "Defaults designed for override" (item 14) closes the loop with the
   config-replacement rule: because overrides replace whole configs, the
   shipped defaults must be sensible as the only source, not as fragments
   expecting to be merged.

## Examples

### Good

A review pass that checks each of the 15 in order, citing the reference
for any item that fails.

### Bad

Reviewing only "does it load" - the checklist exists because a plugin can
load, run, and still be badly integrated (e.g. emitting on unawaited
events, unstable row ids).

## Exceptions

- None: the list is a conjunction. A plugin may legitimately have no
  tunables (item 4 is then vacuously satisfied) or no tools (item 11), but
  no item is waivable when its subject exists.

## Failure Modes

- Checklist theater: ticking items without walking the corresponding
  reference when an item is questionable.
- Reviewing only the diff for new plugins: items 14-15 (packaging, HMR)
  usually fail outside the diff.

## Arbiters

- This file IS the arbiter list: each item's pointer names the reference
  whose "Arbiters" section defines the concrete check for that item.
- The pitfalls catalog (./references/pitfalls-catalog.md) is the negative
  image: each verified pitfall maps to the checklist item it violates.
