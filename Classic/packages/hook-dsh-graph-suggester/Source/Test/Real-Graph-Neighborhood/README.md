# Real-Graph-Neighborhood

The Neighborhood intent against a REAL populated graph.

## Intent

Prove the consumer chain of the graph-suggester over the real service.

The real `@playform/plugin-dsh-workspace-graph` (from its built Target) is populated through its own
indexing trigger, and the declared `neighborhood(path, limit)` query of the hook answers from the
real `contains`/`imports` edges, so the note lists the real component around the anchor with the
anchor itself excluded.

Every other folder in this package drives `FakeGraph`, and this one closes the POC gap "the live
graph is empty; only FakeGraph-proven".

## Scenario

The fixture is a four-file map under `/ws` (the `Source/` segment keeps the anchor's own directory
honest): `Source/Core.ts` (the anchor, no imports), `Source/Use.ts` (imports `./Core.ts`),
`Source/Core.test.ts` (a test path importing `./Core.ts`) and `README.md`.

- Group G1: the real neighborhood.
    - Check: "the real graph yielded the neighborhood component" - the walk indexed four files and
      `neighborhood("/ws/Source/Core.ts")` returns the definition, the test and the importer, in
      role-rank order.
    - Check: "the suggest line is byte-exact and the graph answered" -
      `graph-suggester: suggest Neighborhood 0.87 2 candidates call read`, with no
      `graph unavailable` and no `abstained` line.
    - Check: "the note carries the real candidate paths and reasons" - the full note text, byte for
      byte, with the two real companion paths and the graph's own reasons.
    - Check: "the candidates are the graph's own entries minus the anchor" - the note's target paths
      equal `neighborhood("/ws/Source/Core.ts")` path for path with the anchor dropped, so no
      candidate comes from anywhere else and the file the agent just read is never named.
- Group G2: an anchor the real graph does not know.
    - Check: "an unknown anchor is an empty component, so the hook abstains honestly" - the real
      service returns `[]` and the hook logs `abstained no-companions Neighborhood 0.87` with no
      suggest and no `graph unavailable` line. There is no literal target set to fall back to.
- Group G3: purity.
    - Check: "the suggester's fs capture records ZERO operations" - the graph service owns the
      reads; the hook never touches its own fs seam.
- Group G4: an anchor whose real component holds only itself.
    - Check: "an anchor-only component abstains no-companions" - `README.md` is its own component
      (`["/ws/README.md"]`), so the hook logs `abstained no-companions Neighborhood 0.87` with no
      suggest and no `graph unavailable` line.
    - Check: "the note of the real component never names the anchor" - the G1 note text does not
      contain `/ws/Source/Core.ts`.

## Fixtures

- `RealGraph` from the Harness: the real graph class over an in-memory file map whose `resolve`/`stat`/`readText`/`listDir`/`contains` drive the real walk and parser, attached to the ctx of the hook before `apply` (the service is probed at use time).

## Edge cases

- The anchor arrives as the first quoted `.ts` path of the tool probe (the absolute `/ws/Source/Core.ts`), which the graph matches by exact display path.
- The anchor is excluded from the targets: the real component always contains the anchor's own
  definition entry, and naming the file the agent just read back to it is noise. An entry that
  matches the anchor after normalization (backslashes to slashes, a leading `./` stripped), or that
  ends with `/<anchor>` for a repo-relative anchor, is dropped.
- An empty component is NOT an unavailable graph: the real service answered honestly with nothing, so the hook abstains `no-companions` and logs no `graph unavailable` line.

## Expected count

8 PASS.
