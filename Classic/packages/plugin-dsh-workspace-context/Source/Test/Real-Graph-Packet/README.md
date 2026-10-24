# Real-Graph-Packet

The orientation packet over a REAL populated graph.

## Intent

Prove the orientation loop's orient step against the real service: the real
`@playform/plugin-dsh-workspace-graph` (from its built Target) is populated through its own
indexing trigger, and `ctx.workspaceContext.packet(...)` builds the eight-band packet from it. Every
band carries real graph content - real ids, spans, fingerprints, the real `indexRevision` - and OPEN
is `(none)`, so this folder is the counterpart of the empty-form degradation the absent-graph case
proves.

## Scenario

The fixture is a four-file map under `/ws`: `src/core.ts` (imports `./util.ts` through a `.ts`
specifier, so the v0 parser resolves the imports edge), `src/util.ts`, `src/core.test.ts` (a test
path) and `README.md` (two headings).

- Group C1: the bands carry the real graph.
    - Check: "the real indexing trigger populated the graph the packet reads" - the walk indexed
      four files, revision "4", the focus node exists.
    - Check: "the WORKSPACE and SCOPE lines carry the real revision and scope".
    - Check: "the MAP band groups the real absolute paths by parent directory" -
      `["/ws/src (3 files)", "/ws (1 files)"]` (see the edge case below).
    - Check: "the FOCUS line carries the real span, fingerprint prefix and version".
    - Check: "the NEIGHBORS band ranks the real edges (imports before contains)" - the three real
      edges, ranked by the weight table with the deterministic tie-break.
    - Check: "the EVIDENCE band carries the real files and spans".
    - Check: "OPEN is (none) - the real graph answered, this is not the empty form", plus the token
      estimate equals the rendered length / 4.
- Group C2: the ledger and the focus tracking.
    - Check: "the packet line is byte-exact and the caller's focus is tracked" - the logger and the
      durable ledger carry `context: packet <id> (<tokens> tok, lens code)`, and `focusOf("real")`
      returns the real node id and version.
- Group C3: the tool surface.
    - Check: "the tool renders the real packet text" - the rendered text starts with the real
      revision, carries the real NEIGHBORS and EVIDENCE lines, lens `code`, not stale.
- Group C4: purity.
    - Check: "the context plugin's fs records ZERO writes and reads".

## Fixtures

- `RealGraph` from the Harness: the real graph class over an in-memory file map whose
  `resolve`/`stat`/`readText`/`listDir`/`contains` drive the real walk and parser. The graph gets
  its own ctx; the context plugin's ctx fs stays the read-only purity guard.

## Edge cases

- The MAP band used to group by the file's FIRST path segment; the real graph stores resolved
  absolute paths, whose first segment is empty, so every real workspace collapsed into one nameless
  band. The band now groups by the PARENT directory (identical for the relative fixture paths in
  Packet-And-Budget, meaningful for absolute ones).
- The graph version token is already `v1`; the packet grammar prefixes a literal `v`, so the FOCUS
  line reads `v v1` - the existing render, asserted as it is.

## Expected count

10 PASS.
