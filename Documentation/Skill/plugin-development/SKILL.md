> Specialized working copy (repo): synced from ~/.dsh/skills/plugin-development/ on 2026-10-10, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.
---
name: plugin-development
description: THE operating manual for authoring DeepSeek Harness (DSH) plugins against the Cordis plugin API — the five dispatch modes, plugin anatomy, Config schemas, services, fibers/effects/HMR, tools, packaging, performance pressure rules, the well-integrated checklist, and a verified pitfalls catalog. Load before writing, refactoring, or reviewing ANY dsh plugin.
whenToUse: Mandatory before creating a plugin bundle, hooking a cordis event, exporting a Config schema, providing/consuming a service, registering a tool, packing a bundle, or diagnosing why a plugin did not activate. If you are about to write plugin code without having applied this manual, stop and read it first.
---

# DSH Plugin Development — Operating Manual

Sources: `~/Developer/Documentation/Module/deepseek-harness/docs/` (citations
`file.md:line`), plus live verification against the running host and a fully
shipped production plugin (`@local/dsh-hook-package-governor`, this machine).

## 0. The one sentence

A DSH plugin is a cordis plugin: it receives `ctx` and `config`, declares what
it needs, and integrates ONLY through the API — events, services, tools,
config schemas, effects. The harness is a microkernel: "Every part of the
product is a plugin … There is no privileged core to patch" (architecture.md:11).
"New behavior attaches to a documented extension point" (architecture.md:141).
Free-floating Node.js inside a plugin is the anti-pattern.

## 1. The API map

| Seam | Entry | Role |
|---|---|---|
| Events | `ctx.on/emit/waterfall/parallel/serial/bail` | observe & influence the host |
| Config | `export const Config = Schema.object({…})` | validated, defaulted, UI-editable |
| Services | `ctx.provide` / `ctx.inject` / Service classes | typed capabilities on `ctx.<name>` |
| Tools | `ctx.tools.register(defineTool({…}))` | model-callable operations |
| Effects | `ctx.effect` | registrations that unwind on unload |
| Logger | `ctx.logger(name)` | diagnostics (never `console.log`) |
| Subprocess/Sandbox | `ctx.subprocess`, `ctx.sandbox` | confined process execution |
| Jobs | `ctx.jobs.start({kind, label, owner, run})` | harness-owned background work |

Seams are swappable capabilities with three roles — Service Definition
(abstract class owning `ctx.<key>` + vocabulary, "never a TypeScript
`interface`", glossary.md:9), Service Provider, Consumer — cataloged in
capability-seams.md:578-672.

## 2. Event bus — the five dispatch modes

`DispatchMode = 'emit' | 'parallel' | 'serial' | 'bail' | 'waterfall'`
(cordis-api/events.md:204). The mode is part of the event's public contract
(cordis-primer.md:27). Exact table (cordis-primer.md:19-25):

| Mode | Awaited? | Dispatch Order | Has Return? |
|---|---|---|---|
| `emit` | No | registration order | No |
| `waterfall` | No (awaiting happens through `next()`) | registration order | Yes |
| `parallel` | Yes | all in parallel | No |
| `serial` | Yes | registration order | Yes |
| `bail` | No | order until one bails | Yes |

- `ctx.emit(name, ...args): void` — synchronous broadcast; "returned promises
  and values are not awaited or collected" (events.md:31-49; tutorial 04:86).
- `ctx.waterfall(name, ...args): ReturnType` — each listener receives
  `(...args, next)`; calling `next()` delegates to the next listener (finally
  the built-in behavior); returning without `next()` short-circuits/vetoes
  (events.md:97-123; primer:31). **An observing/annotating waterfall listener
  MUST call `next()`** — omitting it "silently swallows the default behavior
  for everyone downstream" (tutorial 04:138; framework/events.md:79-81).
  `prepend: true` only when ordering matters (primer:33).
- `ctx.parallel(...): Promise<void>` — fan-out with settle guarantee
  (events.md:8-29); `ctx.serial(...)` — ordered first-wins, awaited
  (events.md:51-72); `ctx.bail(...)` — synchronous first-wins (events.md:74-95).
- `ctx.on(name, listener, options?): () => boolean` — listener owned by the
  current FIBER; returns a disposer; "the listener is removed on unload — no
  manual removeListener bookkeeping, ever" (events.md:125-147; tutorial 02:88).
  `ctx.once` self-disposes after one call (events.md:149-171).
  `EventOptions`: `prepend?: boolean`, `global?: boolean` (receive regardless
  of context filter checks) (events.md:173-187).
- Scoping: every dispatch has a `thisArg` overload; `Context.filter` is
  "consulted on every event dispatch" (context.md:177-186); scoped events
  dispatch with the agent's carrier — a subject-less carrier admits untagged
  listeners only (glossary.md:13-21). Root listeners on unscoped events
  (e.g. `fs/observed`) hear ALL dispatches: main agent, subagents, workflow
  children.

## 3. Plugin anatomy

Accepted export shapes (registry.md:58-121):

```ts
type Plugin = Function | Constructor | Object
// Function: (ctx, config) => any   — the common form
// Constructor: new (ctx, config) => any  — use when providing a service
// Object: { apply(ctx, config) }   — also fine (e.g. export default { name, apply })
// Base: { name?, Config?, inject?, provide?, intercept? }
```

Harness idiom (user/develop/basic/index.md:17-27):

```js
export const name = "my-plugin"          // display metadata (optional)
export function apply(ctx, config) { … } // framework calls apply on load
```

- `ctx.plugin(plugin, ...args)` loads a plugin; awaiting settles once loading
  finished, rejecting on config/startup errors (registry.md:35-56).
  `ctx.inject(deps, cb)` runs a callback when services are available
  (registry.md:8-33).
- Load failure is LOUD: "A plugin that fails to load is a loud failure, not a
  skipped entry" (tutorial 01:81-89).
- `Inject = string[] | { [key]: interceptConfig }` — array for plain deps,
  object to pass intercept config (registry.md:123-152).
- Declaration merging for typed vocabulary:
  `declare module '@deepseek-ai/cordis' { interface Context {…} interface Events {…} }`
  (tutorial 03:14-18; tutorial 04:14-21).

## 4. Config contract

```ts
export interface Config { greeting: string; maxRetries: number; verbose?: boolean }
export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
  maxRetries: Schema.number().default(3),
  verbose: Schema.boolean().default(false),
})
```

(user/develop/basic/config.md:9-45; tutorial 05:9-51)

- "When loading the plugin, Cordis uses the exported schema to validate
  configuration and fill defaults" (config.md:45). "Invalid configuration
  fails the load with an actionable error" (config.md:74; `ValidationError`
  from StandardSchema issues, fiber.md:357-375). Never export a plain object
  as `Config` (config.md:45; tutorial 05:34).
- **Every tunable is a config field** — test: "whether `cordis.yml` can
  change the value without a code edit" (config.md:76-92). Express
  self-contained constraints in the schema; constraints referencing services
  require DI (config.md:94-96).
- Volatile cells: `Schema.string().default('X').volatile()` → read with
  `config.x.get()`; volatile-only edits commit without remounting
  (tutorial 05:70-95). Config catalog: `docs/config-catalog.md`.
- `!!js` expressions allowed only inside `config` and `disabled`
  (tutorial 05:97-107).
- Config edits hot-replace the plugin: unload old instance (effects unwind),
  load new one (config.md:98-100; framework/index.md:99-107).

## 5. Services

- Service base class: subclass calls `super(ctx, name)`; registered
  immediately, removed with its fiber (cordis-api/service.md:1-12). Static
  hooks: `init`, `check`, `invoke` (callable services like `ctx.logger()`),
  `extend`, `tracker` (service.md:25-101).
- Class plugin: `export default class X extends Service { static inject = ['tools']; constructor(ctx) { super(ctx, 'x') } }`
  (user/develop/framework/service.md:38-85).
- `ctx.provide(name, value): () => void` — owned by the fiber; throws if the
  name is already provided in scope (context.md:286-314). `ctx.get(name,
  strict?)` / `ctx.set(name, value)` (context.md:237-284).
- Dependency tracking: a plugin with `inject` stays PENDING until every
  service exists — load order in cordis.yml does not matter (tutorial
  03:59). If a required service disappears, dependents unload and reload
  when it returns (tutorial 03:76-78). Optional dep: skip inject, probe
  `ctx.get('x')` (tutorial 03:82-90).
- Registering NO service is a legitimate archetype: "`dsh-fs-observation-policy`
  registers no service — it adds policy through the `fs/*` event gate"
  (filesystem.md:278).

## 6. Fibers & effects

- "A fiber is one loaded plugin instance: lifecycle state, validated config,
  registered effects" (fiber.md:6). State machine: `PENDING → LOADING →
  ACTIVE → UNLOADING → DISPOSED` (tutorial 02:70-80). PENDING = a required
  service is missing; FAILED = apply/config threw.
- `ctx.effect(execute, label?)` — execute runs immediately; collected
  disposers run in reverse registration order on unload; async disposers run
  concurrently, so keep order-dependent cleanup inside ONE disposer
  (fiber.md:8-37, 276-309; framework/index.md:63).
- HMR: `dsh-hmr` watches files; the old instance unloads (all effects
  unwind), new code loads, apply runs again (tutorial 06:23-59). Stable
  `id`s in patch rows are required so config edits diff correctly — an entry
  without one gets a generated id and remounts on every edit.
- Anything raw (timers, watchers, connections, child processes) must be
  wrapped in `ctx.effect(() => disposer)` — module-level side effects are not
  unwound (tutorial 02:5, 84-92).

## 7. Tools

```ts
ctx.tools.register(defineTool({
  name: 'greet', description: '…',
  parameters: { name: { type: 'string', required: true, description: '…' } },
  output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
  async execute(args, exec) { return `Hello, ${args.name}!` },
}))
```

(user/develop/basic/tool.md:11-36; cookbook/adding-a-tool.md:9-38)

- `defineTool` infers/validates args; `execute` returns ONE canonical JSON
  value per `output.schema`; `output.render` converts it to model-facing
  content (tool.md:36). Registration is readonly — never mutate after
  registration (adding-a-tool.md:43). Honor `exec.signal` (adding-a-tool.md:49).
- Pipeline order: `tools/pre-execute` (allow/deny/ask) → `ctx.tools.guard()`
  (monotonic) → `tools/execute` (around-dispatch) → `projectContent` →
  `tools/post-execute` (replace content OR value, never both) →
  `finalizeContent` → `tools/result` (immutable observation)
  (subsystems/tools.md:182; tool-execution-pipeline.md:6,63).
  Decisions: `PreToolDecision` / `PostToolDecision` (tools.md:400-430).
- Selection rule: guard for monotonic invariants, `tools/execute` to wrap
  dispatch lifetime, `tools/post-execute` for result transformation,
  `tools/result` for contained observation (extension-cookbook.md:33).
- Presenters are PURE (live AND replay: no I/O, no session state, no
  clock/random) (adding-a-tool.md:67-91).

## 8. Performance & pressure rules

- The hardest rule: "`fs/observed` is a fire-and-forget recording event … its
  listener MUST be synchronous and side-effect-only, because the tool does
  NOT guard the emit — a throwing listener can replace a read error or
  surface as the tool's `isError` after a mutation already succeeded"
  (filesystem.md:185; 490-509: "Listeners must be synchronous recorders:
  throws fail the tool call and returned promises are not awaited").
- The official policy listener performs NO fs I/O — it records into a
  WeakMap; real work happens in decision waterfalls (filesystem.md:242).
- Background work: `ctx.jobs.start({ kind, label, owner: exec.agent, run })`
  with a task-owned cancellation signal — never block an emit listener
  (adding-a-tool.md:51-55). Throttle/debounce via `ctx.timer` helpers;
  throttling triggers must be config fields (inherited.md:19;
  session-projection.md:120).
- Contain listener exceptions: "one bad subscriber never breaks core
  lifecycle" (defensive-patterns.md:23-25).
- Durable facts go through the logger/session events, not ad-hoc listener
  writes ("Model-visible means logged", architecture.md:127).

## 9. Packaging & activation

- Bundle = npm package shipping a config layer: `"dsh": { "bundle": { "patch":
  "./cordis.patch.yml" } }`; patch may be an ordered list (publish.md:33-64).
- Patch rows: `- insert:` inserts NEW rows; later layers override EARLIER
  rows by `id`, replacing the ENTIRE `config` (not deep-merging) — an
  override must restate every key (publish.md:129-131). `disabled: true`
  unmounts without deleting (tutorial 06:19). A bare `id:` row against an
  unknown id fails: `entry "<id>" not found` (verified live).
- Profile = `$DSH_HOME/profiles/<name>` with `dsh.profile.bundles` +
  dependencies; its own `cordis.patch.yml` applies after every bundle layer
  (publish.md:68-73, 85-100). Layer order: bundles (in order) → profile
  patch → `$DSH_HOME/cordis.patch.yml` → `--patch` overlays (publish.md:118-134).
- Install: `dsh plugin --profile <name> add <path|tarball|npm>` (forwards to
  pnpm); a package without `dsh.bundle` installs as a plain dependency with
  no layer (publish.md:64). Activation at boot; verify with
  `dsh --profile <name> --dump-config` (publish.md:109-114).
- peerDependencies: declare dsh packages shared with the host under BOTH
  `peerDependencies` and `devDependencies`; independent third-party deps
  under `dependencies` (publish.md:103). NOTE (verified live 2026-10-03):
  the `@deepseek-ai/*` runtime resolution comes from the installation scope,
  so peers can be DROPPED safely for local bundles — and dropping the
  `@deepseek-ai/dsh` peer removes the boot-time compat-gate skip risk.
- Git installs fetch sources, not builds: ship a `prepare` script and require
  an `allowBuilds` entry, or publish built `lib/`, or ship a tarball
  (publish.md:159-184).
- DEV LOOP (verified live 2026-10-03): install the bundle as a DIRECTORY
  link (`dsh plugin add ./<dir>` — pnpm `link:` spec, node_modules becomes a
  symlink to the checkout) — every rebuild is fresh on the next restart, no
  repack/bump/reinstall. CAVEAT: pnpm does NOT auto-install a linked
  package's dependencies — the linked checkout must carry its own
  `node_modules` (`pnpm install --ignore-workspace` inside it) or the entry
  load fails silently (no activation line).
- Manager API: `ctx.pluginManager.installBundle(spec, {enabled, approvedBuilds,
  registry})`, `setBundleEnabled`, `removeBundle`; ChangeResult.application:
  `applied | restart-required | overridden | failed` (subsystems/boot.md:132-177).
- The plugin-manager reinstall of the SAME version tarball is a pnpm no-op
  (`ambiguous-install`) — bump the version, or keep the lockfile's previous
  tarball on disk or the install errors ENOENT on the pinned path.

## 10. Well-integrated plugin checklist (15 items)

1. Single entry with named exports (`name` + `apply`, optional `Config`/`inject`/class).
2. Required services declared via `inject` — never rely on load order.
3. Real `Config` schema (Schemastery/Standard Schema), defaults on fields, fail-loud.
4. Every tunable is a config field (the cordis.yml test).
5. All registrations through `ctx` are effects; raw resources wrapped in `ctx.effect`.
6. Order-sensitive teardown inside ONE disposer.
7. Waterfall discipline: observers call `next()`; only decision-owners short-circuit.
8. `emit` listeners are synchronous recorders: no awaits, no throws; heavy work detached.
9. Capability I/O through the seams (`ctx.fs`+fs/*, `ctx.subprocess`, `ctx.sandbox`); never parse opaque ids (`targetKey`, `FsVersion`, `exec.token`).
10. Policy as listeners, not service calls (guard/execute/post-execute/result roles).
11. Tools via `defineTool`: typed parameters, one canonical value, pure render/presenters, readonly after registration, honor `exec.signal`.
12. Typed vocabulary via declaration merging (`Context`, `Events`).
13. `ctx.logger(name)`, never console.
14. Bundle packaging per publish.md (stable ids, defaults designed for override, peers+devDeps).
15. Idempotent under HMR: no module-level side effects; disposal complete before reload; stable row ids; load failure is loud.

## 11. Pitfalls catalog (verified on this machine)

1. `FsTarget` has NO `.path` — `{ targetKey, displayPath }`; `target.path`
   listeners never fire.
2. `fs/observed` payload is positional `(target, observation, actor)`; gate
   `observation.kind === "present"` AND the actor's tool name (reads emit
   present too).
3. Bare `- id:` patch rows fail with `entry not found` — use `- insert:`.
4. ncu's `-x/--reject` is ONE comma-delimited argument — separate argv
   entries become positional filters.
5. `ctx.emit` does NOT await listeners — contain async rejections.
6. Module-level import of an unresolvable package crashes the whole bundle
   load (schemastery in a bare profile graph).
7. Relative `import.meta.dirname/../..` from an installed copy resolves
   wrong — ship helpers inside the package, resolve via
   `new URL(..., import.meta.url)`.
8. Post-hoc rewrites must refresh the observation-policy's version record
   (re-emit `fs/observed` with a fresh token, same actor) or the author's
   next guarded write fails `FS_STALE_VERSION` — a notification leak.
9. `const Set = new Set()` is a TDZ ReferenceError — don't shadow globals
   (use `State.Set` or a different word).
10. The host PATH is not the user's shell PATH — child processes need
    absolute binary paths from config.
11. CJS-with-default packages (npm-check-updates): access `run` defensively
    (`Mod.run ?? Mod.default?.run`).
12. Verify activation via Inspect (`Config.listConfigs`) + a durable
    `activated (…)` ledger line written in `apply()` — never assume a
    restart activated the bundle.
13. Same-version reinstall is a pnpm no-op (`ambiguous-install`) — bump the
    version to force a real reinstall.
14. A THROW in an emit listener fails the tool call AFTER mutation — the
    catch-all suppression pattern (logger/ledger only) is mandatory.
15. `export default { name, apply }` SHADOWS the named exports — `inject`
    and `Config` MUST also be on the default object, or service accessors
    throw `cannot get property "fs" without inject` (verified live
    2026-10-03; a smoke that calls apply directly NEVER catches this).
16. NEVER `return` a value from `apply` — the loader treats apply return
    values specially; returning a State object silently killed event
    delivery (verified live 2026-10-03). Expose state via a context
    attachment (`ctx.__governorState = State`) for test probes instead.
17. `ctx.jobs` at ROOT needs a CONTROLLER, not an injection — the accessor
    throws `no job controller serves this agent` until the plugin attaches
    one: `ctx.jobs.attachController(name)` from an unscoped/root context
    "serves every owner" and `start({owner: undefined})` creates an unowned
    job (jobs.md:398, 42-46, 488-493 — REFUTED the earlier "agent-scoped"
    premise, 2026-10-03). The detached contained continuation is the probed
    fallback for deployments without a jobs service (sdk-minimal).
18. `ctx.fs.writeText` from a root plugin REQUIRES an explicit sandbox
    policy argument — without it the deployment default (workspace-write)
    denies paths outside the canonical workspace (`file access denied
    under workspace-write mode`). A governor whose own exclusion list is
    its fence passes `{ mode: "danger-full-access" }`.
19. The pnpm-workspace of the profile swallows `pnpm install` inside a
    bundle dir (`Already up to date`) — use `pnpm install --ignore-workspace`
    to give the linked checkout its own `node_modules`.

## 12. Documented gaps (don't over-document)

- No-schema config passes through unvalidated (docs only mandate schema export).
- `Plugin.Transform` has no worked example.
- Waterfall "Awaited? No" in the primer: awaiting happens through `next()`.
- Cooldowns are not a framework concept for listeners — throttle triggers
  are config-owned write-behind patterns.

## 13. References

- `docs/cordis-api/{events,context,fiber,registry,service}.md`
- `docs/user/develop/basic/{index,config,tool,publish}.md`
- `docs/user/develop/framework/{index,events,service}.md` (when present)
- `docs/event-producer-consumer.md`, `docs/capability-seams.md`,
  `docs/architecture.md`, `docs/defensive-patterns.md`, `docs/glossary.md`
- `docs/subsystems/{filesystem,tools}.md`, `docs/cookbook/{extension-cookbook,adding-a-tool}.md`
- Live template: `@local/dsh-hook-package-governor`
  (`~/.dsh/profiles/desktop/bundles/dsh-hook-package-governor/`).