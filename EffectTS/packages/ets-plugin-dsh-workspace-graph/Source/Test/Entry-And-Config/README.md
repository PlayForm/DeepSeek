# Entry-And-Config

What this test verifies.

## Intent

The entry seam and the config contract of the workspace graph. A drift here
breaks every later folder, so it is its own folder. Covers acceptance checks
A3 (the service registers on the fake ctx under `workspaceGraph`; the
declaration merging compiles) and the fail-loud config rule.

## Scenario

- Group: the entry seam (A3).
    - Check: "entry: the service registers on the fake ctx under
      workspaceGraph (A3)" - the fake ctx's reflect capture holds the real
      instance under `workspaceGraph`, and the instance name is
      `workspaceGraph`.
    - Check: "entry: the class carries the loader contract (static inject,
      static Config)" - `static inject` is exactly `["fs", "storage"]`,
      `static Config` is the schema, and the class name is `WorkspaceGraph`.
    - Check: "entry: the activation line is byte-exact" - the logger carries
      `graph: activated (domain=workspace_graph, languages=3)`.
    - Check: "entry: the declaration-merged accessor types as the service
      (A3 compile proof)" - the typed accessor `(ctx: Context) =>
      WorkspaceGraph => ctx.workspaceGraph` compiles (tsc validates the
      declaration merge; the noemit pass gates the build on it).
- Group: the config defaults and the volatile cells.
    - Check: "config: the schema defaults flow into the plain State config" -
      the State's Config equals the frozen defaults (enabled false, domain
      workspace_graph, the three languages, empty include, the three default
      excludes, 1000000 / 5000 / 2000 / 50 / 500) - including `maxFiles`, the
      one field the indexing trigger added.
    - Check: "config: every volatile field arrives as a cell and unwraps" -
      all ten fields arrive as `{ get }` cells from the schema and the State
      carries the unwrapped plain values.
- Group: fail-loud validation (each refusal on the exact message).
    - Check: "config: a wrong-typed field fails loud at the schema
      (Schemastery)" - `maxFileBytes: {}` throws Schemastery's
      `expected number` error.
    - Check: "fail-loud: an empty domain is rejected" - exact message
      `invalid config: domain must be a lowercase unit name matching
      /^[a-z][a-z0-9_]*$/`.
    - Check: "fail-loud: a domain outside the unit-name pattern is rejected" -
      same exact message for `Workspace Graph`.
    - Check: "fail-loud: empty languages are rejected" - exact message
      `invalid config: languages must be a non-empty array of "typescript" |
      "javascript" | "markdown"`.
    - Check: "fail-loud: limitDefault above limitMaximum is rejected" - exact
      message `invalid config: limitDefault must not exceed limitMaximum`.
    - Check: "fail-loud: a non-positive maxFiles is rejected (the walk bound)" -
      exact message `invalid config: maxFiles must be a positive integer`.

## Fixtures

- One fake ctx per check (the Harness `MakeGraph`), empty `files` maps - no
  I/O is needed here.
- The fail-loud cases pass plain configs with a valid base through the real
  constructor, so the service's own Validate is what throws.

## Expected ledger strings (byte-exact)

- `graph: activated (domain=workspace_graph, languages=3)` (the default
  config's activation line, asserted verbatim).

## Edge cases

- The wrong-typed field throws at the schema layer; the structural refusals
  throw at the service's Validate layer with the exact frozen messages.

## Expected count

12 PASS.
