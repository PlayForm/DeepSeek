# @playform/hook-dsh-convention-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

This hook is the convention suggester: a DeepSeek Harness plugin that carries the repo's conventions
as a pattern pack and names them **before** the model violates them.

On every `write`/`edit`/`raw-write` call it classifies the target path deterministically and it
prepends ONE labeled `additionalContexts` notice that names the companion targets the convention
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
and never denies - its surfaces are the notice and, only when learning is on, one PROPOSAL file
(never the live pack).

The conventions are **pack-driven**: the built-in pack (this monorepo's default) lives in
[`@playform/lib-dsh-pack`](../lib-dsh-pack) and it is projected here as the `convention/` domain.

A repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `convention/` intents; a repository without a
pack stays silent.

## The surfaces

- The `tools/post-execute` waterfall listener (plain registration, after the ccr's `{prepend: true}`
  listener): one `additionalContexts` notice, never a content replacement.
- The `agent/pre-step` listener: the per-turn reset of the note counter when a user message enters.
- No tool, no service: the hook is read-only except the opt-in learner's proposal file.

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
    `@playform/lib-dsh-pack`.

    **Install it** by copying the file to `~/.dsh/playform/workspaces/<slug>.yml` and restarting
    (the library resolves packs at boot).

- **The note.**

    One `additionalContexts` notice that names the proposal path, the family count, and the install
    step, with the ledger line `learned proposal <slug> <n> families <path>`.

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

## The ledger

The lines are prefixed `convention-suggester: ` and go to `logFile`:

```text
activated (...)
suggest <id> <k> <n> candidates call <tool>
suppressed <verdict> <id>
abstained ambiguous <id> <k>
abstained no-companions <id> <k>
abstained foreign-workspace
learned proposal <slug> <n> families <path>
learned pack <n> families
convention-suggester: <error>; the note is skipped
```

## The configuration

| Field             | Default                                             | Meaning                                           |
| ----------------- | --------------------------------------------------- | ------------------------------------------------- |
| `enabled`         | `true`                                              | the plugin ships enabled                          |
| `log`             | `true`                                              | the ledger switch (the factory's shared volatile) |
| `logFile`         | `~/.dsh/playform/hook-dsh-convention-suggester.log` | the ledger                                        |
| `threshold`       | `0.75`                                              | the gate threshold `k`                            |
| `maxCandidates`   | `7`                                                 | the bound on named candidates                     |
| `maxNoteChars`    | `1200`                                              | the note length bound                             |
| `cooldownCalls`   | `6`                                                 | the cooldown between notes                        |
| `maxNotesPerTurn` | `3`                                                 | the per-turn cap                                  |
| `intents`         | `[]`                                                | the intent filter                                 |
| `emitOn`          | `["edit", "raw-write", "write"]`                    | the tools that trigger the gate                   |
| `exclude`         | `["node_modules", "Target", ".git", "dist"]`        | the excluded paths                                |
| `learning`        | `false`                                             | the opt-in learner (D4)                           |

Every field is a volatile cell.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

The smoke folders: `Learn-Install`, `Learn-Note`, `Learn-Proposal`, `Pack-Driven`,
`Post-Execute-And-Gate`, `Wiring-And-Ledger`, `Workspace-Gate`.

## The plan

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - the pattern
  algebra and the section 9.4 convention arbiter.

- PoC phase: the package and Source are complete; the smoke suites, the build pass, and the wiring
  are the end-phase (POC-BRIEF.md §8).

    Ships `enabled: false` in the bundle patch.

## License

CC0-1.0.
