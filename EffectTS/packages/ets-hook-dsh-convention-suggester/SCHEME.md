# SCHEME - @playform/hook-dsh-convention-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                                 | Volatile | Notes                                                                                                                                    |
| ----------------- | -------- | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                                  | yes      | The shared universal cell (the factory's minimal block).                                                                                 |
| `logFile`         | string   | `~/.dsh/playform/ets-hook-dsh-convention-suggester.log` | yes      | The hook's OWN ledger, one log per module.                                                                                               |
| `enabled`         | boolean  | `true`                                                  | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`.                                  |
| `threshold`       | number   | `0.75`                                                  | yes      | The default confidence gate; per-intent thresholds may raise it, never lower it.                                                         |
| `maxCandidates`   | number   | `7`                                                     | yes      | The note's candidate cap (the plan §3.7).                                                                                                |
| `maxNoteChars`    | number   | `1200`                                                  | yes      | Hard character cap on the note text.                                                                                                     |
| `cooldownCalls`   | number   | `6`                                                     | yes      | No second note for the same intent within this many judged calls, per agent.                                                             |
| `maxNotesPerTurn` | number   | `3`                                                     | yes      | Reset per user turn (`agent/pre-step`).                                                                                                  |
| `intents`         | string[] | `[]` (all pack intents enabled)                         | yes      | The enabled intent ids; unknown ids are ignored.                                                                                         |
| `emitOn`          | string[] | `["edit","raw-write","write"]`                          | yes      | The judged tool names (the modification family).                                                                                         |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`               | yes      | Substrings; a candidate whose path matches one is never suggested.                                                                       |
| `learning`        | boolean  | `false`                                                 | yes      | The D4 bootstrap: on, the first judged call in a packless workspace writes ONE proposal and notes it (section "The learning bootstrap"). |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'convention-suggester', form: 'notice', summary: '<Intent> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                     |

## The built-in pack (`@playform/ets-lib-dsh-pack`, the `convention/` domain)

The table below is the `convention/` projection of the BUILT-IN pack, and
`Source/Variable/Defaults.ts` selects it with `Families(Builtin, "convention")`.

A workspace pack (`<repo>/.dsh/pack.yml` or the user layer `~/.dsh/playform/workspaces/<slug>.yml`)
overrides it per repo.

The Apply compiles the intents of the resolved pack once per workspace root, and a repo without a
pack keeps this set.

| Intent   | Priority | Threshold | Signals (weight)                                        | Targets                                                                                                    |
| -------- | -------- | --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Layout` | 1        | 0.75      | layout-shape (2.0), entry-shape (1.5), test-shape (1.5) | `Source/Library.ts`, `Source/Function/<Name>.ts`, `README.md`, `SCHEME.md`                                 |
| `Naming` | 2        | 0.75      | source-shape (2.0), identifier-shape (1.5)              | `Source/Function/*.ts`, `Source/Interface/*.ts`, `Source/Variable/*.ts`                                    |
| `Docs`   | 3        | 0.75      | pkg-shape (2.0), source-shape (1.5)                     | `README.md`, `SCHEME.md`, `cordis.patch.yml`                                                               |
| `Ledger` | 4        | 0.85      | ledger-shape (2.5), identity-shape (1.5)                | `Source/Function/Apply.ts`, `Source/Variable/Config.ts`, `cordis.patch.yml`, `Source/Test/<Suite>/Test.ts` |

Confidence is `k = sigmoid(Σ weights − 0.6)`.

The note emits only if `k ≥ gate`, the candidate set survives the cap and the exclusion, and the
cooldown and cap allow it.

## The learning bootstrap (D4)

The convention suggester is also the PACK LEARNER of the family: with learning ON it derives the
pack of a repo from the repo itself and writes it as a **proposal**, and it never writes a live
pack.

### The opt-in

OFF by default (the user's "learning is optional").

The effective switch is the config's `learning` when true, and otherwise the `learning.propose` of
the resolved pack.

So a profile flips it on for every workspace, or a repo opts itself in with a minimal
`.dsh/pack.yml`:

```yaml
learning:
    propose: true
```

The config's `false` is the default (off), not a veto: a true config wins over a pack that declines,
and a false config leaves the decision to the pack.

Both sources default off.

### When it runs

On the FIRST judged call (`emitOn`) in a workspace per PROCESS, when the resolved pack is the
built-in one (no pack layer) or a layer with NO families.

A layer that carries families is an installed pack and is never proposed over.

The reservation is a module-level set keyed by the root, so a second mount of the hook in the same
process neither re-notes nor re-writes.

The learner runs before the workspace gate, because a packless repo that the gate cannot see yet (no
signature) is exactly the repo the bootstrap exists for.

The learner anchors its own root on `Documentation/INDEX.md` / `Documentation/ARCHIVE-STYLE.md` /
`package.json`.

### The derivation

A bounded marker probe under the resolved root (no recursive walk), then the families whose
companions ACTUALLY exist:

| Marker group       | Markers                                                                                                                                                                       | Derived families                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| the doc graph      | `Documentation/INDEX.md`, `Documentation/ARCHIVE-STYLE.md`, `Documentation/Plans`, `Documentation/Guides`, `Documentation/Skill`, `Documentation/Handoff`, `Documentation`    | `doc/Plan`, `doc/Guide`, `doc/Skill`, `doc/Index`           |
| the package layout | `package.json`, `README.md`, `SCHEME.md`, `CONTRIBUTING.md`, `cordis.patch.yml`, `Source/Library.ts`, `Source/Function`, `Source/Variable`, `Source/Interface`, `Source/Test` | `convention/Layout`, `convention/Naming`, `convention/Docs` |
| the site           | `Site/Source/Content`, `Site/Source/pages`, `Site/Source/Component`, `Site/Source/Library`, `Site/Source/Library/Content.ts`                                                  | `doc/Site`                                                  |
| the prose          | `README.md`, `SCHEME.md`, `CONTRIBUTING.md`, `Documentation/Plugins/PLUGIN-FAMILY.md`, `Site/Source/pages/plugins.astro`                                                      | `doc/PackageProse`                                          |

A family is proposed only when its trigger marker exists AND at least one companion was found, and a
companion is named only when the scan found it (no globs, no `<...>` placeholders).

The signature is `Documentation/ARCHIVE-STYLE.md` if present, else `Documentation/INDEX.md`, else
`package.json`, and no marker means no proposal.

The slug is the basename of the root, lowercased.

### The proposal file

`<home>/.dsh/playform/proposals/<slug>.yml` - NEVER `<home>/.dsh/playform/workspaces/<slug>.yml`
(the live pack) and never the repo layer.

The proposal is a FULL pack object (`slug`, `signature`, `families`), serialized as the same YAML
subset that `@playform/ets-lib-dsh-pack` parses (double-quoted scalars, block sequences, 4-space
indents), so it round-trips through `Parse` -> `Normalize`.

The install is the user's: copy the file into the user layer and restart (the boot-time memo of the
library).

### The note

ONE normal `additionalContexts` note (source
`{kind: 'convention-suggester', form: 'notice', summary: 'learned pack <n> families'}`), never a
write:

```text
[convention-suggester] learned pack proposal for <slug>
proposal: <home>/.dsh/playform/proposals/<slug>.yml
families: <n>
install: copy the proposal to ~/.dsh/playform/workspaces/<slug>.yml
```

The refine-from-edits layer (an accepted suggestion moving the weight of a companion) is the later
D8 lane.

## Ledger strings (byte-exact, module-owned)

```
convention-suggester: activated (bundle 0.2.1, intents <n>, threshold <t>)
convention-suggester: disabled (enabled=false)
convention-suggester: suggest <Intent> <k> <n> candidates call <tool>
convention-suggester: abstained ambiguous <Intent> <k>
convention-suggester: abstained no-companions <Intent> <k>
convention-suggester: abstained foreign-workspace <Intent> <k>
convention-suggester: suppressed cooldown <Intent>
convention-suggester: suppressed cap <Intent>
convention-suggester: learned proposal <slug> <n> families <proposal path>
```

The `learned proposal` line is the ONE line of the D4 bootstrap (section "The learning bootstrap"):
it carries the slug, the derived family count and the absolute proposal path, and it is appended
exactly when the proposal is written and the note is prepended, once per workspace per process.

The post-execute listener resolves the workspace root before the gate (the nearest ancestor whose
PACK SIGNATURE matches; the signature is the `signature` list of the resolved pack, defaulting to
`Documentation/ARCHIVE-STYLE.md`, from the call path plus the session cwd).

With learning ON, the learner runs BEFORE the silence of the gate (the root anchors on
`Documentation/INDEX.md`, `Documentation/ARCHIVE-STYLE.md` or `package.json` when the gate sees
nothing), and a proposed workspace gets the learning note instead of the convention note on that
call.

A foreign workspace has no pack and logs `abstained foreign-workspace  0.00` (the gate runs before
the intent is known, so the intent segment is empty and the kappa is the no-signal 0.00).

The `convention/` intents of the resolved pack drive Detect (compiled once per root), so a repo pack
overrides the built-in intents without a restart.

With the root known, a target is kept when it exists under ANY of the three bases of the call: the
repo root, the package root (the nearest ancestor of the resolved call path carrying `package.json`,
at or below the repo root) and the package parent.

An intent with none left logs `abstained no-companions <Intent> <k>`.

Targets carrying a `<...>` placeholder (`Source/Function/<Name>.ts`, `Source/Test/<Suite>/Test.ts`)
are illustrative and are never existence-checked.

## Identity (the four agreeing places)

1. **Package name.**

    `@playform/hook-dsh-convention-suggester`.

2. **The `name` export.**

    `convention-suggester`.

3. **The `module:` option of the State build.**

    `convention-suggester`.

4. **The `logFile` default of the ledger.**

    `~/.dsh/playform/ets-hook-dsh-convention-suggester.log`.
