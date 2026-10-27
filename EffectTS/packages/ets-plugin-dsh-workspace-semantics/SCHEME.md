# SCHEME - @playform/plugin-dsh-workspace-semantics

The config surface is all volatile, and the schema defaults are the truth.

| Field        | Type      | Default                                                  | Meaning                                                                                                                              |
| ------------ | --------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `log`        | boolean   | `true`                                                   | Ledger enabled - write the durable log file.                                                                                         |
| `logFile`    | string    | `~/.dsh/playform/ets-plugin-dsh-workspace-semantics.log` | The module's own ledger.                                                                                                             |
| `enabled`    | boolean   | `false`                                                  | The master switch - the IDLE-forever posture.                                                                                        |
| `domain`     | string    | `workspace_semantics`                                    | The KV domain name.                                                                                                                  |
| `maxEntries` | number    | `256`                                                    | The index bound (the oldest models drop first).                                                                                      |
| `exclude`    | string[]  | `["node_modules/**", "**/Target/**", "**/.git/**"]`      | Paths no model is built for.                                                                                                         |
| `root`       | string    | `""`                                                     | The workspace root the LSP queries resolve against; `""` = the process working directory.                                            |
| `lsp`        | boolean   | `true`                                                   | Register the harness LSP deepener (the primary TypeScript reference answer); `false` keeps the model purely lexical.                 |
| `adapters`   | string[]  | `[]`                                                     | The opt-in any-file adapters by catalog name: `json`, `yaml`, `markdown`, `package`. Empty = the TypeScript/JavaScript adapter only. |
| `policy`     | Allowlist | the D6 block (see below)                                 | The per-action allowlist (the shared factory block).                                                                                 |

An unknown `adapters` name fails loud at load:
`semantics: adapters must name known adapters (json, yaml, markdown, package)`.

## The policy block (D6)

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

The package adds no ledger line, because it has no gated action.

The service surface (`ctx.workspaceSemantics`):

| Method       | Signature                                                                    | Notes                                                                       |
| ------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `resolve`    | `(path: string) => Promise<Model \| undefined>`                              | Lazy build through the adapter; `undefined` is the refusal-to-guess answer. |
| `symbol`     | `(path: string, qualifiedName: string) => SymbolNode \| undefined`           | Exact name match in the built model.                                        |
| `references` | `(path: string) => ReferenceNode[]`                                          | The model's reference list.                                                 |
| `rename`     | `(path: string, span: Span, to: string) => Promise<RenamePlan \| undefined>` | The per-adapter plan; never a write.                                        |
| `adapt`      | `(adapter: Adapter) => void`                                                 | The any-file adapter seam (per extension or basename).                      |
| `statistics` | `() => { paths, revision, adapters }`                                        | The index counters.                                                         |

## The adapters

An adapter owns either a set of extensions or an exact basename.

The lookup checks the basename FIRST (a file adapter such as `package.json` never falls through to
the extension adapter), then the lowercase dotted extension.

The default registration is the TypeScript/JavaScript adapter (seven extensions), and the `adapters`
names add the rest.

| Name       | Keys                               | Symbols                                            | References                                    | Rename                                            |
| ---------- | ---------------------------------- | -------------------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| (default)  | `.ts .tsx .mts .cts .js .mjs .cjs` | declarations (function/class/interface/type/const) | dotted qualified words whose head is declared | every occurrence of the identifier (head)         |
| `json`     | `.json`                            | every key (`key`)                                  | a string value that repeats a key's text      | every key and value token with that text          |
| `yaml`     | `.yml .yaml`                       | every mapping key (`key`)                          | a plain scalar that repeats a key's text      | every key token and matching plain scalar         |
| `markdown` | `.md .markdown`                    | every heading (`heading`)                          | every link target                             | every link target equal to the span's text        |
| `package`  | `package.json`                     | every dependency name (`dependency`)               | a name repeated in another dependency section | every occurrence of the name in the four sections |

The symbol kinds are the v0 TypeScript set plus the any-file kinds `key`, `heading`, and
`dependency`.

The spans are character offsets into the file, and the edits of the rename plan are the inner range
of the token, so the quotes of a JSON/YAML key are never part of the edit.

A Markdown heading rename is the refusal of the adapter, because the anchor slug that the renderer
derives is not derivable honestly from the text.

## The deepener (the harness LSP seam)

`ctx.lsp` (`@deepseek-ai/dsh-lsp`) is the language-server seam of the harness.

It exposes exactly four read operations (`goToDefinition`, `findReferences`, `goToImplementation`,
`hover`) and no symbol enumeration or rename/WorkspaceEdit, so the service adopts it as the PRIMARY
reference answer for the TypeScript/JavaScript extensions while the SYMBOLS still come from the
lexical scan:

- one `findReferences` query per declared symbol, at the offset of the identifier inside its
  declaration span, with `workspaceRoot` from the config `root`;
- only same-file locations are kept, because the model is per file;
- an answer replaces the lexical reference list and ledgers
  `deepened <path> (<n> references via lsp)`;
- the rename is derived from the same locations (`certainty: "references"`).

The plugin PROBES the seam (`ctx.get("lsp")`) and never injects it (`inject` stays
`["pluginFactory", "fs"]`).

Every "cannot answer" path (the seam absent, no provider for the extension, a failed query, a
non-`locations` result, an empty symbol list) is `undefined`, so the lexical answer stands and no
line is added.

## The repeat-event guard (Function/Duplicate)

The fs/observed listener coalesces repeat events: a repeat for the same path that carries the same
version within a short window (2 s on the clock of the module; the `State.Now` test seam overrides
it; no real timer anywhere) runs no invalidation and records nothing.

The version token identifies the file state, so the model for that state is already dropped, and a
model rebuilt since was built from the same version and stays fresh.

A different version, or the same version after the window, invalidates normally, because the last
distinct version always wins.

A coalesced repeat adds no ledger line and records nothing.

## The ledger strings (module-owned, byte-stable)

```text
semantics: adapters registered (<n> extensions)
semantics: disabled (enabled=false)
semantics: activated (domain=<domain>)
semantics: resolved <path> (<n> symbols, <m> references)
semantics: deepened <path> (<n> references via <name>)
semantics: refused <path> (no adapter for <ext>)
semantics: refused <path> (rename: ...)
semantics: planned rename <from> -> <to> in <path> (<n> edits, <certainty>)
semantics: indexed <path> version <v> (revision <r>)
semantics: ignored <path> (own actor)
semantics: ignored <path> (excluded)
semantics: failed <path> (<reason>)
semantics: storage open failed: <reason>
```

`deepened` is the ONE line that this wave adds, and every other line is unchanged.

The count in `adapters registered (<n> extensions)` is the size of the registry (extensions plus
file names), so the default registration stays exactly `adapters registered (7 extensions)`.
