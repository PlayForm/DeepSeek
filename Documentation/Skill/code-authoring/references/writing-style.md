# The Writing Style: Seven Rules

The style exists for one property: any definition can be borrowed in
isolation, and every file reads the same way. The rules are not aesthetic
preferences; each one removes a class of coupling or ambiguity.

## 1. One definition per file

One exported function or one exported type per leaf, in its own folder.

```text
Source/
  Library.ts                  the assembly surface: imports and composes
  Function/
    ReadManifest/
      index.ts                one function
    ValidateLedger/
      index.ts                one function
  Interface/
    LedgerEntry/
      index.ts                one type
```

A small private helper used only by that definition may share the leaf.
A helper used by two leaves is itself a definition and gets its own.

The assembly surface is the one file allowed to be wiring only. When it
grows a body, the monolith is returning.

Bad shape: `utils.ts` with fourteen unrelated functions, `types.ts` with
every interface, `index.ts` with wiring plus leaked logic. Borrowing from
that shape means borrowing everything.

## 2. Nameless default exports

```typescript
export default async (Context) => { ... };
export default interface LedgerEntry { ... };
```

The folder already names the definition; a named export repeats it and
creates a second place to keep in sync. The exception is the plugin entry,
which carries exactly the loader-contract names:

```typescript
export const name = "hook-dsh-example";
export const apply = ...;
export const Config = ...;
export const inject = ...;
export default { name, apply, Config, inject };
```

Named exports anywhere else are a finding. So is a non-contract named
export at the entry.

## 3. Names: PascalCase, one word, action-oriented, present tense, singular, full words

| Property        | Write             | Not                  |
| --------------- | ----------------- | -------------------- |
| PascalCase      | `ValidateLedger`  | `validateLedger`     |
| One word        | `Resolve`         | `ResolveManifestPathFromConfiguration` |
| Action-oriented | `Read`, `Build`   | `ManifestValidation` |
| Present tense   | `Read`            | `HasRead`, `DidRead` |
| Singular        | `LedgerEntry`     | `LedgerEntries`      |
| Full words      | `Configuration`   | `Config`, `Cfg`      |

The full-word table (the canonical replacements):

```text
Env -> Environment        Config -> Configuration      Ctx -> Context
Msg -> Message            Dir -> Directory             Num -> Number
Info -> Information       Repo -> Repository           Len -> Length
Idx -> Index              Param -> Parameter           Init -> Initialize
Impl -> Implementation    Dep -> Dependency            Expr -> Expression
Attr -> Attribute         Exec -> Execute              Txt -> Text
Temp -> Temporary         Prev -> Previous             Cur -> Current
Req -> Request            Resp -> Response             Val -> Value
Max -> Maximum            Min -> Minimum                Meta -> Metadata
Sync -> Synchronize       Async -> Asynchronous        Doc -> Documentation
App -> Application        Btn -> Button                Fac -> Factory
Gov -> Governor           Id -> Identifier             Spec -> Specification
Util -> Utility
```

Genuine acronyms stay: DSH, ETS, CCR, JSON, HTML, URL, HTTP, UI, TTL,
NPM, SVG, FS. The distinction: an acronym names a thing (a protocol, a
format, a product); a word-abbreviation shortens a word.

Documented exceptions:

1. The loader-contract `Config` export (machine-read).
2. Machine-read contract names: schema keys, tool fields, package names,
   entry ids, ledger strings.
3. The `State`, `Set`, and `Count` domain vocabulary.
4. Upstream API names: external symbols are never renamed.

An undocumented exception is a violation.

## 4. Inline single-use bindings

A binding survives only if it is used more than once, or if it names a
setup-time invariant the rest of the code must not recompute.

```typescript
// Bad: the name adds nothing
const content = await Read(File);
await Write(File, content);

// Good
await Write(File, await Read(File));
```

The judgment call: if inlining makes a line unreadable, or the name
explains a subtle condition the expression does not show, the binding may
survive. The test is whether the name adds information, not whether the
expression is short.

## 5. switch (true) for guard chains

Three or more `if (condition) return value;` lines become:

```typescript
switch (true) {
  case Exists(Candidate): return Candidate;
  case Exists(Fallback): return Fallback;
  default: throw new Error("no candidate found");
}
```

Every arm returns or throws; the `default` closes the set. Do not force
the form on a single `if`, on loops, or on arms that need side effects
beyond returning.

## 6. Hierarchy: barrels, depth with specificity, utility floats up

- Grouped folders get a barrel that re-exports their leaves.
- Depth is earned by specificity: a folder at depth N+1 carves a niche its
  parent cannot express.
- The most-used modules sit shallowest; import-path length tracks how
  niche a module is.

## 7. Behavior-identical refactors

A refactor changes structure, not behavior. The ledger strings, the
observable outputs, and the silence invariant stay byte-identical. The
smoke suite is the arbiter, and its counts do not change.

See `review-and-refactors.md` for the protocol.

## The review pass

For every changed file:

- [ ] One meaning-bearing definition per leaf; no `utils`/`types` grab bags.
- [ ] Anonymous default export outside the entry; contract names only at
      the entry.
- [ ] Names pass the six properties or cite a documented exception.
- [ ] Every binding is reused, invariant, or inlined.
- [ ] Guard chains of three or more are `switch (true)`.
- [ ] Depth correlates with specificity; grouped folders have barrels.
- [ ] No terminal content operation in the session.
- [ ] The byte scan is clean after any bulk pass.
