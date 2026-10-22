---
name: plugin-system
description:
    "The DeepSeek Harness Plugin Family contract: the package inventory and roles, the loader
    contract and identity, the bundle anatomy and deterministic build, the factory-versus-module
    ownership split, the governance steps and the direct-govern channel, the EffectTS variant, and
    the ledger-string law."
whenToUse:
    Before writing, extending, or debugging any family bundle; when adding a package, a config
    field, a governance step, or a ledger string; when wiring bundles into a profile; when a build,
    an activation, or a ledger line behaves unexpectedly.
version: 2.0.0
updated: 2026-10-20
---

# The Plugin System

The family is one contract expressed twice: plain TypeScript in `Classic/` and Effect services in
`EffectTS/`. This skill states the contract both trees implement. The generic Cordis API is
`plugin-development`; the smoke discipline is `smoke-writing`.

## When to use

- Any change under `Classic/packages/` or `EffectTS/packages/`.
- Adding a bundle, a config field, a ledger line, or a governance step.
- Wiring a bundle into a profile (`dsh.profile.bundles`, `cordis.patch.yml`).
- Diagnosing an activation that did not happen, a build that failed, or a ledger line that is
  missing.
- Do not use for: the Cordis API itself (`plugin-development`) or writing and running smoke suites
  (`smoke-writing`).

## The inventory

Two release groups, one contract:

| Group    | Names                                                                                             | Runtime                          |
| -------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| Classic  | `@playform/lib-dsh-*`, `@playform/hook-dsh-*`, `@playform/plugin-dsh-*`, `@playform/client-dsh-*` | Plain TypeScript                 |
| EffectTS | `@playform/ets-*` (the base `ets-base-dsh` plus one twin per covered package)                     | Effect 4.0.5 services and layers |

51 Classic packages, 46 EffectTS packages — the original 14 plugins (plus `lib-dsh-core`) plus the
36 packages of the 2026-10-22 delivery (the workspace family, the suggesters, the orchestration set,
the client family) and 30 ETS twins. All at 0.1.0, all UNPUBLISHED. The full roster:
`Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md`.

The package roles:

| Role              | Packages                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Service           | `plugin-dsh-factory` (19 methods, `ctx.pluginFactory`)                                               |
| Machinery library | `lib-dsh-core` (not a plugin)                                                                        |
| Governance trio   | `package-governor`, `package-pinner`, `cargo-governor`                                               |
| Normalize family  | six stream flavors + `plugin-dsh-normalize-file`                                                     |
| Guardians         | `ccr`, `tool-coach`                                                                                  |
| Live blocks       | `live-containers` (ships disabled)                                                                   |
| Workspace         | the 15 workspace-family packages + `lib-dsh-workspace-live`                                          |
| Suggesters        | the seven `*-suggester` hooks                                                                        |
| Orchestration     | batch-edit, batchstate, gitguard, route, queue, feedback, pass-on, ingester, pattern, batch-decision |
| Client            | `client-dsh-panel-family`, `client-dsh-panel-family-host`, `client-dsh-workspace-live`               |

Verify the inventory:

```sh
ls Classic/packages EffectTS/packages
grep -h '"version"' Classic/packages/*/package.json
```

Never mix the groups in one dependency graph: the EffectTS `Update` returns Effect envelopes, not
the Classic dispatch envelope.

## The loader contract

Every plugin's default export carries exactly:

- `name` - the identity, agreeing with the package name;
- `apply` - returns nothing (a returned value silently kills event delivery);
- `Config` - a Schemastery schema, validated at load, failing loud;
- `inject` - the services it needs, so the loader's PENDING state orders the loads.

The identity lives in four agreeing places: the package name, the `name` export, the State build's
`module:` option, and the ledger logFile default.

## The bundle anatomy

```text
<bundle>/
  Source/
    Library.ts            the entry: name, apply, Config, inject
    Function/             the behavior, one definition per file
    Interface/            the types
    Variable/             the Config schema and defaults
  Configuration/
    ESBuild.ts            the build config
    ESBuild.js            the twin the build loader swaps to
    TypeScript.noemit.json
  Target/                 the build output (never hand-edited)
```

The tsconfig path aliases (`@Function/*`, `@Interface/*`, `@Variable/*`) are rewritten to relative
output paths by the build.

## The build

`prepublishOnly` runs, in order:

```text
Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts \
  --TypeScript Configuration/TypeScript.noemit.json
&& tsc -p tsconfig.json
&& tsc-alias -f -p tsconfig.json
```

A red `tsc` fails the build; there is no waiver. Rebuild the factory before any consumer: consumers
type-check against its built `Target/`. Workspace builds run serialized
(`--workspace-concurrency=1`) because the packages share Targets.

## The ownership split

- **The factory owns the shared machinery**: the ledger append, the storage journal, the write
  executor (fresh-stat version guard, fence, stash, root emit), the direct-govern fold, the gate,
  the continuation, the State builder, the wiring.
- **The modules own their leaves**: the transforms, the update engines, the gates and breaker maps,
  the ledger strings, the config extensions, and the docs. Modules are never absorbed into the
  factory.

## Governance and the direct path

Governance modules register their steps at apply. The steps run through the direct fold,
sequentially by default; a parallel marker is allowed only with proven disjointness.

The direct path is the `raw-write` tool's only governance channel:

1. The actor carries the `govern` marker.
2. The gate's `govern` reason skips the marked events.
3. An absent or false marker is the escape hatch: no chain.

There is no second channel.

## The EffectTS variant

The same contract behind Effect v4.0.5: a Cordis shell, Effect services and layers, and tracing that
defaults to no-op. The ledger strings are byte-identical to the Classic tree.

## The ledger-string law

Every activation line, refusal line, chain-pass line, and journal record is asserted
byte-identically. Rename mechanics, never strings. The one exception is an identity change by design
(a package rename), which changes that module's own strings and is recorded as a rename.

## Decision table

| Situation                            | Action                                             |
| ------------------------------------ | -------------------------------------------------- |
| New bundle                           | Copy the anatomy; wire the profile; add a smoke    |
| New config field                     | Schema in `Variable/`, README, site config surface |
| New ledger line                      | Module-owned string; smoke asserts it byte-exactly |
| New governance step                  | Register at apply; go through the fold             |
| Build fails in a consumer            | Rebuild the factory first, then serialized         |
| Plugin loaded but receives no events | Check `apply` for a return value                   |
| Ledger line missing                  | Check the four identity places and the logFile     |

## Verification

- The bundle's smoke suite passes at its recorded count (`smoke-writing`).
- The build chain is green, serialized, and the factory built first.
- The activation line appears in the ledger at boot.
- The ledger strings diff empty against the baseline.

## Anti-patterns

| Mistake                           | Cost                                  | Do instead                  |
| --------------------------------- | ------------------------------------- | --------------------------- |
| `apply` returns a disposer        | Event delivery stops silently         | Return nothing              |
| Consumer built before the factory | Stale-Target type errors              | Rebuild the factory first   |
| Parallel workspace builds         | Half-written Targets, phantom errors  | `--workspace-concurrency=1` |
| Factory owning a module's strings | Every module's output changes at once | Strings live in the module  |
| A second governance channel       | Unattributed mutations                | The `govern` marker only    |
| Mixing Classic and EffectTS       | Envelope mismatch                     | One group per graph         |

## References

| File                                     | Covers                                                 | Read when                       |
| ---------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| `references/inventory.md`                | The full package roster, roles, versions, and counts   | You need the family's shape     |
| `references/loader-and-identity.md`      | The loader contract and the four identity places       | Adding or renaming a plugin     |
| `references/bundle-and-build.md`         | Anatomy, build chain, activation, and patch rows       | Building or wiring a bundle     |
| `references/ownership-and-governance.md` | Factory versus module ownership, steps, direct path    | Adding a governance behavior    |
| `references/effectts-and-ledger.md`      | The EffectTS variant and the byte-identical ledger law | Touching ETS or a ledger string |
