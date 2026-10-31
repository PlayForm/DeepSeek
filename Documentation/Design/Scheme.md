# Scheme

## The claim

A package's own `SCHEME.md`, drawn as three bands: the pipeline it runs, the laws that decide when
it runs, and the invariant that keeps it invisible. The machine leaves the law with the reader, not
the mechanism that satisfies it: P composes with U, three laws decide whether either runs, and two
columns say what the change does and does not touch.

The machine answers: **what does this package promise, in its own document, and what stays identical
because of it?**

## The sources

| Source                                                                | What was taken                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Site/Source/Component/Scheme.astro`                                  | The three bands and their order: the pipe, the law, the silence. The two-digit index, the mark per condition, the `data-hold` attribute a law row carries, and the two side labels.                                                                                |
| `Site/Source/Stylesheet/Component/Scheme.scss`                        | The geometry: the pipe as an auto-fit grid with a 220px floor, the law row as `minmax(110px, 140px)` plus the claim, the tests in the second track, the 8px accent mark, and the silence as two panels with a 240px floor and the warn face on the different side. |
| `Site/Source/Content/Scheme.ts`                                       | The record shape, `Slug`, `Pipeline`, `Law`, `Silence`, and the one record the site has, transcribed from the governor's `SCHEME.md` sections 2 to 5.                                                                                                              |
| `Site/Source/pages/package/[slug].astro`                              | The mount: a `Scheme` section gated on `SchemeFor(Entry.Slug) !== undefined`, with the lede quoted below.                                                                                                                                                          |
| `Temporary/Corca/Curated/Components.md`                               | The object-row grammar: a label at the left, a value at the right, a hairline between rows, no outer border. The law rows are that grammar.                                                                                                                        |
| `Temporary/component-page-composition-recipes.json`                   | M04.R03, aligned worlds: one row, two faces, and no duration claim from the coordinates. The silence band is that recipe with two lists instead of two runs.                                                                                                       |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/steps.tsx` | The complete, current, upcoming vocabulary, read and then refused: the law's mark is not a step state, because a condition is not progress.                                                                                                                        |
| `Classic/packages/hook-dsh-package-governor/SCHEME.md`                | The pipeline G = U o P, the trigger and non-trigger laws, the commutativity section, and the silence invariant.                                                                                                                                                    |

Three things were borrowed: a mechanic (three bands, each answering one question), a geometry (the
law's label column and the pipe's equal tracks), and a state model (a condition holds or it does
not, and the row carries the verdict without a word).

## The copy

The section that mounts it prints `Scheme` and
`The laws the package states in its own SCHEME.md: when it runs, what it refuses, and what stays identical because of it.`

The machine prints, in order:

Pipe:

1. `01`
2. `P`
3. `The chain pass: decode, satisfy the registry, and rewrite a chain-governed pin. Pure, deterministic, idempotent.`
4. `02`
5. `U`
6. `The update stage: policy-gated, cooldown-guarded, async, and skipped when the chain pass changed nothing.`

Law:

7. `Trigger`
8. `The governor fires only on an author write to a package.json.`
9. `observation.kind is present`
10. `actor.name is write, edit, or str_replace_editor`
11. `basename(displayPath) is package.json`
12. `Exclusion`
13. `A path inside the tooling is never governed.`
14. `no path segment is node_modules, .git, .dsh, .pnpm, .store`
15. `no path segment is the harness application bundle`
16. `Non-trigger`
17. `The governor does not trigger itself.`
18. `its own write goes through the fs service, which dispatches no fs/observed`
19. `its update stage is a continuation, not an author call`

Silence:

20. `Identical with and without`
21. `the tool result the author receives`
22. `the transcript the model reads`
23. `the session events the log records`
24. `Different, and only here`
25. `the bytes on disk, discoverable only by a later read`
26. `the ledger line the module writes`

The machine prints no figure. It counts nothing, so the copy carries no count and the storyboard
does not invent one.

## The layout

```
+----------------------------------------------------------------------+
| SCHEME                                                               |
| the pipeline, the laws, and the silence invariant                    |
+----------------------------------------------------------------------+
| PIPE    one row, one track per stage, 220px floor                    |
| 01 P    the chain pass: decode, satisfy, rewrite a chain pin         |
| 02 U    the update stage: gated, async, skipped when P changed       |
+----------------------------------------------------------------------+
| LAW     name track 110 to 140px, the claim beside it                 |
| Trigger        three tests, one per line, an 8px accent mark         |
| Exclusion      two tests                                             |
| Non-trigger    two tests                                             |
+----------------------------------------------------------------------+
| SILENCE  two panels, 240px floor each, warn face on the right        |
| Identical with and without      | Different, and only here           |
| the tool result the author gets | the bytes on disk                  |
| the transcript the model reads  | the ledger line                    |
| the session events              |                                    |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The pipe is one row of equal tracks, so two stages share the width and a
third would take a second row; the law is a two-track grid whose first track is 110 to 140px and
whose second holds both the claim and the tests; the silence is two panels with a 240px floor, and
the right panel is the only face on the shape that is not the cabinet front.

## The machines

Scheme adds the one thing no other machine on the package page draws: a law. Every other machine
says what a package does; this one says what it refuses, and the refusal is what a reader checks
before trusting the rest.

| Neighbour on the same page | What it already says                          | What Scheme must not say                                                            |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Flow                       | the order of the work, with the branch inline | the stages as a sequence with a failure path. The pipe is a composition, not a run. |
| Activation                 | the line the plugin writes on load            | the fields of that line, or the rules that compose it                               |
| Portrait                   | what the package is, in one line              | what the package refuses to touch                                                   |
| Default                    | what the harness does at the seam alone       | the laws that decide whether the plugin acts at all                                 |

When the record is absent the section is not rendered. A package with no `SCHEME.md` gets no law
band, and the page does not substitute a summary for it.

## The decisions

| Decision                                     | The alternative rejected                              | Why                                                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three bands, in the order pipe, law, silence | One band that names the stages and the tests together | The document the machine draws is three sections in that order. A reader with the file open should be able to point at the band that answers the paragraph they are reading.              |
| The condition is a mark plus a line          | A checklist with boxes                                | A box says a reader can change it. A condition holds or it does not, and the plugin decides which; a checkbox would promise an interaction the page does not have.                        |
| A solid 8px accent square as the mark        | A tick glyph                                          | The site has no icon for "true", and inventing one would give one band a vocabulary of its own. A square is a token, not a symbol.                                                        |
| The silence is two panels side by side       | One sentence: the author sees nothing                 | The invariant is three identical things and two different ones. A sentence loses both lists, and the lists are the claim.                                                                 |
| The right panel takes the warn face          | Both panels the same                                  | The difference is the one fact a reader must not miss. The warn token is the site's vocabulary for exactly that, and it is used once on the shape.                                        |
| The pipe is a grid of stages                 | An arrow chain between the stages                     | The scheme writes a composition. An arrow would add a direction the document does not claim, and the flow already draws direction on the same page.                                       |
| The record is typed and transcribed by hand  | Parsing `SCHEME.md` at build time                     | The scheme is prose with headings, not a schema. A parser would guess at a law's conditions, and a guess in a law band is worse than a transcription that names its file and its section. |
| One record only                              | A placeholder scheme for every package                | A law band with no law behind it is a lie a reader cannot catch. The gate is the honest answer.                                                                                           |
| The index is two digits                      | A bullet                                              | The stages are a composition, and the number says the order without adding an arrow. The index matches the numbering the corpus's own stage recipes use.                                  |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/package/hook-dsh-package-governor`, inside the `Scheme` section,
as the only package whose `SCHEME.md` the site has transcribed. The page that proves it is that
package page, and the record it draws is `Site/Source/Content/Scheme.ts`.

What is not drawn yet: the registry walk-up that the pipe's first stage names, and the update
stage's dual mode, which is one sentence in the pipe rather than a fork. The second is the larger
gap, because the band cannot tell a reader whether the update stage runs inside the harness's
process or as a detached continuation.
