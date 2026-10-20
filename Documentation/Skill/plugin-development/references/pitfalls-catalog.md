# The Pitfalls Catalog (19 Items, Verified on This Machine)

> Source: SKILL.md, section 11 "Pitfalls catalog (verified on this machine)".
> Items marked "verified live" were confirmed against the running host on
> this machine (dates as noted, e.g. 2026-10-03).
> This file carries the full catalog; SKILL.md only points here.

## The Rule

These are verified failure modes. Before writing or debugging plugin code,
scan the list for your symptom. Each item: the pitfall, the mechanism, and
the fix.

1. **`FsTarget` has NO `.path`** - the shape is `{ targetKey, displayPath }`.
   `target.path` listeners never fire. Use `targetKey` for identity,
   `displayPath` for presentation, and the `fs` seam for actual paths.
2. **`fs/observed` payload is positional** `(target, observation, actor)`.
   Gate on `observation.kind === "present"` AND the actor's tool name -
   reads emit `present` too, so kind alone is not a write filter.
3. **Bare `- id:` patch rows fail** with `entry not found` - use
   `- insert:` for new rows. (See ./references/packaging.md.)
4. **ncu's `-x/--reject` is ONE comma-delimited argument** - separate argv
   entries become positional filters.
5. **`ctx.emit` does NOT await listeners** - contain async rejections
   yourself (see ./references/performance-pressure.md).
6. **Module-level import of an unresolvable package crashes the whole
   bundle load** (schemastery in a bare profile graph).
7. **Relative `import.meta.dirname/../..` from an installed copy resolves
   wrong** - ship helpers inside the package, resolve via
   `new URL(..., import.meta.url)`.
8. **Post-hoc rewrites must refresh the observation-policy's version
   record** (re-emit `fs/observed` with a fresh token, same actor) or the
   author's next guarded write fails `FS_STALE_VERSION` - a notification
   leak.
9. **`const Set = new Set()` is a TDZ ReferenceError** - don't shadow
   globals (use `State.Set` or a different word).
10. **The host PATH is not the user's shell PATH** - child processes need
    absolute binary paths from config.
11. **CJS-with-default packages** (npm-check-updates): access `run`
    defensively (`Mod.run ?? Mod.default?.run`).
12. **Verify activation via Inspect (`Config.listConfigs`) + a durable
    `activated (...)` ledger line written in `apply()`** - never assume a
    restart activated the bundle.
13. **Same-version reinstall is a pnpm no-op (`ambiguous-install`)** - bump
    the version to force a real reinstall.
14. **A THROW in an emit listener fails the tool call AFTER mutation** - the
    catch-all suppression pattern (logger/ledger only) is mandatory. (See
    ./references/performance-pressure.md.)
15. **`export default { name, apply }` SHADOWS the named exports** -
    `inject` and `Config` MUST also be on the default object, or service
    accessors throw `cannot get property "fs" without inject` (verified
    live 2026-10-03; a smoke that calls apply directly NEVER catches this).
16. **NEVER `return` a value from `apply`** - the loader treats apply
    return values specially; returning a State object silently killed
    event delivery (verified live 2026-10-03). Expose state via a context
    attachment (`ctx.__governorState = State`) for test probes instead.
17. **`ctx.jobs` at ROOT needs a CONTROLLER, not an injection** - the
    accessor throws `no job controller serves this agent` until the plugin
    attaches one: `ctx.jobs.attachController(name)` from an unscoped/root
    context "serves every owner" and `start({owner: undefined})` creates an
    unowned job (jobs.md:398, 42-46, 488-493 - this REFUTED the earlier
    "agent-scoped" premise, 2026-10-03). The detached contained
    continuation is the probed fallback for deployments without a jobs
    service (sdk-minimal).
18. **`ctx.fs.writeText` from a root plugin REQUIRES an explicit sandbox
    policy argument** - without it the deployment default (workspace-write)
    denies paths outside the canonical workspace (`file access denied under
    workspace-write mode`). A governor whose own exclusion list is its
    fence passes `{ mode: "danger-full-access" }`.
19. **The pnpm-workspace of the profile swallows `pnpm install` inside a
    bundle dir** (`Already up to date`) - use `pnpm install
    --ignore-workspace` to give the linked checkout its own
    `node_modules`.

## Why: The Full Philosophy

1. Every item here was verified against the live host or cost real
   debugging time - they are not folklore. The catalog exists so the same
   hours are not spent twice.
2. Items 15 and 16 share a root cause (the default export shadows / the
   loader special-cases apply returns) and a testing blind spot: smokes
   that call `apply` directly pass while the real bundle fails. The arbiter
   is always a live activation check (item 12), never a direct-call smoke
   alone.
3. Items 17 and 18 are the root-context pair: at root, ownership
   (jobs controller) and permission (sandbox policy) are not inherited, so
   both must be explicit.
4. Items 3, 13, and 19 are the packaging trio: unknown-id rows fail loudly,
   same-version reinstall does nothing, and the profile workspace hides
   installs - three different silences at the packaging layer.

## Examples

### Good

```js
// Item 1: correct FsTarget usage.
ctx.on('fs/observed', (target, obs, actor) => {
	if (obs.kind === 'present' && actor?.tool) record(target.targetKey, obs)
})
```

```js
// Item 16: expose state without returning it.
export function apply(ctx) {
	ctx.__governorState = State
}
```

### Bad

```js
// Item 1: reads a property that does not exist.
if (target.path === '/etc/passwd') { ... } // never fires

// Item 15: default object without inject/Config.
export default { name: 'x', apply }
export const inject = ['fs'] // invisible to the loader
```

## Exceptions

- Item 18's `danger-full-access` grant is justified ONLY when the plugin's
  own exclusion list is the fence (governor pattern) - not as a general
  escape hatch.
- Item 17's detached contained continuation is a fallback for deployments
  without a jobs service (sdk-minimal), not the preferred path.

## Failure Modes

- Trusting a green smoke as proof of activation (items 12, 15, 16).
- Assuming inherited scope at root (items 17, 18): accessors throw or
  permission denials appear at first use, far from the cause.
- Version-less iteration (items 13, 19): installs appear to succeed while
  doing nothing.

## Arbiters

- Live verification: `dsh --profile <name> --dump-config` at pack time;
  Inspect (`Config.listConfigs`) + the `activated (...)` ledger line at
  runtime (item 12).
- Each item's mechanism above is the diagnostic: match your symptom to the
  item, then apply the fix.
- The checklist (./references/checklist.md) is the positive image of this
  catalog.
