# SCHEME - @playform/plugin-dsh-workspace-semantics

The config surface (all volatile; the schema defaults are the truth).

| Field        | Type      | Default                                              | Meaning                                                                                                                              |
| ------------ | --------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `log`        | boolean   | `true`                                               | Ledger enabled - write the durable log file.                                                                                         |
| `logFile`    | string    | `~/.dsh/playform/ets-plugin-dsh-workspace-semantics.log` | The module's own ledger.                                                                                                             |
| `enabled`    | boolean   | `false`                                              | The master switch - the IDLE-forever posture.                                                                                        |
| `domain`     | string    | `workspace_semantics`                                | The KV domain name.                                                                                                                  |
| `maxEntries` | number    | `256`                                                | The index bound (the oldest models drop first).                                                                                      |
| `exclude`    | string[]  | `["node_modules/**", "**/Target/**", "**/.git/**"]`  | Paths no model is built for.                                                                                                         |
| `root`       | string    | `""`                                                 | The workspace root the LSP queries resolve against; `""` = the process working directory.                                            |
| `lsp`        | boolean   | `true`                                               | Register the harness LSP deepener (the primary TypeScript reference answer); `false` keeps the model purely lexical.                 |
| `adapters`   | string[]  | `[]`                                                 | The opt-in any-file adapters by catalog name: `json`, `yaml`, `markdown`, `package`. Empty = the TypeScript/JavaScript adapter only. |
| `policy`     | Allowlist | the D6 block (see below)                             | The per-action allowlist (the shared factory block).                                                                                 |

An unknown `adapters` name fails loud at load:
`semantics: adapters must name known adapters (json, yaml, markdown, package)`.

## The policy block (D6)

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
is the next refinement).

No new ledger line: the package has no gated action.

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

An adapter owns either a set of extensions or an exact basename. The lookup checks the basename
FIRST (a file adapter such as `package.json` never falls through to the extension adapter), then the
lowercase dotted extension. The default registration is the TypeScript/JavaScript adapter (seven
extensions); the `adapters` names add the rest.

| Name       | Keys                               | Symbols                                            | References                                    | Rename                                            |
| ---------- | ---------------------------------- | -------------------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| (default)  | `.ts .tsx .mts .cts .js .mjs .cjs` | declarations (function/class/interface/type/const) | dotted qualified words whose head is declared | every occurrence of the identifier (head)         |
| `json`     | `.json`                            | every key (`key`)                                  | a string value that repeats a key's text      | every key and value token with that text          |
| `yaml`     | `.yml .yaml`                       | every mapping key (`key`)                          | a plain scalar that repeats a key's text      | every key token and matching plain scalar         |
| `markdown` | `.md .markdown`                    | every heading (`heading`)                          | every link target                             | every link target equal to the span's text        |
| `package`  | `package.json`                     | every dependency name (`dependency`)               | a name repeated in another dependency section | every occurrence of the name in the four sections |

The symbol kinds are the v0 TypeScript set plus the any-file kinds `key`, `heading` and
`dependency`. The spans are character offsets into the file; the rename plan's edits are the token's
inner range (a JSON/YAML key's quotes are never part of the edit). A Markdown heading rename is the
adapter's refusal: the anchor slug the renderer derives is not derivable honestly from the text.

## The deepener (the harness LSP seam)

`ctx.lsp` (`@deepseek-ai/dsh-lsp`) is the harness's language-server seam. It exposes exactly four
read operations - `goToDefinition`, `findReferences`, `goToImplementation`, `hover` - and no symbol
enumeration or rename/WorkspaceEdit, so the service adopts it as the PRIMARY reference answer for
the TypeScript/JavaScript extensions while the SYMBOLS still come from the lexical scan:

- one `findReferences` query per declared symbol, at the identifier's offset inside its declaration
  span, with `workspaceRoot` from config `root`;
- only same-file locations are kept (the model is per file);
- an answer replaces the lexical reference list and ledgers
  `deepened <path> (<n> references via lsp)`;
- the rename is derived from the same locations (`certainty: "references"`).

The seam is PROBED (`ctx.get("lsp")`), never injected (`inject` stays `["pluginFactory", "fs"]`).
Every "cannot answer" path - the seam absent, no provider for the extension, a failed query, a
non-`locations` result, an empty symbol list - is `undefined`: the lexical answer stands and no line
is added.

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

`deepened` is the ONE line this wave adds; every other line is unchanged. The count in
`adapters registered (<n> extensions)` is the registry size - extensions plus file names - so the
default registration stays exactly `adapters registered (7 extensions)`.
