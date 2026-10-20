# Nameless Default Exports (The Loader-Contract Exceptions)

> Source: SKILL.md, Section 2 (Writing style), rule 2.

## The Rule

`export default async () => {}` everywhere. Only the plugin ENTRY may
carry the loader-contract named exports: `name`, `apply`, `Config`,
`inject` - and the default object `{ name, apply, Config, inject }`.

## Why Nameless Defaults Are the Default

1. **The name lives at the file, not the symbol.** In the atomized tree
   (see ./references/one-definition-per-file.md), the folder and
   file name already say what the module is. A named export repeating
   that name is a second place to keep in sync - and a third when the
   import site aliases it anyway.

2. **Borrow-in-isolation gets simpler.** A nameless default can be
   imported as `Run` here and `Execute` there without renaming the
   source. Named exports force one identifier to be correct for every
   consumer and every context.

3. **Refactors shrink.** Renaming a concept means renaming a folder
   plus updating import sites. With named exports it also means
   updating the export statement and reconciling every alias.

4. **Uniformity reads faster.** Every leaf has the same shape: default
   export, one definition. The eye learns the pattern once and then
   reads every file at the same speed.

## The Exception: The Loader Contract

The plugin ENTRY is not ordinary code - it is the surface the loader
consumes. The loader-contract names are part of the API:

| Named export | Loader's use |
|--------------|--------------|
| `name` | plugin identity in the registry, logs, and config keys |
| `apply` | the entrypoint the loader invokes |
| `Config` | the configuration schema the loader validates against |
| `inject` | the services the plugin requests |
| `default { name, apply, Config, inject }` | the assembled plugin object |

These names are load-bearing in the exact form the contract requires.
They are NOT style violations: the exception exists because the
consumer (the loader) is machine code, not a human reader, and no
folder name can substitute for a schema key.

## The Boundary

- Named exports anywhere OTHER than the plugin entry: violation.
- Named exports at the entry that are NOT part of the contract:
  violation - the entry carries exactly the contract names and nothing
  else.
- Library modules consumed only inside the plugin: nameless defaults.
- The rule applies per-file; a leaf that is itself an entry point of a
  sub-bundle may carry contract names if that bundle's loader requires
  them (documented per bundle).

## Failure Modes

- Named exports spreading "for convenience" - one named export makes
  the next one feel acceptable; the tree's uniformity decays.
- The entry file accumulating non-contract named exports ("helper
  re-exports") - the entry is wiring only; helpers live in leaves.
- Inline `export default function Foo() {}` - the name attaches anyway.
  The default export is anonymous by design.

## Arbiters

- Review: every non-entry leaf exports exactly one anonymous default;
  the entry carries only the contract names.
- Grep for `export const|export function|export class` outside
  sanctioned entry files - any hit is a finding.
