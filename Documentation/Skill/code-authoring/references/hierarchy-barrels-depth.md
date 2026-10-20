# Hierarchy: Barrels, Depth With Specificity, Least Utility Floats Up

> Source: SKILL.md, Section 2 (Writing style), rule 6.

## The Rule

Group folders with barrel files. Depth grows with specificity.
Least-utility modules float to the top (shallowest).

## The Three Sub-Rules

### 1. Barrels

Folders that group siblings get a barrel file (an `index`/`mod` module)
that re-exports the folder's contents, so consumers import the GROUP
rather than enumerating leaves:

```
Source/
  Fn/
    index.ts        <- barrel: re-exports Validate, Resolve, Run
    Validate/
    Resolve/
    Run/
```

The barrel is the folder's public face. When a leaf's identity moves,
only the barrel changes - consumers importing the barrel never notice.

### 2. Depth grows with specificity

The tree's general direction: broad concepts shallow, specific concepts
deep.

```
Source/                  <- assembly (broadest)
  Fn/                    <- category of all functions
    Validate/            <- specific function
      Ledger/            <- (if needed) validation specialized to ledgers
```

Depth is EARNED by specificity: a folder exists at depth N+1 only
because it carves a niche its parent cannot express. This prevents the
"depth for its own sake" failure where wrappers nest five levels for a
single line each (the counterweight to
./references/one-definition-per-file.md).

### 3. Least utility floats to the top

The MOST-USED modules live at the SHALLOWEST depth. The import path
length is proportional to how niche the module is:

- The assembly surface: depth 1 (`Source/Library.ts`).
- Common functions: depth 2-3.
- Specialized leaves: deeper.

Rationale: import statements are a frequency-visibility map. The paths
typed most often should be shortest; deep paths should be rare and
meaningful. If a deep leaf is imported everywhere, it is not deep
material - promote it toward the top.

## Why Hierarchy Is a Style Rule and Not a Lint

1. **The tree is the first documentation.** A reader navigates by
   depth before reading any file: shallow = general, deep = specific.
   Violating that gradient (a crucial function buried at depth 6, a
   trivial helper at depth 1) makes the tree lie about its own
   contents.

2. **Barrels decouple structure from consumers.** Reorganization of
   leaves is a local edit; consumers of the barrel are untouched.
   Without barrels, every rename ripples into every import site.

3. **Utility-gradient prevents hotspots and ghost towns.** Floating
   least-utility modules up keeps the shallow layer populated with the
   things everyone needs, and pushes one-off specifics down where they
   stop distracting navigation.

## Examples

### Good

```
Source/Library.ts              shallow, used by all
Source/Fn/index.ts             barrel
Source/Fn/Run/                 common, shallow-ish
Source/Fn/ValidateLedgerFormat/   specific, deeper
```

### Bad

```
Source/Library.ts containing half the logic      assembly hoarding depth-0 work
Source/Fn/Run/Helpers/Util/Misc/deep/leaf.ts     depth without specificity
a one-use helper at depth 1                      utility inverted
```

## Failure Modes

- Barrel cycles (two barrels importing each other) - keep barrels
  re-exporting leaves only, never other barrels' siblings transitively
  without need.
- Deep nesting as ritual: every new function gets a folder regardless
  of specificity - depth is earned, not automatic.
- Promoting on import count alone: a widely-imported LEAF may deserve
  promotion, but the barrel may be the better fix (import the barrel,
  not the leaf).

## Arbiters

- Review: every grouped folder has a barrel; depth correlates with
  specificity; shallow layers hold the high-traffic modules.
- Import-path review: the most frequently imported paths are the
  shortest.
