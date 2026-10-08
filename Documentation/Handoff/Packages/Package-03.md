# Package 3 — The architecture at a glance

> The architecture at the handoff's writing (2026-10-04): the factory surface (the 15-method
> contract), the module leaves, the cascade matrix pointers, and the four live-verified fixes. Part
> of `Documentation/Handoff/` — see `../Overview.md`.

## The factory surface (`ctx.pluginFactory` — the module contract)

15 methods (full signatures in `dsh-plugin-factory/SCHEME.md` §2, now renamed to the Module
vocabulary):

1. `Append(state, message)` — the ledger (logger + appendFileSync, never throws)
2. `Match(path, list)` — exclusion segment match 3–4. `Discover(dir)` / `Parse(path)` — auxiliary
   discovery (the exemption)
3. `ResolvePolicy(state, dir, found, chain, opts?)` — union keep-list (+ P3 chain keys)
4. `Gate(state, target, observation, actor, {basename, mutationToolsField?})` — g1 set, logs nothing
5. `GuardedWrite(state, target, content, version, signal?)` — replaceIfVersion + P4 fence + Stash
   pre-registration
6. `Refresh(state, target, actor, version)` — same-actor re-emit (P₃/U₂)
7. `Continue(state, target, actor, dir, found, version, transform)` — the detached contained
   continuation
8. `State(ctx, config, {module, fields?, policyFileName?})` — the State builder (cell unwrap +
   probe-once)
9. `Wire(ctx, state, observe)` —
   [fs/observed](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts)
   registration (MANIFEST-hardwired — a non-manifest module wires its own `ctx.on`)
10. `Attach(ctx, {state, name})` — P1 jobs controller + P2 in-flight disposal + P5 storage journal
11. `Journal(state, event, path, detail, at?)` —
    [the storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain)
    writer (silent skip when absent)
12. `Schema(shared?, module?)` — the Schemastery schema factory (volatile shared fields; instance
    method — see [Package 4 §4.2](Package-04.md))
13. `Seam(state, name)` — probe-once via `ctx.get` (never the dead accessor)

**The transform contract** (the module leaf the factory drives):
`(current: string|null, section: unknown, keep: string[]) => { next, count, message? } | null` —
`current` = RAW text; `next` = an object (JSON-serialized) or a STRING (the cargo's TOML line
surgery, verbatim); `message` = a string or `(outcome:{version}) => string`; `null` = every no-op
path (the module logs its own lines).

## The module leaves (what the factory NEVER absorbs)

- the transforms (Satisfy/Pin/Normalize + decode) — each module's identity
- the update engines (ncu library/binary, cargo upgrade) — the standing exemptions
- the update gates + breaker maps — module-owned state
- the ledger STRINGS — byte-identical, smoke-asserted
- the config extensions + docs — module delineation

## The cascade matrix

`Documentation/Guides/Governor-CASCADES.md` — the full nuanced matrix (10 cascades,
element-by-element, the async boundary, the data flow) and
`Documentation/Guides/Governor-TRIO-GRAPH.md` (the API-surface graph + the research verdict, P1–P9).
Both docs use the Module vocabulary now (the literal `activated (cargo flavor, …)` ledger string
stays — smoke-asserted).

## The four live-verified fixes (never regress them)

1. `inject` + `Config` MUST be on the loader's DEFAULT export object (named-only exports are
   shadowed → `cannot get property "fs" without inject`)
2. `apply` MUST return nothing (a returned value silently kills event delivery)
3. `ctx.jobs` at root needs `attachController` (the "agent-scoped" premise was REFUTED —
   jobs.md:398, 42-46, 488-493); the detached continuation is the probed fallback
4. `ctx.fs.writeText` from a root plugin needs an explicit sandbox policy
   (`{mode:"danger-full-access"}` before P4; now the P4 confined posture — `sandboxMode`-decided
   `{mode:"workspace-write", workspaceRoot: <manifest dir>}`)
