# Packet-And-Budget - the packet build and the budget clamp

The suite tests the orientation packet against a fake sibling workspace-graph: the eight fixed sections, the ranked neighbors, the lens filtering, the honest degradation, the staleness contract, the budget clamp, the optional token meter, the tool surface, and the purity.

## Scenarios

- **K1.**

    An absent sibling graph degrades to the honest OPEN line (`workspace graph unavailable ...`) and never to a crash, and the packet line is byte-exact in the logger and the durable ledger.

- **K2.**

    The focus by id gives the exact MAP ordering (biggest directory first), the FOCUS line, the neighbors ranked by edge strength (calls > imports > references), the evidence list, and the focus tracking with its journal line.

- **K3.**

    The docs lens filters the edges, and `mapLimit` caps the MAP.

- **K4.**

    An unknown default lens reports itself through the OPEN line and filters nothing.

- **K5.**

    In the staleness contract a mismatched caller version reports `caller held <v>, current <v>` and bumps the stale counter with its journal line, and a matching version stays fresh.

- **K6.**

    In the budget clamp an oversized packet drops the neighbors first, clamps under the maximum, bumps the clamped counter, and journals the byte-exact `clamped (<from> -> <to> tok, budget <max>)` line.

- **K7.**

    The clamp honors the harness `tokenMeter` and writes the exact `clamped (999 -> 999 tok, budget 4000)` line.

- **K8.**

    `statistics()` reports the exact counters and the budget.

- **K9.**

    The `workspace_context` tool renders the packet text with the lens and the stale flag, and the token count matches the render.

- **K10.**

    The purity check confirms that the fake fs records ZERO writeText and readText calls.

## Fixtures

The shared Harness supplies a fake sibling graph with three file nodes and three edges, plus the real built Target including the Render module, recomputed for the byte-exact token assertions.

## Expected ledger strings (byte-exact, `context: ` prefix)

`packet <id> (<n> tok, lens <name>)`, `focus <caller> -> <id>`,
`stale <id> (caller held <version>)`,
`clamped (<from> -> <to> tok, budget <max>)`.

## Expected count

14 PASS.
