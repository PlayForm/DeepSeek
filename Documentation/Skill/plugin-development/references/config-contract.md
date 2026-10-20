# The Config Contract: Schema, Validation, Tunables, Volatile, Hot-Replace

> Source: SKILL.md, section 4 "Config contract". Sources:
> user/develop/basic/config.md:9-45, 45, 74, 76-92, 94-96, 98-100;
> tutorial 05:9-51, 34, 70-95, 97-107; fiber.md:357-375;
> framework/index.md:99-107.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Export a real schema, not a plain object:

```ts
export interface Config { greeting: string; maxRetries: number; verbose?: boolean }
export const Config: Schema<Config> = Schema.object({
	greeting: Schema.string().default('Hello'),
	maxRetries: Schema.number().default(3),
	verbose: Schema.boolean().default(false),
})
```

- "When loading the plugin, Cordis uses the exported schema to validate
  configuration and fill defaults" (config.md:45). "Invalid configuration
  fails the load with an actionable error" (config.md:74; `ValidationError`
  from StandardSchema issues, fiber.md:357-375). Never export a plain
  object as `Config` (config.md:45; tutorial 05:34).
- **Every tunable is a config field** - the test: "whether `cordis.yml` can
  change the value without a code edit" (config.md:76-92). Express
  self-contained constraints in the schema; constraints referencing
  services require DI (config.md:94-96).
- Volatile cells: `Schema.string().default('X').volatile()` - read with
  `config.x.get()`; volatile-only edits commit WITHOUT remounting the
  plugin (tutorial 05:70-95). Config catalog: `docs/config-catalog.md`.
- `!!js` expressions are allowed ONLY inside `config` and `disabled`
  (tutorial 05:97-107).
- Config edits hot-replace the plugin: the old instance unloads (its
  effects unwind), then the new one loads (config.md:98-100;
  framework/index.md:99-107). See ./references/fibers-and-effects.md.

## Why: The Full Philosophy

1. The schema is the plugin's public configuration surface: validation,
   defaults, and UI editing all derive from it. A plain-object `Config`
   gives none of that - the load proceeds unvalidated and every typo in
   `cordis.yml` becomes a silent misconfiguration (documented gap: see
   ./references/documented-gaps.md).
2. Fail-loud validation turns bad config into an actionable error at load
   time instead of a wrong behavior at 2 a.m. This is the same philosophy
   as the loud load failure (see ./references/plugin-anatomy.md).
3. "Every tunable is a config field" is the anti-hardcoding law. The test
   is operational: could an operator change this value in `cordis.yml`
   without a code edit? If not, it is not a tunable - it is a constant,
   and constants belong in code where review can see them.
4. Constraints split by kind: a constraint that can be checked from the
   value alone (a range, a pattern) belongs in the schema; a constraint
   that needs other services (e.g. "this path must exist") requires
   dependency injection, because the schema validator has no service
   access.
5. Volatile cells exist for values that operators change to steer a running
   system (thresholds, feature switches) where remounting the plugin would
   be more disruptive than the edit itself. The `config.x.get()` accessor
   is the trade-off's price: the value is read at use time, not captured at
   load.

## Examples

### Good

```ts
export const Config = Schema.object({
	maxRetries: Schema.number().default(3),
	exclude: Schema.array(Schema.string()).default([]),
	strictMode: Schema.boolean().default(false).volatile(),
})
```

### Bad

```ts
// Plain object masquerading as a schema:
export const Config = { greeting: 'Hello', maxRetries: 3 }
```

```ts
// Hardcoded tunable (fails the cordis.yml test):
const THROTTLE_MS = 500 // should be a config field
```

## Exceptions

- Volatile-only edits skip remount by design - the exception to the
  "config edits hot-replace the plugin" rule, and only for cells marked
  `.volatile()`.
- `!!js` inside `config` and `disabled` is the only sanctioned expression
  escape hatch; anywhere else it is out of contract (see
  ./references/packaging.md for the patch-row context).

## Failure Modes

- Unvalidated pass-through: with no schema, config errors surface as
  runtime undefineds instead of load-time validation errors.
- Constants in code that operators need to change: every change requires a
  release.
- Reading volatile values once at load: the whole point of volatile is that
  edits apply without remount; caching the read defeats it.
- `!!js` outside `config`/`disabled`: rejected or silently misread by the
  loader.

## Arbiters

- Review: `export const Config` is a real `Schema.object` with defaults on
  every field (checklist item 3, see ./references/checklist.md).
- The cordis.yml test (item 4): name a config change an operator would
  want; if it needs a code edit, fail.
- Load test: feed invalid config and assert a `ValidationError`-flavored,
  actionable load failure.
