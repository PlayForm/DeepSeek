# @playform/plugin-dsh-workspace-semantics

The workspace-semantics service: the DeepSeek Harness's semantic model - the symbols + the
references + the dependencies + the index (the family map's SEMANTICS role,
`Documentation/Plans/Workspace-Family/SEMANTICS.md`).

The second step of the invisible flow, right after the observe stamps:

```text
observe -> semantics -> operate -> govern -> authority -> approve -> merge
```

- **The service**: `ctx.workspaceSemantics` - `resolve(path)` builds the file's knowledge graph
  lazily through the file type's adapter, `symbol`, `references`, `rename(path, span, to)` produces
  the per-adapter rename plan, `adapt()` registers an any-file adapter, `statistics()` reports.
- **The adapters**: the default TypeScript/JavaScript adapter (the v0 symbol set:
  function/class/type/const/interface with span and fingerprint; the references; the import
  dependencies) plus four OPT-IN adapters named by config `adapters` - `json` (keys), `yaml` (keys),
  `markdown` (headings + link targets), `package` (the package.json dependency names). A file
  adapter owns its exact basename and wins over the extension, so `package.json` never gets the
  plain JSON key model. The default registration stays the seven TypeScript/JavaScript extensions.
- **The LSP deepener**: the harness's `ctx.lsp` seam (`@deepseek-ai/dsh-lsp`) is the PRIMARY
  TypeScript reference answer - one `findReferences` query per declared symbol, same-file locations
  only, the rename derived from them. The seam has four read operations only (no symbol enumeration,
  no rename), so the symbols stay lexical and every "cannot answer" path (absent seam, no provider,
  a failed query) falls back to the lexical reference list. The seam is probed, never injected.
- **The index**: on every fs/observed event heard on the ROOT context (the factory's Wire
  registration) the stale model for the path is dropped and the monotonic index revision advances.
  The conversation never sees the index until an event surfaces it (the visibility rule).
- **The rename semantics**: per-adapter. The rename means different things per format (the .ts
  symbol vs the .md link target vs the .json key); an extension with no adapter, or an adapter that
  cannot be certain, gets the refusal-to-guess answer - `undefined` plus one ledger line, never a
  guessed plan. The service never writes a file: the plan goes to the operate proposals.
- **The idle-forever posture**: ships disabled (`enabled: false`), never appears in the profile's
  bundles, enables only by an explicit ACTIVATE.
- **The ledger**: its own strings, prefix `semantics:` (module-owned, byte-stable), one log per
  module (default `~/.dsh/playform/plugin-dsh-workspace-semantics.log`).

Ledger lines (byte-stable): `disabled (enabled=false)`, `adapters registered (N extensions)`,
`resolved <path> (N symbols, M references)`, `deepened <path> (N references via <name>)`,
`refused <path> (no adapter for <ext>)`, `refused <path> (rename: ...)`,
`planned rename <from> -> <to> in <path> (N edits, <certainty>)`,
`indexed <path> version <v> (revision <r>)`, `ignored <path> (own actor)`,
`ignored <path> (excluded)`, `failed <path> (<reason>)`, `storage open failed: <reason>`.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This package's actions are read-only, all AUTOMATIC; it has NO gated action (no file write, no batch
commit, no spawn - the rename plan goes to the operate proposals), so the block documents the
posture and refuses nothing. The block is one volatile object, so a policy flip is hot-editable
without a remount; a resolved pack's `policy` section overrides the defaults per action (the wiring
is the next refinement). The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

Schema: see SCHEME.md.
