# One Definition Per File (The Atomized Rust-Style Tree)

> Source: SKILL.md, Section 2 (Writing style), rule 1.
> User-specified; battle-tested on `@local/dsh-hook-package-governor`. SKILL.md only points here.

## The Rule

Every function, every type lives in its own deeply nested folder/file.
The tree is atomized in the Rust style - mirroring `Cargo/Run`'s
`Source/Library.rs` + `Fn/` + `Struct/` pattern - so that any piece can
be borrowed in isolation.

## The Shape

```
Plugin/
  Source/
    Library.rs            <- the assembly surface (imports + composition)
    Fn/
      ReadManifest/
        Mod.rs            <- one function definition
      ValidateLedger/
        Mod.rs            <- one function definition
    Struct/
      LedgerEntry/
        Mod.rs            <- one type definition
      Package/
        Mod.rs            <- one type definition
```

In the TypeScript/JavaScript plugins of this workspace, the same shape
appears as directories with a default-exporting module per definition.

## The Rationale: Borrow-in-Isolation

1. **Any piece can be lifted without excavation.** When a second plugin
   needs `ValidateLedger`, it copies one folder. Under a many-definitions-
   per-file layout, borrowing means extracting a region from a file that
   carries five other definitions' imports, closures, and side effects.

2. **Diff and review granularity matches concept granularity.** A
   change to one function touches one file. Reviews, blame, and merges
   stop contending over shared-file hotspots.

3. **The borrow forces dependency honesty.** To borrow a folder you
   must see exactly what it imports. Atomized trees keep import lists
   short and visible at the top of each leaf; a definition with ten
   imports announces its coupling openly.

4. **Compilation/test surface per concept.** A leaf can be checked,
   read, or reasoned about alone - `node --check` on one file, one read
   call covering the whole definition.

## What Counts as "One Definition"

- One exported function OR one exported type per leaf.
- Small private helpers USED ONLY by that definition may live in the
  same leaf - the leaf is the unit of meaning, not mechanically one
  symbol. But a helper used by two leaves is itself a definition and
  gets its own.
- The assembly surface (Library.rs / the entry module) is not a
  definition: it imports and composes. It is the one file allowed to
  be "just wiring."

## Bad Shape

```
utils.ts        <- 14 unrelated functions, 600 lines
types.ts        <- every interface in the plugin
index.ts        <- wiring + half the logic leaked in
```

This shape is what the rule exists to kill: borrowing anything from
`utils.ts` means borrowing everything, and any edit risks every
consumer.

## Failure Modes

- Atomization as performance theater: folders nested ten deep for
  single-line wrappers (see ./references/hierarchy-barrels-depth.md
  for the depth-with-specificity counterweight).
- Definitions split across leaves because a helper was shared lazily -
  shared logic must be its own leaf, named for what it does.
- The assembly surface accreting logic - the "just wiring" file growing
  a body is the first step back to the monolith.

## Arbiters

- Review: every leaf contains exactly one meaning-bearing definition;
  no grab-bag files (`utils`, `types`, `helpers`, `common`).
- Borrow test: any leaf can be moved to another plugin by copying its
  folder plus its named imports.
