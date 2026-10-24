# Adapters (the any-file adapters and the LSP deepener)

The folder covers the semantic model's adapter surface beyond the default
TypeScript/JavaScript one, plus the harness LSP seam as the primary TypeScript
reference answer.

## What it exercises

- **The opt-in registration.** `adapters: ["json", "yaml", "markdown",
  "package"]` registers four adapters beside the seven TypeScript/JavaScript
  extensions: 7 -> 8 (.json) -> 10 (.yml/.yaml) -> 12 (.md/.markdown) -> 13
  (the `package.json` basename key). Each step is one byte-exact
  `adapters registered (N extensions)` line; the count is the registry size
  (extensions plus file names).
- **JSON keys** (`/repo/data.json`): the keys are symbols, a string VALUE that
  repeats a key's text is a reference, and the rename rewrites both tokens.
- **YAML keys** (`/repo/config.yml`): the mapping keys are symbols, a plain
  scalar repeating a key's text is a reference, and the rename rewrites both.
- **Markdown link targets** (`/repo/doc.md`): the headings are symbols, every
  link target is a reference, and the rename rewrites every equal target (a
  heading rename is the adapter's refusal - the anchor slug is not derivable).
- **package.json dependency names** (`/repo/package.json`): the dependency
  names are symbols, a name listed in a second dependency section is a
  reference, and the model's `dependencies` list is the names themselves. The
  basename wins over the `.json` extension, so this file never gets the plain
  JSON key model.
- **The LSP deepener** (`ctx.lsp`, the harness seam): one
  `findReferences` query per declared symbol at the identifier's position,
  `workspaceRoot` from config `root`; only same-file locations are kept (the
  model is per file). The deepened answer replaces the lexical list and logs
  `deepened <path> (N references via lsp)`; the rename is derived from the same
  locations.
- **The lexical fallback** on every "cannot answer" path: `lsp: false`, a seam
  without a `query` method, a throwing seam, and a non-`locations` result all
  keep the lexical reference list and add no line.
- **The fail-loud validation** of the new knobs: an unknown adapter name is
  refused with the catalog in the message; a non-string `root` and a non-array
  `adapters` fail at the schema layer.

## The fixtures

The text fixtures are inline constants; the fake `fs` returns them by path, and
the fake `lsp` is an object on the fake context (`ctx.get("lsp")`), so the seam
is exercised exactly as the service probes it - never injected.

## Expected ledger strings (byte-exact, `semantics: ` prefix)

`adapters registered (7 extensions)`, `adapters registered (8 extensions)`,
`adapters registered (10 extensions)`, `adapters registered (12 extensions)`,
`adapters registered (13 extensions)`,
`resolved /repo/data.json (2 symbols, 1 references)`,
`resolved /repo/config.yml (3 symbols, 1 references)`,
`resolved /repo/doc.md (1 symbols, 2 references)`,
`resolved /repo/package.json (2 symbols, 1 references)`,
`resolved /repo/a.ts (1 symbols, 2 references)`,
`resolved /repo/a.ts (1 symbols, 1 references)`,
`deepened /repo/a.ts (2 references via lsp)`,
`planned rename alpha -> gamma in /repo/data.json (2 edits, references)`,
`planned rename name -> label in /repo/config.yml (2 edits, references)`,
`planned rename ./other.md -> ./elsewhere.md in /repo/doc.md (2 edits, references)`,
`planned rename alpha -> gamma in /repo/package.json (2 edits, references)`,
`planned rename foo -> baz in /repo/a.ts (2 edits, references)`.

## Expected count

23 PASS.
