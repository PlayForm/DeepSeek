# Entry-And-Config

The folder states what this test verifies.

## Intent

The folder tests the entry seam and the config contract of the workspace graph.

A drift here breaks every later folder, so the folder is its own folder.

It covers acceptance checks A3 (the service registers on the fake ctx under `workspaceGraph`, and the declaration merging compiles) and the fail-loud config rule.

## Scenario

- **Group: the entry seam (A3).**

    - **Check: "entry: the service registers on the fake ctx under workspaceGraph (A3)".**

        The reflect capture of the fake ctx holds the real instance under `workspaceGraph`, and the instance name is `workspaceGraph`.

    - **Check: "entry: the class carries the loader contract (static inject, static Config)".**

        `static inject` is exactly `["fs", "storage"]`, `static Config` is the schema, and the class name is `WorkspaceGraph`.

    - **Check: "entry: the activation line is byte-exact".**

        The logger carries `graph: activated (domain=workspace_graph, languages=3)`.

    - **Check: "entry: the declaration-merged accessor types as the service (A3 compile proof)".**

        The typed accessor `(ctx: Context) => WorkspaceGraph => ctx.workspaceGraph` compiles, because tsc validates the declaration merge and the noemit pass gates the build on it.

- **Group: the config defaults and the volatile cells.**

    - **Check: "config: the schema defaults flow into the plain State config".**

        The Config of the State equals the frozen defaults (enabled false, domain workspace_graph, the three languages, empty include, the three default excludes, 1000000 / 5000 / 2000 / 50 / 500), including `maxFiles`, the one field that the indexing trigger added.

    - **Check: "config: every volatile field arrives as a cell and unwraps".**

        All ten fields arrive as `{ get }` cells from the schema, and the State carries the unwrapped plain values.

- **Group: fail-loud validation (each refusal on the exact message).**

    - **Check: "config: a wrong-typed field fails loud at the schema (Schemastery)".**

        `maxFileBytes: {}` throws the `expected number` error of Schemastery.

    - **Check: "fail-loud: an empty domain is rejected".**

        The exact message is `invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/`.

    - **Check: "fail-loud: a domain outside the unit-name pattern is rejected".**

        `Workspace Graph` gives the same exact message.

    - **Check: "fail-loud: empty languages are rejected".**

        The exact message is `invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"`.

    - **Check: "fail-loud: limitDefault above limitMaximum is rejected".**

        The exact message is `invalid config: limitDefault must not exceed limitMaximum`.

    - **Check: "fail-loud: a non-positive maxFiles is rejected (the walk bound)".**

        The exact message is `invalid config: maxFiles must be a positive integer`.

## Fixtures

- **The fake ctx.**

    Each check gets one fake ctx (the Harness `MakeGraph`) with empty `files` maps, because no I/O is needed here.

- **The fail-loud cases.**

    The cases pass plain configs with a valid base through the real constructor, so the Validate of the service is what throws.

## Expected ledger strings (byte-exact)

- **The activation line.**

    The line is `graph: activated (domain=workspace_graph, languages=3)`, the activation line of the default config, asserted verbatim.

## Edge cases

The wrong-typed field throws at the schema layer, and the structural refusals throw at the Validate layer of the service with the exact frozen messages.

## Expected count

12 PASS.
