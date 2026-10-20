# Packaging and Activation: Bundles, Patches, Profiles, Layers, Installs

> Source: SKILL.md, section 9 "Packaging & activation". Sources:
> publish.md:33-64, 68-73, 85-100, 103, 109-114, 118-134, 159-184; tutorial
> 06:19; subsystems/boot.md:132-177; live verifications dated 2026-10-03.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

- Bundle = npm package shipping a config layer:
  `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`; the patch may be
  an ordered list (publish.md:33-64).
- Patch rows: `- insert:` inserts NEW rows; later layers override EARLIER
  rows by `id`, replacing the ENTIRE `config` (not deep-merging) - an
  override must restate every key (publish.md:129-131). `disabled: true`
  unmounts without deleting (tutorial 06:19). A bare `id:` row against an
  unknown id fails: `entry "<id>" not found` (verified live).
- Profile = `$DSH_HOME/profiles/<name>` with `dsh.profile.bundles` +
  dependencies; its own `cordis.patch.yml` applies after every bundle layer
  (publish.md:68-73, 85-100). Layer order: bundles (in order) -> profile
  patch -> `$DSH_HOME/cordis.patch.yml` -> `--patch` overlays
  (publish.md:118-134).
- Install: `dsh plugin --profile <name> add <path|tarball|npm>` (forwards to
  pnpm); a package without `dsh.bundle` installs as a plain dependency with
  no layer (publish.md:64). Activation is at boot; verify with
  `dsh --profile <name> --dump-config` (publish.md:109-114).
- peerDependencies: declare dsh packages shared with the host under BOTH
  `peerDependencies` and `devDependencies`; independent third-party deps
  under `dependencies` (publish.md:103). NOTE (verified live 2026-10-03):
  the `@deepseek-ai/*` runtime resolution comes from the installation scope,
  so peers can be DROPPED safely for local bundles - and dropping the
  `@deepseek-ai/dsh` peer removes the boot-time compat-gate skip risk.
- Git installs fetch sources, not builds: ship a `prepare` script and
  require an `allowBuilds` entry, or publish built `lib/`, or ship a
  tarball (publish.md:159-184).
- Manager API: `ctx.pluginManager.installBundle(spec, {enabled,
  approvedBuilds, registry})`, `setBundleEnabled`, `removeBundle`;
  ChangeResult.application: `applied | restart-required | overridden |
  failed` (subsystems/boot.md:132-177).
- Same-version reinstall of a tarball is a pnpm no-op
  (`ambiguous-install`) - bump the version, or keep the lockfile's previous
  tarball on disk or the install errors ENOENT on the pinned path.
- DEV LOOP (verified live 2026-10-03): install the bundle as a DIRECTORY
  link (`dsh plugin add ./<dir>` - pnpm `link:` spec, node_modules becomes a
  symlink to the checkout) - every rebuild is fresh on the next restart, no
  repack/bump/reinstall. CAVEAT: pnpm does NOT auto-install a linked
  package's dependencies - the linked checkout must carry its own
  `node_modules` (`pnpm install --ignore-workspace` inside it) or the entry
  load fails silently (no activation line).

## Why: The Full Philosophy

1. A bundle is "code + config layer": the plugin ships not just JavaScript
   but a declarative patch that mounts its plugins. This is why packaging
   bugs (bad row ids, missing keys) manifest as activation problems, not
   import errors.
2. The whole-config-replace override rule exists so a layer's intent is
   unambiguous: an override states exactly the config it wants. Deep
   merging would make layered systems order-dependent in unreadable ways.
   The price is the "restate every key" discipline.
3. Layer order is the precedence contract: earlier layers are base, later
   layers refine. Knowing the four-step order tells you which file wins
   when two layers disagree.
4. The dev loop trades packaging ceremony for iteration speed: a directory
   link means the checkout IS the installed bundle. Its caveat (pnpm does
   not install linked deps) is the classic silent-failure trap - no
   activation line, no error.
5. Same-version reinstall being a no-op protects against accidental
   downgrades but surprises developers iterating on tarballs; the version
   number is the cache key.

## Examples

### Good

```yaml
# cordis.patch.yml - inserts new rows with stable ids:
- insert:
  - id: my-plugin/main
    plugin: ./lib/index.js
    config:
      greeting: Hello
```

```json
// package.json - the bundle declaration:
{ "dsh": { "bundle": { "patch": "./cordis.patch.yml" } } }
```

### Bad

```yaml
# Bare id: against an unknown id - fails with entry "<id>" not found:
- id: some-other-plugin/row
# Override that forgot a key - config replaced wholesale, key silently gone:
- id: my-plugin/main
  config:
    greeting: Hello   # maxRetries etc. now lost
```

## Exceptions

- Packages without `dsh.bundle` install as plain dependencies (no config
  layer) - legitimate for libraries, not for plugins.
- Peers for `@deepseek-ai/*` can be dropped for local bundles (verified
  2026-10-03) because runtime resolution comes from the installation
  scope; this is a documented deviation from publish.md:103's general rule.

## Failure Modes

- Override losing keys: config replaced, not merged - feature flags
  silently reset.
- Silent non-activation via the dev loop: missing `node_modules` in the
  linked checkout, no activation line, no error (pitfall 19 + 12, see
  ./references/pitfalls-catalog.md).
- Tarball iteration confusion: same version reinstall does nothing;
  ENOENT when the pinned tarball path is gone.
- Git-source installs without `prepare`/`allowBuilds`: install fails or
  ships unbuilt sources.

## Arbiters

- `dsh --profile <name> --dump-config`: the pack-time activation check
  (publish.md:109-114).
- Runtime: Inspect (`Config.listConfigs`) plus a durable `activated (...)`
  ledger line written in `apply()` (pitfall 12).
- ChangeResult.application status from the manager API is the programmatic
  arbiter for install/enable/remove outcomes (boot.md:132-177).
