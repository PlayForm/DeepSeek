# Performance and Pressure Rules: emit Listeners, Background Work, Containment

> Source: SKILL.md, section 8 "Performance & pressure rules". Sources:
> filesystem.md:185, 242, 490-509; adding-a-tool.md:51-55; inherited.md:19;
> session-projection.md:120; defensive-patterns.md:23-25; architecture.md:127.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

- The hardest rule: "`fs/observed` is a fire-and-forget recording event ...
  its listener MUST be synchronous and side-effect-only, because the tool
  does NOT guard the emit - a throwing listener can replace a read error or
  surface as the tool's `isError` after a mutation already succeeded"
  (filesystem.md:185; 490-509: "Listeners must be synchronous recorders:
  throws fail the tool call and returned promises are not awaited").
- The official policy listener performs NO fs I/O - it records into a
  WeakMap; real work happens in decision waterfalls (filesystem.md:242).
- Background work: `ctx.jobs.start({ kind, label, owner: exec.agent, run })`
  with a task-owned cancellation signal - never block an emit listener
  (adding-a-tool.md:51-55). Throttle/debounce via `ctx.timer` helpers;
  throttling triggers must be config fields (inherited.md:19;
  session-projection.md:120).
- Contain listener exceptions: "one bad subscriber never breaks core
  lifecycle" (defensive-patterns.md:23-25).
- Durable facts go through the logger/session events, not ad-hoc listener
  writes ("Model-visible means logged", architecture.md:127).

## Why: The Full Philosophy

1. The fs/observed case is the concrete disaster that justifies the whole
   section: the emit is unguarded, so a throwing listener's error becomes
   the tool's error - a mutation that already succeeded reports as a
   failure. The listener's job is recording, and recording must never be
   the reason a tool call fails.
2. Hence the official pattern: the policy listener does zero fs I/O and
   writes into a WeakMap (cheap, synchronous, no failure modes); the real
   decisions happen later in waterfalls, which are allowed to be
   asynchronous and decisive. Heavy work detached, decisions separated.
3. Background work has one sanctioned door: `ctx.jobs.start` with a
   task-owned cancellation signal. This gives the harness ownership and
   cancellation; a promise chain started inside an emit listener has
   neither.
4. Throttle triggers are config fields because when to throttle is an
   operational property, not a code constant (the cordis.yml test, see
   ./references/config-contract.md).
5. Containment is defensive symmetry: the host contains one bad subscriber
   so core lifecycle survives; the plugin must do its part by not throwing
   or awaiting in the first place.
6. "Model-visible means logged": a fact that matters beyond this process
   instant must reach the logger/session events. Ad-hoc writes from
   listeners are neither durable nor visible.

## Examples

### Good

```js
// fs/observed listener: synchronous recorder, no I/O, no throw.
ctx.on('fs/observed', (target, observation, actor) => {
	if (observation.kind === 'present' && actor?.tool) {
		seen.set(target.targetKey, observation)  // WeakMap/Map record
	}
})
// Heavy work detached:
ctx.jobs.start({ kind: 'index', label: 'reindex', owner: exec.agent, run })
```

### Bad

```js
// Async, throwing, I/O-performing listener on a fire-and-forget event:
ctx.on('fs/observed', async (target, obs) => {
	await fs.promises.stat(target.path)   // target.path doesn't exist anyway
	if (!obs) throw new Error('no observation')
})
```

## Exceptions

- Decision waterfalls on `fs/*` events MAY be async and MAY throw - that is
  where real work and vetoes belong (see ./references/waterfall.md and
  ./references/tool-pipeline.md).
- `emit` listeners themselves may mutate their OWN in-memory state freely -
  side-effect-only refers to external effects (I/O, tool-call-visible
  failures), not to the recording write itself.

## Failure Modes

- A throwing emit listener converting a successful mutation into an
  `isError` tool result (verified pitfall 14, see
  ./references/pitfalls-catalog.md).
- Unawaited async listener work racing the tool call: partial writes,
  missed observations.
- Blocking an emit listener on background work: every observed file op
  stalls behind the listener.
- Throttle constants hardcoded: operators cannot tune the pressure without
  a rebuild.

## Arbiters

- Review: every listener on a fire-and-forget event is synchronous,
  side-effect-only, no-throw (checklist item 8).
- The catch-all suppression pattern (logger/ledger only) is mandatory
  around any residual async risk (pitfall 14).
- Live template: the official policy listener's WeakMap pattern
  (filesystem.md:242) is the reference implementation.
