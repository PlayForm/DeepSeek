# Packaging and the Verified Pitfalls

## Packaging

- A bundle declares `dsh.bundle` patch layers.
- `- insert:` adds a new row; a bare `id:` overrides an existing one.
- An override replaces the config wholesale; it does not merge.
- Layer order matters: a later layer can override an earlier one.
- Peer dependencies must be declared.
- The dev loop uses directory links; the linked checkout carries its own `node_modules`.
- A same-version reinstall is a no-op (`ambiguous-install`); bump the version to force a real
  reinstall.

## The 19 verified pitfalls

1. **`FsTarget` has no `.path`**: the shape is `{ targetKey, displayPath }`. Use `targetKey` for
   identity, `displayPath` for presentation, the `fs` seam for paths.
2. **`fs/observed` payload is positional** `(target, observation, actor)`. Gate on
   `observation.kind === "present"` AND the actor's tool name; reads emit `present` too.
3. **Bare `- id:` rows fail** with `entry not found`; use `- insert:` for new rows.
4. **ncu's `-x/--reject` is one comma-delimited argument**; separate argv entries become positional
   filters.
5. **`ctx.emit` does not await listeners**; contain async rejections.
6. **A module-level import of an unresolvable package crashes the bundle load.**
7. **Relative `import.meta.dirname/../..` from an installed copy resolves wrong**; ship helpers
   inside the package and resolve via `new URL(..., import.meta.url)`.
8. **Post-hoc rewrites must refresh the observation policy's version record** (re-emit `fs/observed`
   with a fresh token, same actor) or the next guarded write fails `FS_STALE_VERSION`.
9. **`const Set = new Set()` is a TDZ error**; do not shadow globals.
10. **The host PATH is not the shell PATH**; pass absolute binaries.
11. **CJS-with-default packages** need defensive access: `Mod.run ?? Mod.default?.run`.
12. **Verify activation by Inspect plus a durable `activated (...)` ledger line written in
    `apply`**; never assume a restart activated it.
13. **Same-version reinstall is a no-op**; bump the version.
14. **A throw in an `emit` listener fails the tool call after mutation**; the catch-all suppression
    is mandatory.
15. **`export default { name, apply }` shadows the named exports**; `inject` and `Config` must also
    be on the default object.
16. **Never return a value from `apply`**; expose state via a context attachment for probes.
17. **`ctx.jobs` at root needs a controller**, not an injection: `ctx.jobs.attachController(name)`
    from a root context, then `start({ owner: undefined })`.
18. **`ctx.fs.writeText` from a root plugin requires an explicit sandbox policy**; without it the
    deployment default denies paths outside the workspace.
19. **The profile's pnpm workspace swallows `pnpm install` inside a bundle dir**; use
    `pnpm install --ignore-workspace`.

## The checklist (the positive image)

- One entry; declared injects; a real schema; tunables as config fields.
- Effects everywhere; one-disposer teardown; stable row ids.
- Waterfall discipline; synchronous emit recorders.
- Seam-only I/O; policy as listeners; logger not console.
- `defineTool` rules; declaration merging.
- Packaging per the publish rules; HMR idempotence.
- Activation verified live, not by a direct-call smoke.

## Failure modes

- **A green smoke as proof of activation**: items 12, 15, and 16 pass in a direct-call harness while
  the real bundle fails.
- **Assumed root scope**: items 17 and 18 throw or deny at first use.
- **Version-less iteration**: items 13 and 19 make installs look successful while doing nothing.
