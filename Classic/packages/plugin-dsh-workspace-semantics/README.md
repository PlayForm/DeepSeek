# @playform/plugin-dsh-workspace-semantics

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/SEMANTICS](../../../Documentation/Plans/Workspace-Family/SEMANTICS.md)

## The role

The workspace-semantics service holds the semantic model of the DeepSeek Harness: the symbols, the
references, the dependencies, and the index (the SEMANTICS role of the family map,
`Documentation/Plans/Workspace-Family/SEMANTICS.md`).

The service is the second step of the invisible flow, right after the observe stamps:

```text
observe -> semantics -> operate -> govern -> authority -> approve -> merge
```

## The surfaces

- The service `ctx.workspaceSemantics` (`resolve`, `symbol`, `references`, `rename`, `adapt`,
  `statistics`).
- The fs/observed listener on the ROOT context (the factory's Wire registration) - the index
  trigger.
- The optional `ctx.lsp` seam (probed, never injected) - the primary TypeScript reference answer.
- No tool, no file write.

## The ledger

The module owns its strings under the prefix `semantics:` (byte-stable), with one log per module
(default `~/.dsh/playform/plugin-dsh-workspace-semantics.log`).

The lines (byte-stable): `disabled (enabled=false)`, `adapters registered (N extensions)`,
`resolved <path> (N symbols, M references)`, `deepened <path> (N references via <name>)`,
`refused <path> (no adapter for <ext>)`, `refused <path> (rename: ...)`,
`planned rename <from> -> <to> in <path> (N edits, <certainty>)`,
`indexed <path> version <v> (revision <r>)`, `ignored <path> (own actor)`,
`ignored <path> (excluded)`, `failed <path> (<reason>)`, `storage open failed: <reason>`.

A coalesced repeat event (the repeat-event guard) records nothing and adds no line.

- **The service**: `ctx.workspaceSemantics`, where `resolve(path)` builds the knowledge graph of the
  file lazily through the adapter of the file type, `symbol`, `references`, and
  `rename(path, span, to)` produce the per-adapter rename plan, `adapt()` registers an any-file
  adapter, and `statistics()` reports.

- **The adapters**: the default TypeScript/JavaScript adapter (the v0 symbol set of function, class,
  type, const, and interface with span and fingerprint, the references, and the import dependencies)
  plus four OPT-IN adapters named by the config `adapters`: `json` (keys), `yaml` (keys), `markdown`
  (headings + link targets), and `package` (the package.json dependency names).

    A file adapter owns its exact basename and wins over the extension, so `package.json` never gets
    the plain JSON key model.

    The default registration stays the seven TypeScript/JavaScript extensions.

- **The LSP deepener**: the `ctx.lsp` seam of the harness (`@deepseek-ai/dsh-lsp`) is the PRIMARY
  TypeScript reference answer, with one `findReferences` query per declared symbol, same-file
  locations only, and the rename derived from them.

    The seam has four read operations only (no symbol enumeration, no rename), so the symbols stay
    lexical and every "cannot answer" path (absent seam, no provider, a failed query) falls back to
    the lexical reference list.

    The seam is probed, never injected.

- **The index**: on every fs/observed event heard on the ROOT context (the factory's Wire
  registration) the stale model for the path is dropped and the monotonic index revision advances.

    A **repeat event**, which is the same path carrying the same version within the coalescing
    window, is dropped silently by the guard `Function/Duplicate` with the clock pattern of the
    monitor (no timer, 2 s, and the `State.Now` test seam overrides it), because the model for that
    file state is already dropped and a model rebuilt since was built from the same version, so it
    stays fresh and the last distinct version always wins.

    The conversation never sees the index until an event surfaces it (the visibility rule).

- **The rename semantics**: per-adapter.

    The rename means different things per format (the .ts symbol, the .md link target, the .json
    key), and an extension with no adapter, or an adapter that cannot be certain, gets the
    refusal-to-guess answer of `undefined` plus one ledger line, never a guessed plan.

    The service never writes a file, because the plan goes to the operate proposals.

- **The idle-forever posture**: the package ships disabled (`enabled: false`), never appears in the
  bundles of the profile, and enables only through an explicit ACTIVATE.
- **The ledger**: the module owns its strings under the prefix `semantics:` (byte-stable), with one
  log per module (default `~/.dsh/playform/plugin-dsh-workspace-semantics.log`).

## The configuration

| Field        | Default                                                         | Meaning                                      |
| ------------ | --------------------------------------------------------------- | -------------------------------------------- |
| `enabled`    | `false`                                                         | the master switch (the idle-forever posture) |
| `log`        | `true`                                                          | the ledger switch (shared cell)              |
| `logFile`    | `~/.dsh/playform/plugin-dsh-workspace-semantics.log`            | the ledger                                   |
| `domain`     | `workspace_semantics`                                           | the KV domain name                           |
| `maxEntries` | `256`                                                           | the index entry bound                        |
| `root`       | `""` (the session cwd)                                          | the workspace root                           |
| `lsp`        | `true`                                                          | the LSP deepener switch                      |
| `adapters`   | `[]` (the seven TS/JS extensions stay the default registration) | the opt-in any-file adapters, by name        |
| `policy.*`   | D6 defaults                                                     | the per-action allowlist (see below)         |

Every field is a volatile cell.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are read-only and all AUTOMATIC, so it has NO gated action (no file
write, no batch commit, no spawn, because the rename plan goes to the operate proposals), and the
block therefore documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a `policy`
section of a resolved pack overrides the defaults per action (the wiring is the next refinement).

The smoke suite arbitrates the defaults in `Source/Test/Policy-Defaults`.

## The build and the tests

The build runs `pnpm prepublishOnly` (Source/prepublishOnly.sh), which does the plugin build (ESM
`Target/`, with the Test tree excluded), the Test build, the harness selfcheck, and the Test
type-check.

## The plan

- [Workspace-Family/SEMANTICS](../../../Documentation/Plans/Workspace-Family/SEMANTICS.md) - the
  semantics role.
- Schema: see SCHEME.md.

## License

CC0-1.0.
