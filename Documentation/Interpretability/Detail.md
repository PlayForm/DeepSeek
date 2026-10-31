# The Detail pass

The family's source is not merely well written: it is *structured knowledge*. A header comment in
`Source/Function/` carries a table of extensions, a rule per family, the boundary conditions, the
string templates, and the reason each exception exists. The site's job is to turn that knowledge
into machines, one plugin at a time, until a package page shows what the code knows.

## The eight steps, per plugin

1. **Harvest.** Read both trees: `Classic/packages/<slug>/Source/` and
   `EffectTS/packages/ets-<slug>/Source/`. Start with the header comments in `Source/Function/`,
   then the module that names the tables, then `Config.ts`, then the tests, which carry the exact
   strings.
2. **Extract.** Pull out every *structured* fact and write it as a list: a table (extensions to
   families), a rule (a `#` opens a comment only at a boundary), a template (`activated (k=v, ...)`),
   a set of variants (six field lists, one shape), an edge case (`undefined` skips the pair; an empty
   string is present), a state machine (pending to decided), a boundary (a size ceiling), a failure
   (an unknown extension returns `undefined` and the text is kept by identity).
3. **Classify.** Each fact is one of seven kinds, and the kind decides the machine:
   - a **table** of rows and columns -> `Grid` or `Matrix`
   - a **family** with a rule per member -> `Matrix` plus a `Callout` per exception
   - a **template** with variants -> `Schema` for the shape, `Line` per variant, `Difference` for the
     one field that changes
   - a **sequence** with branches -> `Flow`, `State`, `Fork`
   - a **boundary** with three outcomes -> `Ladder`, `Gate`
   - a **set of records** -> `Table`, `Chain`, `Record`
   - a **tree or a graph** -> `Constellation`, `Explorer`, `Fanout`
4. **Choose.** If two machines fit, take the one that adds the dimension the page lacks. If none
   fits, the machine is missing: build it in step 6 rather than flattening the fact into prose.
5. **Author.** The facts go in `Source/Content/Detail/<Slug>.ts`, typed, with a header comment naming
   the source file and line each table came from. No fact is typed into a page.
6. **Build.** A new atom or machine, tokens only, drawn from the specimens in `Temporary/Corca/` and
   the geometry in `~/Developer/Documentation/Module/ui`.
7. **Mount.** The package page gains a **Detail** section: the machines for this plugin's structured
   facts, in the order the facts matter. The page keeps its portrait, its flow, and its change; the
   detail is the deepest layer.
8. **Verify.** Build, the checks, and a browser read of the mounted page.

## What the two examples become

**The Detect table** (`hook-dsh-comment-filter`) is a matrix of seven families against their
extensions, with the exceptions as a callout each: `rb`'s `=begin`, `php`'s `#` and its `#[` refusal,
`cs` verbatim strings, the boundary sensitivity of the hash family, and the deliberate absence of
`md`, `mdx`, `json`, `txt`. A reader should see, in one grid, why a JSON string is never stripped.

**The Activate composer** (`hook-dsh-tool-coach` and eight others) is a template with six field-list
variants: the `activated (` prefix, the `k=v` join, the `)` suffix, the `undefined` skip rule, the
empty-key bare segment, and the empty-string present rule. That is a `Schema` for the template, one
`Line` per variant, and a `Difference` on the pair that the variants disagree about.

## The batches

One lane takes three to five plugins, not one, because the facts cluster: the six normalizers share a
table shape, the governance trio shares a composer, the workspace family shares a state machine. A
lane that sees the cluster builds the machine once and mounts it five times.

The queue is the package list, richest comments first: `hook-dsh-comment-filter`,
`hook-dsh-tool-coach`, `hook-dsh-normalize-*` (six), `hook-dsh-ccr`, `plugin-dsh-gitguard`,
`hook-dsh-workspace-*` (eight), `plugin-dsh-factory`, `plugin-dsh-cost`, and then the rest.
