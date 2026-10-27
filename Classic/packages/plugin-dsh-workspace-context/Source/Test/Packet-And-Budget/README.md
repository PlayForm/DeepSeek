# Packet-And-Budget - the packet build and the budget clamp

This folder covers the orientation packet against a fake sibling workspace-graph: the eight fixed sections, the ranked neighbors, the lens filtering, the honest degradation, the staleness contract, the budget clamp, the optional token meter, the tool surface, and the purity.

## Scenarios

- K1: an absent sibling graph degrades to the honest OPEN line
  (`workspace graph unavailable ...`), never a crash; the packet line is
  byte-exact in the logger and the durable ledger.
- K2: focus by id - the exact MAP ordering (biggest directory first), the
  FOCUS line, the neighbors ranked by edge strength (calls > imports >
  references), the evidence list, the focus tracking and its journal line.
- K3: the docs lens filters the edges; the MAP is capped by `mapLimit`.
- K4: an unknown default lens reports itself through the OPEN line and
  filters nothing.
- K5: the staleness contract - a mismatched caller version reports
  `caller held <v>, current <v>` and bumps the stale counter with its
  journal line; a matching version stays fresh.
- K6: the budget clamp - an oversized packet drops the neighbors first,
  clamps under the maximum, bumps the clamped counter, and journals the
  byte-exact `clamped (<from> -> <to> tok, budget <max>)` line.
- K7: the harness `tokenMeter` is honored by the clamp (the exact
  `clamped (999 -> 999 tok, budget 4000)` line).
- K8: `statistics()` reports the exact counters and budget.
- K9: the `workspace_context` tool renders the packet text with the lens
  and the stale flag, and the token count matches the render.
- K10: purity - the fake fs records ZERO writeText and readText calls.

## Fixtures

The harness is the shared Harness: a fake sibling graph with three file nodes and three edges, plus the real built Target including the Render module, recomputed for the byte-exact token assertions.

## Expected ledger strings (byte-exact, `context: ` prefix)

`packet <id> (<n> tok, lens <name>)`, `focus <caller> -> <id>`,
`stale <id> (caller held <version>)`,
`clamped (<from> -> <to> tok, budget <max>)`.

## Expected count

14 PASS.
