# SCHEME - @playform/ets-lib-dsh-pack

The workspace-pack library of the suggester family: the pack schema, the layered resolution, the
strict YAML-subset parser, the merge rules, the workspace locator and the built-in pack for this
monorepo. **Not a plugin bundle** - no cordis patch, no loader contract, no ledger strings of its
own. The consumers own their ledger strings; this library only reads data and resolves roots.

## 1. The surface (named exports)

| Export       | Kind     | Purpose                                                                      |
| ------------ | -------- | ---------------------------------------------------------------------------- |
| `Builtin`    | Variable | the built-in pack for this monorepo (31 families, keyed `<domain>/<id>`)     |
| `Signature`  | Variable | the default marker list (`["Documentation/ARCHIVE-STYLE.md"]`)               |
| `Placement`  | Variable | the two layer locations and the probed extensions (`.yml`, `.yaml`, `.json`) |
| `Parse`      | Function | the strict YAML-subset parser (`string -> unknown`)                          |
| `Read`       | Function | read one pack file (`.json` -> JSON.parse, else Parse)                       |
| `Normalize`  | Function | fill the schema defaults and validate one pack                               |
| `Merge`      | Function | merge two packs (the rules in section 4)                                     |
| `Extends`    | Function | a pack's normalized `extends` list                                           |
| `Chain`      | Function | resolve the `extends` chain to its base packs (cycle-guarded)                |
| `Resolve`    | Function | the layered resolution for a root (section 3)                                |
| `Load`       | Function | the process memo of `Resolve` (one pack per home+root)                       |
| `Families`   | Function | one domain's families, priority-ordered, memoized per pack object            |
| `Locate`     | Function | the workspace gate: the root + the pack, or `undefined` (section 5)          |
| `Present`    | Function | whether a directory is a workspace candidate                                 |
| `Matches`    | Function | whether a pack's signature matches a directory                               |
| `Slug`       | Function | the repo slug (basename, lowercased)                                         |
| `Home`       | Function | the home directory (option, then HOME, then os.homedir())                    |
| `User`       | Function | the user layer's candidate paths for a slug                                  |
| `Repository` | Function | the repo layer's candidate paths                                             |
| `Pick`       | Function | the first existing path of a candidate list                                  |

Types: `Pack`, `Family`, `Signal`, `Target`, `Indexer`, `Policy`, `Learning`, `Located`, `Options`.

## 2. The pack schema (every section optional)

```yaml
slug: my-repo # optional: the repo slug (default: the root basename, lowercased)
signature: # optional: the marker paths (default: Documentation/ARCHIVE-STYLE.md)
    - docs/STYLE.md
extends: base # optional: a base pack name or an array of names (the user layer)
families: # optional: the families, keyed by <domain>/<id>
    "doc/Index":
        id: Index # optional: the unqualified ledger id (default: the key's last segment)
        priority: 5 # optional: lower wins (default 99)
        threshold: 0.75 # optional: the family's own gate (default 0.75)
        note: "" # optional: the one-phrase caveat (default "")
        familyGlobs: [] # optional: the long-tail globs (default [])
        signals: # optional (default [])
            - rule: index # default "rule"
              pattern: "(^|/)Documentation/INDEX\\.md$" # required
              weight: 2.5 # default 1
              tools: [read, grep] # optional: a tool-name restriction
        targets: # optional (default [])
            - path: docs/STYLE.md # required
              kind: style # optional (default "")
              prior: 1.0 # optional (default 0.6)
              reason: the row format # optional (default "")
              digest: "the row format" # optional: a hint a generated index may verify
indexer: # optional: the indexer section (a later wave consumes it)
    scope: [Documentation]
    excludes: [node_modules]
    languages: [typescript]
    maxFiles: 5000
policy: # optional: the per-action allowlist (a later lane consumes it)
    write: approve
    read: auto
learning: # optional: the learning settings (a later lane consumes it)
    propose: true
    refine: true
    window: 2
```

The `families` key is **domain-qualified**: `<domain>/<id>`, where the domain is the consumer
(`doc`, `edit`, `search`, `convention`, `test`, `replay`). The family's `id` stays unqualified
because it is the ledger's name. A bare key (no `/`) is kept but belongs to no domain, so no
suggester selects it.

## 3. The resolution (D2)

`Resolve(Root, { home })`:

1. **The repo layer.**

    The resolution reads the repo layer (`<root>/.dsh/pack.yml`, then `.yaml`, then `.json`) to
    discover a declared `slug`; the user layer is keyed by it.

2. **The user layer.**

    The resolution reads the user layer (`<home>/.dsh/playform/workspaces/<slug>.yml`, then `.yaml`,
    then `.json`).

3. **The built-in layer.**

    The resolution falls back to `Builtin` when no layer exists (this monorepo's default).

4. **The base chains.**

    The resolution resolves the union of both layers' `extends:` chains as the BASE: a named base is
    looked up in the user layer, a missing name is skipped, a name already visited is skipped (the
    cycle guard), and the deepest base comes first.

5. **The merge order.**

    The resolution merges the base packs first, then the user layer, then the repo layer - so the
    repo overrides the user, and both override their bases.

6. **The normalization.**

    The resolution normalizes the merged result once (section 2's defaults; a structurally invalid
    pack throws).

`Load(Root, { home })` memoizes `Resolve` per `(home, root)` for the process: a pack edit lands on
the next process by contract (a boot-time memo, not a watcher).

`Families(Pack, Domain)` selects the keys prefixed `<domain>/`, sorts by `priority` (lower wins) and
memoizes the list per pack object and domain.

## 4. The merge rules

- **families by id** (the qualified key): the override's DECLARED scalars replace (`priority`,
  `threshold`, `note`, `id`); its `signals` array replaces; its `targets` merge **by path** - a
  same-path target replaces the base target in place, a new path appends in override order;
- **targets** are replaced wholesale (a target is one row, not a field-merged object);
- **arrays replace** (`signature`, `familyGlobs`, `scope`, `excludes`, `languages`, `extends`);
- **scalars replace** (`slug`, `maxFiles`, `propose`, `refine`, `window`);
- **nested section objects** (`indexer`, `policy`, `learning`) merge key by key with the same rule;
- an **absent field never overwrites** the base: the layers are merged raw, then normalized once.

## 5. The workspace gate

`Locate(Path, Cwd, { home })` resolves the call path against the session cwd (when supplied, else
`process.cwd()`), starts at the path's directory (or its nearest existing ancestor), and walks UP to
the filesystem root. A directory is a CANDIDATE when it carries a repo layer, a user layer for its
slug, or the default signature. For a candidate it loads the pack and checks the signature: at least
ONE declared marker exists under the directory (the pack's `signature`, default
`Documentation/ARCHIVE-STYLE.md`). The first match returns `{ root, pack }`; no match returns
`undefined` - the suggester's `abstained foreign-workspace` silence.

A foreign workspace WITH a pack resolves (its pack declares its own signature); the same workspace
WITHOUT the pack does not.

## 6. The parser subset

Supported: block mappings; block sequences (`- value`, `- key: value` map items); plain,
single-quoted (`''` escape) and double-quoted (JSON escapes) scalars; `true`/`false`; `null`/`~`;
integers and decimals; flow sequences of scalars (`[a, b]`); the empty flow `[]` and `{}`; comments
(`#` at the line start or after whitespace); blank lines; `---` / `...` document markers.

Refused with a line-numbered error (never guessed): tabs, anchors (`&name`), aliases (`*name`), tags
(`!tag`), block scalars (`|`, `>`), non-empty flow mappings (`{a: b}`), multi-document files,
duplicate keys, bad indentation, an unterminated quote, and a sequence map item whose following keys
are not aligned under the item's content. A `.json` pack bypasses the parser entirely.

## 7. The built-in pack

31 families, keyed by the domain-qualified id, byte-for-byte the six suggesters' former embedded
packs:

| Domain       | Families | Ids                                                                        |
| ------------ | -------- | -------------------------------------------------------------------------- |
| `doc`        | 7        | Plan, Guide, Skill, PluginDoc, Index, Site, PackageProse                   |
| `edit`       | 7        | Version, Config, Symbol, Test, Doc, Prose, Workflow                        |
| `search`     | 10       | Version, Path, Ledger, Config, Dependency, Test, Symbol, Doc, Usage, Owner |
| `convention` | 4        | Layout, Naming, Docs, Ledger                                               |
| `test`       | 2        | Suite, Counts                                                              |
| `replay`     | 1        | Repeat                                                                     |

`Builtin.slug` is `deepseek`; `Builtin.signature` is `["Documentation/ARCHIVE-STYLE.md"]`. The
built-in pack carries no `indexer`, `policy` or `learning` section (those lanes land later).

## 8. Config fields

The library has **no Config schema** (it is not a plugin). The pack file IS the configuration; every
field is listed in section 2 with its default. A consumer's own Config (the suggesters') is
unchanged by this package - the pack is resolved per call, not configured.

## 9. Ledger strings

None. The library owns no ledger strings; the consumers keep their byte-exact lines. The new
`Pack-Driven` smoke folder in each suggester asserts the existing
`suggest`/`abstained foreign-workspace` lines against a temp pack.

## 10. The test folders

| Folder  | Checks | Covers                                                                    |
| ------- | ------ | ------------------------------------------------------------------------- |
| Resolve | 10     | the built-in fallback, the repo/user layers, the slug, the gate, the JSON |
| Merge   | 8      | families by id, targets by path, scalars/arrays, the sections             |
| Extends | 6      | the chain, the cycles, the missing link, the array of bases               |
| Parser  | 6      | the YAML subset, its refusals, the reader                                 |
