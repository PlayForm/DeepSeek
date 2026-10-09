# @playform/ets-hook-dsh-core

*The DeepSeek Harness Plugin Family for PlayForm.*

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fets-hook-dsh-core&color=blue)](https://www.npmjs.com/package/@playform/ets-hook-dsh-core)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/ets-hook-dsh-core)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **pure machinery layer** of the DSH plugin family: the effect-backed, harness-free
> commonalities that both halves of the family are built from - the governance hooks' helpers
> (Section/Default/Suppress/Policy/Refusal, the update-stage envelope and the activation-line
> composer) and the stream-normalization family's tables and dispatch (six Normalize tables +
> Replace/ReplaceMap + Stream/Chunk/Block).
>
> *One runtime dependency: effect v4.0.2.*
>
> *Not a plugin - the muscle under the plugins.*
>
> *The
> @-sentence identity: **Hook @ DSH @ Core** - the machinery every other family package stands on.*

---

## Where It Fits

**Family position**: the base library of the whole family (the @-sentence **Hook @ DSH @ Core**) -
parent of none, child of none: one runtime dependency (effect v4.0.2), consumed by all eleven other
packages.

- **Consumed by the factory-era governance hooks** - the package.json governor, the pinner and the
  cargo governor import the helpers directly (`Suppress` in every listener's catch, `Policy` in the
  update engines, `Refusal` in the transforms, `Section`/`Default` as the state defaults). The
  [`ets-plugin-dsh-factory`](../ets-plugin-dsh-factory) re-exports NOTHING from the core (its 19-method
  service surface stays stable).
- **Consumed by the six stream normalizers** -
  [`ets-hook-dsh-normalize-dash`](../ets-hook-dsh-normalize-dash) and the five `ets-hook-dsh-normalize-*`
  flavors are each a table plus a closure over `Replace`/`ReplaceMap`, dispatched through
  `Chunk`/`Block`.
- The core is **not a plugin bundle**: no [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-plugin-dsh-factory/cordis.patch.yml), no loader contract, publishable on its
  own - consumers link it as a plain library dependency, not as a bundle row.

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/ets-hook-dsh-core
```

Not a bundle, so no `dsh plugin add` row: add the package as a plain dependency of whatever consumes
it (the command above, or the profile's `link:` dependency for the dev loop) and build it with the
same `prepublishOnly` sequence as the family bundles.

Consumers link it as a library dependency; the
bundles carry their own `node_modules` (`pnpm install --ignore-workspace` inside each - pnpm does
not install a linked package's dependencies).

### Usage

Named exports only - no plugin, no loader contract:

```js
import { Suppress, Refusal, Section, Default, Policy } from "@playform/ets-hook-dsh-core";
import { Replace, ReplaceMap, Dashes, Chunk } from "@playform/ets-hook-dsh-core";
```


The shared Effect-TS plumbing - the runtime wiring, the stream machinery and the hook contract types - comes from the base [`ets-dsh-hook`](../ets-dsh-hook) package.

---

## The Problem

The family's hooks kept re-implementing the same pure functions: the NPM section list, the exclusion
segments, the suppression-line composer, the policy loader, [the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-core/Source/Function/Refusal.ts) - and, for the
normalize flavors, the same per-chunk dispatch, block-end normalizer and character tables,
copy-pasted per flavor.

Every fix had to be applied N times.

The core makes each of them exist
**once**, importable by any consumer - inside the DeepSeek Harness or entirely outside it.

---

## How It Works

**`Two halves, one entry`**

```text
  @playform/ets-hook-dsh-core (named exports - no plugin, no loader contract)
     │
     ├─ GOVERNANCE HALF ────────────────────────────────────────────────► consumed by
     │    Variable/Section  the four NPM dependency sections             the factory-era hooks
     │    Variable/Default  the built-in exclusion segments              (governor-package,
     │    Suppress(module, kind, cause)  suppression-line composer        pinner-package,
     │    Policy(append, file, defaults, quiet?)  the policy loader       governor-cargo)
     │    Refusal(append, path, sections, current, next)  refusal guard
     │    Function/Update(deps) -> { Dispatch, Settle }  the update-stage
     │    envelope: the shared Dispatch/Settle pair - a new governance
     │    module's update stage reduces to a child runner plus strings
     │    Activate(fields)  the activation-line composer: the `activated (...)`
     │    proof line's string mechanics (prefix, `k=v` join with `, `,
     │    suffix, skip-absent); the field list stays module-side
     │
     └─ NORMALIZE HALF ─────────────────────────────────────────────────► consumed by
          Normalize/Dashes     the em/en/unicode dash class             the six stream
          Normalize/Quotes     curly → straight MAP (8 entries)          normalizers
          Normalize/Ellipsis   U+2026 class                              (normalize-dash, quotes,
          Normalize/Spaces     Zs-minus-ASCII class                       ellipsis, spaces,
          Normalize/Invisible  zero-width/format class                    invisible,
          Normalize/Fullwidth  FF01-FF5E → 21-7E MAP (94 entries)         fullwidth)
               │
               ▼
          Normalize/Replace      class → string, function replacer,
                                 per-call regex ("gu"), { text, count }
          Normalize/ReplaceMap   char → char MAP, keys as code-point
                                 escapes, function replacer, { text, count }
               │
               ▼
          Stream/Chunk     the generic per-chunk dispatch (text-delta,
                           reasoning-delta?, tool-call-delta?, block-end; everything else
                           passthrough by identity - count 0 keeps the
                           original chunk BY IDENTITY; the tool-args gate
                            is three-way with the flag on: `edit`,
                            `raw-write` and `normalize-file` calls pass
                            through BY IDENTITY (old_string must match real
                            file bytes; the raw-write tool owns its
                            content normalization through its explicit
                            `normalize` parameter; the normalize-file
                            tool's arguments carry a file path - a
                            normalized dash inside a filename would
                            corrupt the target) and a raw-marked call
                            (`{"__normalize":false` first-key marker,
                            tracked per call id and passed as `Raw`)
                            passes through UNNORMALIZED with the marker
                            stripped - see Stream/Strip)
          Stream/Block     the generic block-end normalizer (TextBlock
                           text; ReasoningBlock text + a runtime
                           thinking string field; ToolCallBlock
                           arguments? with the same
                            three-way gate (edit / raw-write / normalize-file
                            name-exempt / raw-marked); everything else
                           passthrough by identity)
```

The dispatch owns the **structure** (which fields of which chunk types); the flavor owns the
**substitution** - a new normalization flavor is a table plus a closure, not a fork of the dispatch:

```js
// an entire flavor's transform leaf:
Replace(Text, Dashes, Replacement); // class flavor
ReplaceMap(Text, Quotes); // map flavor
CoreChunk(Input, (Text) => Replace(Text, Dashes, "-"), Reasoning);
// + a 4th ToolArgs flag (default
// off) and a 5th Raw flag (the
// per-call `{"__normalize":false`
// marker state) for the tool-call
// cases
```

### The helpers, exactly

- **`Section`** - the canonical NPM dependency-section list (`dependencies`, `devDependencies`,
  `peerDependencies`, `optionalDependencies`): the default `Section` state-field value for the JSON
  governance modules.
- **`Default`** - the built-in EXCLUSION segments (`node_modules`, `.git`, `.dsh`, `.pnpm`,
  `.store`, `DeepSeek Harness.app`): the fence every JSON governance module applies when the config
  does not override `exclude`.
- **`Suppress(module, kind, cause)`** - the suppression-line composer:
  `` `${module}: ${kind} error (suppressed): ${cause}` `` (kind is `"listener"` or
  `"continuation"`) - the byte-identical line every contained throw produces (logger-only, never the
  ledger).
- **`Policy(append, file, defaults, quiet?)`** - the update-policy loader: read the policy file
  (plain fs, the discovery exemption) when given and readable; any failure falls back to the
  module's built-in `defaults` with the family's byte-identical diagnostic lines
  (`update: unreadable policy at ... - using built-in default`,
  `update: no policy at ... - using built-in default`, `update: using built-in default policy`). The
  `Quiet` form skips the diagnostics (a module reading the policy's fields to drive its chain pass
  BEFORE the update job).
- **`Refusal(append, path, sections, current, next)`** - the shared REFUSAL GUARD: only the declared
  dependency sections may differ from the author's manifest; a difference anywhere else composes the
  byte-identical refusal line
  (`REFUSED rewrite of <path>: non-dependency section "<name>" would change`) and returns `true`
  (the rewrite is never applied).
- **`Update(dependencies)`** - the UPDATE-STAGE ENVELOPE (the shared `Dispatch`/`Settle` pair of the
  governance family's update engines): the gates (circuit breaker, in-flight, cooldown), the P2
  registration under the factory's namespaced key, the jobs envelope, the P5 records and the U2
  refresh flow return as a `{ Dispatch, Settle }` pair; every string, collection and child stage is
  INJECTED through the dependencies, so the module keeps its ledger vocabulary (the smokes stay the
  arbiter).
- **`Activate(fields)`** - the ACTIVATION-LINE composer: the `activated (...)` proof line's shared
  string mechanics - the `activated (` prefix, the `k=v` pair join with `, `, the `)` suffix and the
  skip-absent-field rule (a pair with an `undefined` value is omitted; an empty key renders a bare
  segment). The FIELD LIST stays module-side: each of the nine Apply sites passes its own strings,
  byte-identical to the hand-composed line it replaced.
- **`Replace` / `ReplaceMap`** - the two generic replacers: a fresh per-call regex (no shared
  `lastIndex` state), a **function replacer** (a config value or table value is a literal string -
  `$` patterns are never interpreted), and the `{ text, count }` contract where `count === 0` means
  "unchanged" and the caller keeps the original **by identity**.
- **`Chunk` / `Block`** - the generic dispatchers, structural (not nominal) in their chunk/block
  shapes, with the transform **injected**: pure, total on any string, order-preserving, no
  buffering.

### The Conventions

- One runtime dependency (effect v4.0.2); the same `Source/` → `Target/` layout as the family
  bundles; `prepublishOnly`-only build (the deterministic sequence:
  `Build ... --TypeScript Configuration/TypeScript.noemit.json` then explicit `tsc && tsc-alias`).
- The module ledger strings stay MODULE-side: the core owns the mechanics, never a module's strings.
- The unit smoke (`core-smoke.mjs` in the family's `smokes/` directory) exercises every helper with
  no fake context at all.

---

## The Config

The core registers no Config and needs none - it is not a plugin: no loader contract, no context, no
Schemastery schema, nothing to validate at load.

Every knob it exposes is a function parameter
(`Policy`'s `defaults`, `Replace`'s replacement, `Chunk`'s injected transform), decided by the
consuming module's own config.

---

## In Action

The helpers in a consumer's code, and the exact lines they compose (the governor's listener,
condensed):

```js
// Source/Function/Observe.ts of a governance hook (condensed):
import { Suppress, Refusal, Section, Default } from "@playform/ets-hook-dsh-core";

try {
	// ... the pass ...
} catch (Error) {
	// every contained throw logs the same shape of line:
	Context.logger.warn(Suppress("ets-hook-dsh-package-governor", "listener", String(Error)));
	// -> "ets-hook-dsh-package-governor: listener error (suppressed): cannot get property ..."
}

// Source/Function/Transform.ts - the refusal guard before any write:
if (Refusal(Append, Path, Section, Document, Next)) {
	return null; // the byte-identical line went to the ledger, the write did not happen
	// -> `REFUSED rewrite of /x/package.json: non-dependency section "scripts" would change`
}
```

And the normalize half, the two generic replacers at work (the inputs carry the real typographic
characters the flavor tables match):

```js
Replace("first — then 10–15 total", Dashes, "-");
// -> { text: "first - then 10-15 total", count: 2 }

ReplaceMap("he said ‘hello’ — loudly", Quotes);
// -> { text: "he said 'hello' - loudly", count: 2 }
//    (the em dash is the Dashes class's job, not the Quotes map's)
```

`count === 0` means "unchanged": the caller keeps the original string by identity instead of
allocating a copy.

The policy loader, in its `Quiet` form, reads the same `update-policy.json` the
update engine will honor and returns the built-in defaults - with the diagnostics, or without them.

---

## The Ledger

The core owns no ledger strings and writes nothing - no plugin, no logger, no ledger file.

The
module ledger strings stay MODULE-side: the core supplies the mechanics (the `Suppress` composer,
the `Policy` diagnostics, the `Refusal` line, the `Activate` template), and every consumer logs them
through its own `Append` (the factory's ledger service).

Nothing in the core ever composes a
`<Module>:` prefix or an activation proof's field list - the `activated (...)` template is the
mechanics only; the fields are the module's.

---

## License 📜

CC0-1.0.
