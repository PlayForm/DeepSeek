# @playform/plugin-dsh-workspace-semantics

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/SEMANTICS](../../../Documentation/Plans/Workspace-Family/SEMANTICS.md)

## The role

The workspace-semantics service supplies the semantic model of the DeepSeek Harness: the symbols,
the references, the dependencies, and the index (the SEMANTICS role of the family map,
`Documentation/Plans/Workspace-Family/SEMANTICS.md`).

The service is the second step of the invisible flow, right after the observe stamps:

```text
observe -> semantics -> operate -> govern -> authority -> approve -> merge
```

- **The service.**

    The service is `ctx.workspaceSemantics`: `resolve(path)` builds the knowledge graph of the file
    lazily through the adapter of the file type, `symbol` and `references` read it,
    `rename(path, span, to)` produces the per-adapter rename plan, `adapt()` registers an any-file
    adapter, and `statistics()` reports.

- **The adapters.**

    The service ships the default TypeScript/JavaScript adapter (the v0 symbol set:
    function/class/type/const/interface with span and fingerprint; the references; the import
    dependencies) plus four OPT-IN adapters named by the config `adapters`: `json` (keys), `yaml`
    (keys), `markdown` (headings + link targets), and `package` (the dependency names of
    package.json).

    A file adapter owns its exact basename and wins over the extension, so `package.json` never gets
    the plain JSON key model.

    The default registration stays the seven TypeScript/JavaScript extensions.

- **The LSP deepener.**

    The `ctx.lsp` seam of the harness (`@deepseek-ai/dsh-lsp`) is the PRIMARY TypeScript reference
    answer: one `findReferences` query per declared symbol, same-file locations only, and the rename
    derived from them.

    The seam has four read operations only (no symbol enumeration, no rename), so the symbols stay
    lexical and every "cannot answer" path (absent seam, no provider, a failed query) falls back to
    the lexical reference list.

    The plugin probes the seam and never injects it.

- **The index.**

    On every fs/observed event heard on the ROOT context (the Wire registration of the factory) the
    service drops the stale model for the path and advances the monotonic index revision.

    A **repeat event** (the same path carrying the same version within the coalescing window) is
    dropped silently by the guard `Function/Duplicate` (the clock pattern of the monitor - no timer,
    2 s, the `State.Now` test seam overrides it): the model for that file state is already dropped,
    and a model rebuilt since was built from the same version, so it stays fresh, because the last
    distinct version always wins.

    The conversation never sees the index until an event surfaces it (the visibility rule).

- **The rename semantics.**

    The rename means different things per format (the .ts symbol vs the .md link target vs the .json
    key), so the semantics are per-adapter.

    An extension with no adapter, or an adapter that cannot be certain, gets the refusal-to-guess
    answer: `undefined` plus one ledger line, never a guessed plan.

    The service never writes a file, because the plan goes to the operate proposals.

- **The idle-forever posture.**

    The plugin ships disabled (`enabled: false`), never appears in the bundles of the profile, and
    enables only by an explicit ACTIVATE.

- **The ledger.**

    The ledger uses its own strings with the prefix `semantics:` (module-owned, byte-stable), one
    log per module (default `~/.dsh/playform/ets-plugin-dsh-workspace-semantics.log`).

## The ledger

Ledger lines (byte-stable): `disabled (enabled=false)`, `adapters registered (N extensions)`,
`resolved <path> (N symbols, M references)`, `deepened <path> (N references via <name>)`,
`refused <path> (no adapter for <ext>)`, `refused <path> (rename: ...)`,
`planned rename <from> -> <to> in <path> (N edits, <certainty>)`,
`indexed <path> version <v> (revision <r>)`, `ignored <path> (own actor)`,
`ignored <path> (excluded)`, `failed <path> (<reason>)`, `storage open failed: <reason>`.

A coalesced repeat event (the repeat-event guard) records nothing and adds no line.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are read-only, all AUTOMATIC.

It has NO gated action (no file write, no batch commit, no spawn, because the rename plan goes to
the operate proposals), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

Schema: see SCHEME.md.

## The plan

- [Workspace-Family/SEMANTICS](../../../Documentation/Plans/Workspace-Family/SEMANTICS.md) - the
  semantics role.
- **The idle-forever posture.**

    The plugin ships disabled (`enabled: false`), never appears in the bundles of the profile, and
    enables only by an explicit ACTIVATE.

## License

CC0-1.0.
