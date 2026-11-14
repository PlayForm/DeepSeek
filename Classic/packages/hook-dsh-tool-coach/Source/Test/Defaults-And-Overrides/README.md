# Defaults-And-Overrides

This test verifies the following behavior.

## Intent

This folder covers the harness-defaults projection and the user-override layer: the two halves of "a note must be actionable".

The note used to name ONE parameter - whatever the schema declared first - so a `head -40` offense was answered with `read` + `file_path`, the one call shape that cannot express a line range. The note now carries the harness's WHOLE parameter surface with each declared default, the generated static table carries the same projection, and the user's `toolDescriptions` cell overrides either layer per field.

It also pins the two detection corrections the same session exposed: `cd X && cmd` is no longer an offense (the ordinary shell idiom, whose replacement is the bash tool's own `workdir` parameter), and `nohup` now names `bash` (with its `run_in_background` parameter) instead of a tool the registry does not have.

## Scenario

- Group: the default extraction (4 checks) - `DefaultOf` reads the "Defaults to X." sentence, stops at the clause boundary, prefers the `default` annotation, and rejects a continuation clause ("Defaults to and is capped by configuration.").
- Group: the parameter projection (3 checks) - `ParamsOf` keeps the schema's declaration order and requiredness; `PrimaryOf` picks the first REQUIRED key rather than the first declared; an empty parameters object projects to no params.
- Group: the generated static table (3 checks) - `StaticCatalog` projects `read`'s `offset`/`limit` defaults, the table IS the harness catalog (not a hand-maintained copy), and `run_in_background` is a bash parameter rather than a table entry.
- Group: the composed note, live path (3 checks) - every parameter is named with its default, the call shape is rendered, and `working_directory`'s optional `cd` is named as optional instead of as a "key parameter".
- Group: the note cap (1 check) - `maxNoteParams: 1` truncates the surface and reports `+2 more` while the call shape stays complete.
- Group: the override layer (5 checks) - an empty map returns the catalog unchanged; a description-only override keeps the harness parameters; a params-only override keeps the harness description; an override may name a tool the catalog does not carry; the user's words reach the composed note.
- Group: the detection corrections (6 checks) - `cd X && cmd` and a bare `cd` are not offenses, a bare `pwd` still maps to `working_directory`, `nohup` maps to `bash`, a file-descriptor redirect (`2>&1 | tail`) no longer invents a pipeline that loses the exempt head, a real background `&` still splits, and every class lead describes what the command did.

## Fixtures

The harness world: `Make(Validate({ logFile: Ledger, ... }))` against the cleared tmpdir ledger, the `Post` waterfall helper, the live registry schema fixture (whose `read`/`edit`/`working_directory` entries now carry `required` and the harness's own "Defaults to X." parameter sentences), the pure `Detect` with the actual `DEFAULT_PATTERNS`/`DEFAULT_EXEMPTS`, and the built `Fetch`/`Override`/`Catalog` modules for the pure-function checks.

## Expected ledger strings (byte-exact)

- None: this folder asserts composed text and pure functions, and the only ledger traffic is the ordinary `strike` lines the ladder writes.

## Edge cases

- A parameter's default comes from TWO carriers: the `default` annotation wins, and the "Defaults to X." sentence is the harness's house convention (the shipped fs/shell/search tools all use the sentence).
- A continuation clause is not a default: "Defaults to and is capped by configuration." states nothing, so the parameter renders without one rather than with a bogus value.
- The override is per FIELD, so a user who rewords a description keeps the harness's parameter surface, and a user who pins the parameters keeps the harness's description.
- The static table and the live registry run through ONE projection, so a fetch outage cannot change what a note says about a tool's parameters.
- `cd` is deliberately not a row: the per-pipeline split cannot tell a harmless `cd X &&` prefix from a real directory change, so flagging it produced notes on legitimate calls.
- A file-descriptor redirect is not a background operator: `node x.js 2>&1 | tail -30` is ONE pipeline whose exempt head dominates, not two pipelines where the invented second one starts with `1`.

## Expected count

25 PASS.
