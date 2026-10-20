# The Loader Contract (Every Plugin)

> Source: SKILL.md, Section 1 (The loader contract), rule 1.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every plugin's default export is a cordis plugin with exactly this
shape:

- `name` - the identity. The loader and the runtime resolve the plugin
  by it; it must agree with the package name (see
  ./references/identity-and-ledger-ownership.md).
- `apply` - returns NOTHING. A returned value silently kills event
  delivery.
- `Config` - a Schemastery schema. The loader validates it and fills
  defaults at load; invalid config fails LOUD.
- `inject` - the service list: the factory + fs + tools where needed.
  The loader's PENDING state orders the loads.

## Why: The Full Philosophy

1. **`apply` returning nothing is the family's hardest-won lesson.** A
   cordis plugin's `apply` that returns a value is interpreted as a
   disposer/lifecycle signal, and event delivery to the plugin stops -
   silently, with no error anywhere. Every `apply` in this family is
   therefore written to produce no return value at all, and the
   convention is stated here so no one "cleans it up" by adding a
   return.
2. **Config validation at load, failing LOUD.** The loader is the one
   moment the plugin's configuration is guaranteed to be inspected. A
   Schemastery schema enforced there means a bad config dies at boot
   with a named error, instead of producing undefined behavior hours
   later mid-session. Defaults live in the schema (`Variable/`), so
   "the schema is the documentation and the default source" is one
   artifact, not two.
3. **`inject` is the dependency declaration, not a convenience.** The
   loader's PENDING state holds a plugin whose services are not yet
   available and loads it once they are. Declaring `inject` precisely
   (the factory, fs, tools - only what the plugin needs) is what makes
   the boot order deterministic. Undeclared dependencies or greedy
   injection break the ordering the loader relies on.
4. **The default export IS the contract surface.** The factory's
   loader, the profile bundle activation, and the smokes all bind to
   the default export's shape. Any extra or missing member is a
   contract violation even if the plugin "works".

## Examples

### Good

```
export default definePlugin({
	name: 'hook-dsh-govern',
	apply(ctx) {
		// registers, wires, returns nothing
	},
	Config: Schema.object({ ... }),
	inject: ['dsh.factory', 'fs'],
})
```

### Bad

```
apply(ctx) {
	return () => { ... }        // returned disposer: event delivery dies
}
inject: ['dsh.factory', 'fs', 'everything-else']  // greedy injection
Config: undefined               // no validation, no defaults
```

## Exceptions

- None. All four members are mandatory for family plugins. A plugin
  with no configurable behavior still ships a `Config` schema (it may
  be an empty object schema) so the load-time validation surface stays
  uniform.

## Failure Modes

- **The silent killer:** adding `return` to `apply` (often as a
  cleanup function). Cost: the plugin stops receiving events with no
  error; the failure is discovered only by behavior, and the smoke
  harness must be checked first for the same symptom (see
  ./references/vacuously-green-trap.md).
- **Config that trusts runtime defaults:** validating lazily or
  defaulting after load. Cost: bad configs boot "successfully" and
  corrupt behavior later.
- **Missing inject entries:** the plugin loads before its service and
  reads `undefined`. Cost: a race that reproduces only under real
  boot-order conditions - exactly what the smokes do not cover (see
  ./references/smokes-prove-mechanics.md).

## Arbiters

- The bundle's smoke suite loads the REAL built Target through the
  fake ctx + real factory and would fail on a non-conforming default
  export (see ./references/smoke-arbiter.md).
- Type-check: `tsc -p tsconfig.json` in the deterministic build fails
  the build on a shape drift (see ./references/deterministic-build.md).
- Review: any diff touching `apply`'s return path is flagged by
  default.
