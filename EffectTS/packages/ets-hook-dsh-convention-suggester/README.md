# @playform/hook-dsh-convention-suggester

> v0.3.0 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The convention-suggester hook: a DeepSeek Harness plugin that carries the repo's conventions as a
pattern pack and names them **before** the model violates them.

On every `write`/`edit`/`raw-write` call it classifies the target path deterministically and
prepends ONE labeled `additionalContexts` notice naming the companion targets the convention
requires:

- **Layout** - the entry stays wiring-only (`name`, `apply`, `Config`, `inject`); one definition per
  file, nameless default exports.
- **Naming** - full-word PascalCase names, one word where possible, no abbreviations (documented
  exceptions keep their contract names).
- **Docs** - a package ships `README.md` + `SCHEME.md`, and the SCHEME config table must match the
  schema.
- **Ledger** - the ledger strings are module-owned and byte-stable; the four identity places
  (package name, `name` export, State `module:` option, `logFile` default) must agree.

The arbiter is the smoke suite that asserts the convention
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.4).

The hook is READ-ONLY by design except the opt-in learner: it never edits, never rewrites arguments,
never denies - its surfaces are the notice and, only when learning is on, one PROPOSAL file (never
the live pack).

The conventions are **pack-driven**: the built-in pack (this monorepo's default) lives in
[`@playform/ets-lib-dsh-pack`](../ets-lib-dsh-pack) and is projected here as the `convention/`
domain.

A repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `convention/` intents; a repository without a
pack stays silent.

## The pack learner (D4)

The hook is also the family's PACK LEARNER: an **opt-in bootstrap** that derives a repo's pack from
the repo itself and writes it as a **proposal**, never as a live pack.

- **Off by default.**

    Flip the config's `learning` to `true` for every workspace, or let a repo opt itself in with a
    minimal `.dsh/pack.yml`:

    ```yaml
    learning:
        propose: true
    ```

    The config wins when true; a false config (the default) leaves the decision to the pack.

- **When.**

    The first judged call in a packless workspace per process (the built-in pack, or a pack layer
    with no families).

    An installed pack is never proposed over.

- **What.**

    The doc graph (`Documentation/INDEX.md`, `ARCHIVE-STYLE.md`, `Plans`, `Guides`, `Skill`,
    `Handoff`), the package layout (`package.json`, `README.md`, `SCHEME.md`, `cordis.patch.yml`,
    `Source/{Library.ts,Function,Variable,Interface,Test}`) and the site
    (`Site/Source/{Content,pages,Component,Library}`) become the families whose companions actually
    exist; the signature is `ARCHIVE-STYLE.md`, else `INDEX.md`, else `package.json`; the slug is
    the repo's basename, lowercased.

- **Where.**

    `<home>/.dsh/playform/proposals/<slug>.yml` - a full pack object that parses back through
    `@playform/ets-lib-dsh-pack`.

    **Install it** by copying the file to `~/.dsh/playform/workspaces/<slug>.yml` and restarting
    (the library resolves packs at boot).

- **The note.**

    One `additionalContexts` notice naming the proposal path, the family count and the install step,
    with the ledger line `learned proposal <slug> <n> families <path>`.

The refine-from-edits layer (an accepted suggestion moving a companion's weight) is the later D8
lane.

## How it works

1. **The post-execute listener.**

    The `tools/post-execute` listener (waterfall, plain registration - after the ccr's
    `{prepend: true}` listener) calls `next()` first.

    Then the hook runs detect -> gate -> prepend ONE notice.

    Content is never replaced.

2. **The pre-step listener.**

    The `agent/pre-step` listener resets the note counter each turn when a user message enters.

## The plan

PoC phase: the package and Source are complete; the smoke suites, the build pass, and the wiring are
the end-phase (POC-BRIEF.md §8).

Ships `enabled: false` in the bundle patch.

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - §9.4, the
  convention arbiter.

## License

CC0-1.0.
