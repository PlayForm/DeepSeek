# @playform/hook-dsh-convention-suggester

The convention-suggester hook: a DeepSeek Harness plugin that carries the
repo's conventions as a pattern pack and names them **before** the model
violates them. On every `write`/`edit`/`raw-write` call it classifies the
target path deterministically and prepends ONE labeled `additionalContexts`
notice naming the companion targets the convention requires:

- **Layout** - the entry stays wiring-only (`name`, `apply`, `Config`,
  `inject`); one definition per file, nameless default exports.
- **Naming** - full-word PascalCase names, one word where possible, no
  abbreviations (documented exceptions keep their contract names).
- **Docs** - a package ships `README.md` + `SCHEME.md`, and the SCHEME
  config table must match the schema.
- **Ledger** - the ledger strings are module-owned and byte-stable; the four
  identity places (package name, `name` export, State `module:` option,
  `logFile` default) must agree.

The arbiter is the smoke suite that asserts the convention
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)
§9.4). The hook is READ-ONLY by design: it never edits, never rewrites
arguments, never denies - its only surface is the notice.

## How it works

1. `tools/post-execute` (waterfall, plain registration - after the ccr's
   `{prepend: true}` listener): `next()` first; detect → gate → prepend ONE
   notice. Content is never replaced.
2. `agent/pre-step`: the per-turn reset of the note counter when a user
   message enters.

## Status

PoC phase: the package and Source are complete; the smoke suites, the build
pass, and the wiring are the end-phase (POC-BRIEF.md §8). Ships
`enabled: false` in the bundle patch.
