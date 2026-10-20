# Naming Rules: PascalCase, One Word, Action-Oriented, Present Tense, Singular, Full Words

> Source: SKILL.md, Section 2 (Writing style), rule 3.
> Includes the user's full-words amendment (2026-10-20): Configuration over Config, Environment over Env.

## The Rule

Names are PascalCase, one word, action-oriented, present tense,
singular, and full words (no abbreviations). Exceptions exist only when
documented.

The six properties, each with its full philosophy:

### 1. PascalCase

Every exported definition, every type, every folder carrying a
definition: `ValidateLedger`, `ReadManifest`, `PackageSource`. Not
camelCase (`validateLedger`), not snake_case (`validate_ledger`).
PascalCase marks the name as a definition-the-thing, uniform across
files, folders, and types, so case itself carries no decision.

### 2. One Word

Prefer the single most precise word: `Run`, `Validate`, `Package`.
Compound names (`ValidateManifestAgainstSchema`) mean the concept was
not atomized finely enough - the definition is trying to say two
things, and the atomization rule
(./references/one-definition-per-file.md) says split it. One word
is also the depth-with-specificity tradeoff working: the FOLDER PATH
supplies the context (`Source/Fn/Validate/`), so the leaf name does not
have to.

When one word genuinely cannot carry the meaning (two concepts in one
name like `LedgerEntry`), a tight compound is acceptable - but the
first resort is a better atomization, not a longer name.

### 3. Action-Oriented

Function names start with the verb: `Run`, `Read`, `Validate`, `Build`,
`Resolve`. A function does something; its name says what. Noun-named
functions (`ManifestValidation`) hide the action and read like types.

### 4. Present Tense

`Read`, not `Readed`/`HasRead`/`DidRead`. The name describes what the
definition does every time it is called, not a completed event.

### 5. Singular

`LedgerEntry`, not `LedgerEntries`. Collections are expressed by the
type that holds them (an array of `LedgerEntry`), not by pluralizing
the element name. Singular names stay correct whether the value holds
one or many.

### 6. Full Words (No Abbreviations) - the 2026-10-20 amendment

Every identifier prefers the full word over the abbreviation. The user's
exact examples:

- **`Configuration` over `Config` or `config`** or any similar short
  form.
- **`Environment` over `Env`** - "etc. etc. etc. full words": the two
  examples are instances of the general rule, not a closed list.

The general rule applied:

| Instead of | Write |
|------------|-------|
| `Config`, `config`, `Cfg` | `Configuration` |
| `Env` | `Environment` |
| `Msg` | `Message` |
| `Ctx` | `Context` |
| `Dir` | `Directory` |
| `Num` | `Number` |
| `Tmp` | `Temporary` |
| `Info` | `Information` |
| `Repo` | `Repository` |
| `Len` | `Length` |
| `Idx` | `Index` |

Why: abbreviations trade reader clarity for writer keystrokes. In this
workspace the reader is every future agent and human reviewing the
tree; `Config` forces each of them to re-derive "is this the loader
contract export? a config object? a key name?" while `Configuration`
never asks the question. Full words also survive renaming and grepping
better: `Configuration` matches every usage unambiguously.

## The Documented Exceptions

Exceptions exist ONLY when documented - two documented families:

1. **The loader-contract `Config` export.** The cordis plugin loader
   contract requires the exact export name `Config` (see
   ./references/nameless-default-exports.md). Machine-read names
   are fixed by the consumer, not chosen by style. This exception
   covers the export NAME ONLY: inside the code, variables and types
   about configuration still use `Configuration`.

2. **The `State`, `Set`, `Count` map names.** Names that are the
   established vocabulary of their domain (state containers, set
   operations, counters) are documented exceptions: they are nouns so
   standard that forcing verbs or longer forms would obscure them.
   They are exceptions because they are DOCUMENTED here, per the rule's
   own clause - an undocumented exception is just a violation.

## Examples

### Good

```
Source/Fn/Validate/          export default async (entry) => {...}
Source/Struct/LedgerEntry/   export default interface LedgerEntry {...}
Source/Fn/Resolve/           resolves the plugin path from Configuration
                             and Environment values
```

### Bad

```
Source/Fn/doStuff/           not action-oriented, not PascalCase, not one word
Source/Struct/entries/       plural
Source/Fn/CfgLoader/         abbreviation (and compound where atomization was wanted)
Source/Fn/HasReadFile/       past/participle tense
export const readManifest = ...   named export outside the contract
```

## Failure Modes

- Abbreviations creeping back one at a time ("just this once, `Ctx` is
  so common") - the table above is the arbiter; each abbreviation is a
  finding.
- Compounds growing to smuggle in un-atomized concepts.
- Verb-less names for functions because the folder already says the
  action - the leaf name still carries the verb; the path carries the
  context.

## Arbiters

- Review: every name passes all six properties or cites its documented
  exception.
- The full-words table: any abbreviation identifier outside the
  documented exceptions is a finding, with `Configuration` and
  `Environment` as the canonical replacements.
