# @playform/ets-hook-dsh-package-pinner

*The DeepSeek Harness Plugin Family for PlayForm.*

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fets-hook-dsh-package-pinner&color=blue)](https://www.npmjs.com/package/@playform/ets-hook-dsh-package-pinner)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/ets-hook-dsh-package-pinner)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **silent version pinner** of the DeepSeek Harness - a plugin on the
> [`fs/observed`][dsh-fs] event that
> pins every dependency version in a written `package.json` to its STATIC version:
> `"@playform/build": "^0.3.4"` becomes `"0.3.4"`.
>
> One leading range prefix (`^`, `~`, or `=`) is
> stripped, in every dependency section the config declares - and the author never learns.
>
> *A factory flavor: pure P-only - no ncu, no jobs, no subprocess, no cooldown.*
>
> *Just the pin.*
>
> *The
> @-sentence identity: **Hook @ DSH @ Pinner @ Package**.*

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Pinner @ Package**): a hook child of the
[`ets-plugin-dsh-factory`](../ets-plugin-dsh-factory) service and the [`ets-hook-dsh-core`](../ets-hook-dsh-core)
helpers; a sibling of the package governor on the same
[`fs/observed`][dsh-fs] seam.

One of three governance hooks sharing the
[`fs/observed`][dsh-fs] seam, each gating on its own basename and
writing its own ledger:

| plugin                                                      | basename gate  | ledger                          | pass                                                 |
| ----------------------------------------------------------- | -------------- | ------------------------------- | ---------------------------------------------------- |
| [`ets-hook-dsh-package-governor`](../ets-hook-dsh-package-governor) | `package.json` | `ets-hook-dsh-package-governor.log` | chain pass (→ `^resolved`) + update stage (ncu)      |
| [ets-hook-dsh-package-pinner][ours-ets-hook-dsh-package-pinner] (this bundle)                     | `package.json` | `ets-hook-dsh-package-pinner.log`   | pin pass (`^0.3.4` → `0.3.4`; keep-list wins)        |
| [`ets-hook-dsh-cargo-governor`](../ets-hook-dsh-cargo-governor)     | `Cargo.toml`   | `ets-hook-dsh-cargo-governor.log`   | chain pass (bare caret / `=exact`) + `cargo upgrade` |

Composition semantics: **pin → bump-exact** (the pinner pins `^0.3.4` → `0.3.4`; a fully pinned
manifest then leaves the governor's update stage nothing to do, while its chain pass may still
re-canonicalize chain pins), **keep-list wins** (the pinner's [pin-policy.json][ours-transform] keeps ranges as
authored).

The ledgers are separate (`ets-hook-dsh-package-pinner.log` vs
`ets-hook-dsh-package-governor.log`); activating one never implies another - order between two npm
listeners is defined only by registration.

Machinery-wise it is a **factory flavor**: `inject: ["fs", "pluginFactory"]`

- the gate, the discovery, the union keep-list, the guarded write, the refresh, the continuation,
  the effects and the schema come from [`ets-plugin-dsh-factory`](../ets-plugin-dsh-factory); the refusal
  guard and the suppression composer come from [`ets-hook-dsh-core`](../ets-hook-dsh-core). This bundle
  keeps the module leaf: the range law (Function/Pin), the decode, and every ledger string. Besides
  the
  [`fs/observed`][dsh-fs] event path, its chain pass is registered with the factory's direct-govern
  registry at apply (`Factory.RegisterGovern("package.json", "pin", …)` — factory SCHEME.md §2.16),
  so the `raw-write` tool's per-call `govern` selection can drive the same pin pass directly through
  [Factory.Govern](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-plugin-dsh-factory/Source/Function/Govern.ts) (Function/Direct — same machinery, same ledger strings).

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

### Install

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/ets-hook-dsh-package-pinner`
   in the profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Local git clone:** clone → `pnpm install --ignore-workspace` (the bundle carries its own
   node_modules) → `npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` →
   `dsh plugin --profile <name> add <this directory>`.
3. **Native dsh install:**
   `dsh plugin --profile <name> add ./local-ets-hook-dsh-package-pinner-<v>.tgz`.

All three end the same way: the loader activates the entry from `Target/`, [cordis.patch.yml][ours-cordis-patch]
inserts the [ets-hook-dsh-package-pinner][ours-ets-hook-dsh-package-pinner] row, and the ledger logs `activated (pinner, ...)` at the next
host start.

CAVEAT (verified live): pnpm does NOT auto-install a linked package's dependencies - the
linked checkout must carry its own `node_modules` or the entry load fails silently (no activation
line).

### Usage

The bundle is configured through its [cordis.patch.yml][ours-cordis-patch] row (or the profile's `dsh.bundle`
manifest) - the full config block is in [The Config](#the-config):

```yaml
- insert:
      - id: ets-hook-dsh-package-pinner
        name: "@playform/ets-hook-dsh-package-pinner"
        config:
            log: true
            logFile: ~/.dsh/ets-hook-dsh-package-pinner.log
            sections: [dependencies, devDependencies, peerDependencies, optionalDependencies]
```


The shared Effect-TS plumbing - the runtime wiring, the stream machinery and the hook contract types - comes from the base [`ets-dsh-hook`](../ets-dsh-hook) package.

---

## The Problem

Ranged versions make builds drift: `"^0.3.4"` today is `"0.3.5"` next week.

Teams that want
reproducible installs want static versions - but writing them by hand (or remembering to) is exactly
the kind of discipline an agent workflow loses.

The pinner makes static versions the default outcome
of every write, invisibly.

---

## How It Works

**`The pipeline P = Rewrite ∘ Pin ∘ Resolve ∘ Decode`**

```text
  fs/observed (target, {kind:"present", version}, actor)
  ── fired by the TOOL LAYER ONLY, for every harness write/edit, any thread ──►
       │
       ▼
  G1  Factory.Gate ── displayPath → actor ∈ mutationTools → kind "present" →
  │                    Stash idempotence → basename "package.json" → excluded?
  │     excluded ──► ledger `skipped (excluded) <path>`   (every other gate
  ▼                  outcome is silent)                      outcome proceeds)
  G2  Factory.Discover ── nearest registry.json walk-up (an exempt plain-fs
  │     probe - it exists ONLY as a location for the co-located
  │     pin-policy.json); Stash seed (targetKey, version)
  ▼
  g3  PIN PASS  (detached, contained - Factory.Continue; the listener never
  │     awaits) ── ctx.fs.readText → union keep-list (ResolvePolicy: global
  │     policyFile → the file's own directory → registry-adjacent → built-in
  │     default) → Decode (JSON.parse, null on failure) → the RANGE LAW
  │     (Function/Pin - ONE leading ^/~/= stripped per dep) → the REFUSAL
  │     GUARD (core's Refusal) → GuardedWrite (replaceIfVersion + the P4
  │     fence) → ledger `pinned <path> (<N> versions)` → Refresh (P3
  │     re-emit, same actor)
  ▼
  SILENCE: the tool result shows exactly what the author wrote.
  The pinned state is discoverable only by a subsequent read - or in
  the ledger.
```

The **range law** (the transform, exactly) - for each dependency value (after the keep-list gate),
in order:

| #   | Condition                         | Action                       | Examples                                                                                                                                  |
| --- | --------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | not a string                      | untouched                    | `"foo": {"imports": ...}`                                                                                                                 |
| 2   | first char not in {`^`, `~`, `=`} | untouched                    | `"0.3.4"`, `"1.2.3-rc.1"`, `"*"`, `""`, `">=1.0.0"`, `"workspace:*"`, `"file:../x"`, `"link:..."`, `"git+https://..."`, `"npm:pkg@1.0.0"` |
| 3   | whitespace in value               | untouched                    | `"^1.0.0 \|\| 2.0.0"`, `"^1.0.0 <2.0.0"`                                                                                                  |
| 4   | otherwise                         | strip the one leading prefix | `"^0.3.4"` → `"0.3.4"`, `"~1.2.3"` → `"1.2.3"`, `"=2.0.0"` → `"2.0.0"`                                                                    |

- **Idempotent**: an already-static version has no leading prefix, so rule 2 passes it through -
  pinning a pinned file is a no-op rewrite (the ledger shows `no changes to pin for ...`).
  `P(P(c)) = P(c)`.
- **Keep-list policy**: a [pin-policy.json][ours-transform] (`{ "keep": ["tailwindcss"] }`) protects packages whose
  ranges must stay EXACTLY as the author wrote them; the effective keep-list is the **union** of
  every readable discovered policy, and the P3 chain-keys interlock means the governor's `^resolved`
  chain pins are never stripped. A file that exists but does not parse is logged
  (`unreadable pin-policy.json at ... - using built-in default`) and contributes nothing.
- **Documented edge decision**: `"^1.*"` IS stripped to `"1.*"` - the law strips the notation (the
  prefix) and leaves the content untouched; protect wildcards with the keep-list if you need them
  preserved.
- **Refusal guard**: non-dependency sections (`name`, `version`, `description`, `scripts`, ...) are
  NEVER touched - if the pinner's own logic would ever change one, the rewrite is REFUSED and logged
  (`REFUSED rewrite of ...`) instead of applied.
- **Version coherence**: the rewrite carries `replaceIfVersion` at the observed version; a racing
  author write makes it fail safely (no clobber), and the service-issued fresh version is re-emitted
  with the same actor so the author's next guarded write never fails `FS_STALE_VERSION`. The re-emit
  re-enters this listener; the Stash token gate makes it a no-op.

### The Source Layout

TypeScript-first, built with `@playform/build` (ESBuild + tsc type-check):

```text
ets-hook-dsh-package-pinner/
├── Source/                  ← TypeScript (NOT shipped)
│   ├── Library.ts           ← entry: name / apply / Config / inject
│   │                          + default { name, apply, Config, inject }
│   ├── Function/            ← the module leaf - Apply.ts (thin wire-up),
│   │                          Observe.ts (thin listener), Transform.ts
│   │                          (the range law), Pin.ts, Direct.ts (the
│   │                          direct-govern driver), Decode.ts
│   ├── Interface/           ← typed contracts (State, Factory, Manifest, ...)
│   └── Variable/            ← constants, defaults, the Config schema
├── Configuration/
│   └── ESBuild.ts           ← the @playform/build custom config (+ .js twin)
├── Target/                  ← built output (SHIPPED: .js + .d.ts)
├── cordis.patch.yml         ← the loader row (name: the package identity)
├── package.json             ← main → Target/Library.js
└── README.md / SCHEME.md    ← usage + the design document
```

The published artifact contains **only the built output** - `files` whitelists `Target/`,
[cordis.patch.yml][ours-cordis-patch], and the docs; `Source/` never ships.

There are no `build`/`watch` npm scripts:
the only npm script is `prepublishOnly`
(`Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts --TypeScript Configuration/TypeScript.noemit.json && tsc -p tsconfig.json && tsc-alias -f -p tsconfig.json`).

### The Hard Lessons

1. **`inject` and `Config` must sit on the DEFAULT export object** - the loader builds the fiber
   from the default object; named-only exports are shadowed and service accessors throw
   `cannot get property "fs" without inject`.
2. **`apply` must return nothing** - a returned value silently kills event delivery. Test probes
   read the state through the `__pinnerState` context attachment.
3. **`ctx.fs.writeText` from a root plugin needs an explicit sandbox policy**
    - the deployment default (`workspace-write`) denies paths outside the canonical workspace; the
      pinner passes `{ mode: "danger-full-access" }` because its own exclude list IS its fence.

---

## The Config

The exported `Config` schema (the factory's `Schema` helper extended with `sections`) validates and
fills every default at load - invalid configuration fails loudly.

New patch entries are declared
with `insert:`.

```yaml
- insert:
      - id: ets-hook-dsh-package-pinner
        name: "@playform/ets-hook-dsh-package-pinner"
        config:
            log: true
            logFile: ~/.dsh/ets-hook-dsh-package-pinner.log # SEPARATE ledger (own plugin)
            mutationTools: [write, edit, str_replace_editor, raw-write]
            policyFile: "" # optional global pin-policy.json (else discovery, else built-in)
            updateCooldownMs: 3000 # carried by the shared block, never read (no update stage)
            sections: [dependencies, devDependencies, peerDependencies, optionalDependencies]
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

---

## In Action

One pinned write.

The author drops a `package.json` with two ranged versions and a keep-listed
package nearby:

```json
{
	"name": "@acme/tool",
	"scripts": { "build": "tsc" },
	"dependencies": {
		"@playform/build": "^0.3.4",
		"tailwindcss": "^3.0.5",
		"@acme/core": "~1.2.3"
	}
}
```

A [pin-policy.json][ours-transform] (`{"keep":["tailwindcss"]}`) sits beside the file, so tailwindcss keeps its
range; the other two dependencies are pinned.

The transcript shows only what the author wrote; the
ledger shows the pin:

```text
[2026-10-03T09:15:22.411Z] activated (pinner, logFile=~/.dsh/ets-hook-dsh-package-pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])
[2026-10-03T09:16:01.880Z] pinned ~/Projects/acme/tool/package.json (2 versions)
```

Read the file back and `"@playform/build"` is `"0.3.4"`, `"@acme/core"` is `"1.2.3"`,
`"tailwindcss"` is still `"^3.0.5"`, and `"scripts"` is byte-identical.

Write the pinned file again
and the pass is a no-op with its own line: `no changes to pin for ...`.

Write inside
`node_modules`/`.git`/`.dsh` and the ledger gains `skipped (excluded) ...` while the file stays
untouched.

(A non-JSON `package.json` - or a refusal, if a non-dependency section would change -
gets its own line, e.g. `observed non-JSON package.json ... - skipped`, before the silence.)

---

## The Ledger

One global log (`logFile`, default `~/.dsh/ets-hook-dsh-package-pinner.log` - SEPARATE from the
governor's ledger) records activation, exclusions, non-JSON skips, refusals, and every pin result.

The strings this module composes (the ets-hook-dsh-package-pinner: logger prefix is the factory's
`Append`; each line is `[<ISO>] <message>` in the file):

```text
activated (pinner, logFile=..., sections=[...], exclude=[...])
skipped (excluded) <path>
observed non-JSON package.json <path>
pinned <path> (N versions)
no changes to pin for <path>
REFUSED rewrite of <path>: non-dependency section "<name>" would change
```

(The non-JSON line ends with an em dash followed by `skipped` - part of the literal string, so its
byte-exact form appears only in the In Action excerpt above.)

The activation line is written by `apply()` - "did it activate" must be answerable from the ledger
alone.

---

## License 📜

CC0-1.0.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[ours-ets-hook-dsh-package-pinner]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-package-pinner/Source
[ours-transform]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-package-pinner/Source/Function/Transform.ts
[ours-cordis-patch]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-package-pinner/cordis.patch.yml
