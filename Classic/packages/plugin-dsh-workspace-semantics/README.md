# @playform/plugin-dsh-workspace-semantics

The workspace-semantics service: the DeepSeek Harness's semantic model - the symbols + the
references + the dependencies + the index (the family map's SEMANTICS role,
`Documentation/Plans/Workspace-Family/SEMANTICS.md`).

The second step of the invisible flow, right after the observe stamps:

```text
observe -> semantics -> operate -> govern -> authority -> approve -> merge
```

- **The service**: `ctx.workspaceSemantics` - `resolve(path)` builds the file's knowledge graph
  lazily through the file type's adapter (the v0 symbol set: function/class/type/const/interface
  with span and fingerprint; the references; the import dependencies), `symbol`, `references`,
  `rename(path, span, to)` produces the per-adapter rename plan, `adapt()` registers an any-file
  adapter, `statistics()` reports.
- **The index**: on every fs/observed event heard on the ROOT context (the factory's Wire
  registration) the stale model for the path is dropped and the monotonic index revision advances.
  The conversation never sees the index until an event surfaces it (the visibility rule).
- **The rename semantics**: per-adapter. The rename means different things per format (the .ts
  symbol vs the .docx displayed text vs the .rs item); an extension with no adapter, or an adapter
  that cannot be certain, gets the refusal-to-guess answer - `undefined` plus one ledger line, never
  a guessed plan. The service never writes a file: the plan goes to the operate proposals.
- **The idle-forever posture**: ships disabled (`enabled: false`), never appears in the profile's
  bundles, enables only by an explicit ACTIVATE.
- **The ledger**: its own strings, prefix `semantics:` (module-owned, byte-stable), one log per
  module (default `~/.dsh/semantics.log`).

Ledger lines (byte-stable): `disabled (enabled=false)`, `adapters registered (N extensions)`,
`resolved <path> (N symbols, M references)`, `refused <path> (no adapter for <ext>)`,
`refused <path> (rename: ...)`, `planned rename <from> -> <to> in <path> (N edits, <certainty>)`,
`indexed <path> version <v> (revision <r>)`, `ignored <path> (own actor)`,
`ignored <path> (excluded)`, `failed <path> (<reason>)`, `storage open failed: <reason>`.
