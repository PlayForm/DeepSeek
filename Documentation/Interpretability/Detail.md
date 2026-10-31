# The Detail pass

The family's source is not merely well written: it is _structured knowledge_. A header comment in
`Source/Function/` carries a table of extensions, a rule per family, the boundary conditions, the
string templates, and the reason each exception exists. The site's job is to turn that knowledge
into machines, one plugin at a time, until a package page shows what the code knows.

## The nine steps, per plugin

1. **Harvest.** Read, in this order:
    1. **`SCHEME.md`** - 48 of the 60 packages ship one, and it is the deepest document in the tree:
       the domain, the pipeline, the trigger and non-trigger laws, the commutativity argument, the
       silence invariant, the registration, the config table, the test plan, and the interplay with
       its siblings. The governor's is 382 lines. A page that ignores the scheme draws the mechanism
       and misses the law the mechanism exists to satisfy.
    2. `Source/Function/` - the header comments, which carry the tables.
    3. `Config.ts` - the knobs and their defaults.
    4. `Source/Test/` - the exact strings.
    5. The twin tree, `EffectTS/packages/ets-<slug>/`, for the same files where they differ.
2. **Extract.** Pull out every _structured_ fact and write it as a list: a table (extensions to
   families), a rule (a `#` opens a comment only at a boundary), a template
   (`activated (k=v, ...)`), a set of variants (six field lists, one shape), an edge case
   (`undefined` skips the pair; an empty string is present), a state machine (pending to decided), a
   boundary (a size ceiling), a failure (an unknown extension returns `undefined` and the text is
   kept by identity).
3. **Classify.** Each fact is one of seven kinds, and the kind decides the machine:
    - a **table** of rows and columns -> `Grid` or `Matrix`
    - a **family** with a rule per member -> `Matrix` plus a `Callout` per exception
    - a **template** with variants -> `Schema` for the shape, `Line` per variant, `Difference` for
      the one field that changes
    - a **sequence** with branches -> `Flow`, `State`, `Fork`
    - a **boundary** with three outcomes -> `Ladder`, `Gate`
    - a **set of records** -> `Table`, `Chain`, `Record`
    - a **tree or a graph** -> `Constellation`, `Explorer`, `Fanout`
4. **Choose.** If two machines fit, take the one that adds the dimension the page lacks. If none
   fits, the machine is missing: build it in step 6 rather than flattening the fact into prose.
5. **Author.** The facts go in a `Source/Content/<Name>.ts` map, typed, with a header comment naming
   the source file and section each fact came from. No fact is typed into a page.
6. **Translate.** The scheme is read by the lane and written by hand, never parsed by the build.
   `SCHEME.md` is prose with mathematics in it: a pipeline written as a composition, a law written
   as a sentence with three conditions, an invariant written as "identical except". A build-time
   reader would flatten all three into text. The lane reads the section, decides what it _is_ - a
   pipeline, a law, an invariant, a commutativity square, a race that was accepted - and composes
   the machine that shows it. The translation is the work, and it is the reason the pages read as
   arguments rather than as documentation.
7. **Build.** A new atom or machine, tokens only, drawn from the specimens in `Temporary/Corca/` and
   the geometry in `~/Developer/Documentation/Module/ui`.
8. **Mount.** The package page gains a **Detail** section: the machines for this plugin's structured
   facts, in the order the facts matter. The page keeps its portrait, its flow, and its change; the
   detail is the deepest layer.
9. **Verify.** Build, the checks, and a browser read of the mounted page.

## What the two examples become

**The Detect table** (`hook-dsh-comment-filter`) is a matrix of seven families against their
extensions, with the exceptions as a callout each: `rb`'s `=begin`, `php`'s `#` and its `#[`
refusal, `cs` verbatim strings, the boundary sensitivity of the hash family, and the deliberate
absence of `md`, `mdx`, `json`, `txt`. A reader should see, in one grid, why a JSON string is never
stripped.

**The Activate composer** (`hook-dsh-tool-coach` and eight others) is a template with six field-list
variants: the `activated (` prefix, the `k=v` join, the `)` suffix, the `undefined` skip rule, the
empty-key bare segment, and the empty-string present rule. That is a `Schema` for the template, one
`Line` per variant, and a `Difference` on the pair that the variants disagree about.

## The batches

One lane takes three to five plugins, not one, because the facts cluster: the six normalizers share
a table shape, the governance trio shares a composer, the workspace family shares a state machine. A
lane that sees the cluster builds the machine once and mounts it five times.

The queue is the package list, richest comments first: `hook-dsh-comment-filter`,
`hook-dsh-tool-coach`, `hook-dsh-normalize-*` (six), `hook-dsh-ccr`, `plugin-dsh-gitguard`,
`hook-dsh-workspace-*` (eight), `plugin-dsh-factory`, `plugin-dsh-cost`, and then the rest.
