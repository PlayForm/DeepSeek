Workspace-Gate - the workspace gate and the existence filter

The suite covers the `tools/post-execute` listener against the fake ctx and REAL temp workspaces: a
foreign workspace abstains before detect and score, our workspace emits only the companions that
exist, an emptied family abstains with `no-companions`, and a foreign call never poisons the next
in-workspace call.

## Scenarios

- G1: the FOREIGN workspace is a temp tree with `Documentation/INDEX.md` but no
  `Documentation/ARCHIVE-STYLE.md`, and the cwd goes through the optional `workingDirectory` service.
- G1 continues: the downstream decision comes back UNCHANGED with no note, the logger and durable
  forms carry the byte-exact `abstained foreign-workspace  0.00` line, no `suggest` line appears, and
  the foreign call does not touch the ring (calls 0, no touched path, no note).
- G1 ends: a service getter that THROWS still abstains with no logger warning, because the probe never
  throws.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root
  and abstains with the same line.
- G3: OUR workspace is a temp tree WITH `Documentation/ARCHIVE-STYLE.md` and `Documentation/INDEX.md`
  and WITHOUT `Documentation/Handoff`.
- G3 continues: the Index note is byte-exact, names ONLY `Documentation/ARCHIVE-STYLE.md` with the row
  format, and never contains the missing `Documentation/Handoff` path, and the
  `suggest Index 0.87 1 companions <path>` line counts only the existing companion.
- G4: a family whose whole companion set is absent, which is PackageProse in the minimal tree,
  abstains with `abstained no-companions PackageProse 0.87` in both forms and with no note.
- G5: a foreign abstention followed by an in-workspace read still emits the Index note, because the
  gate is per call and not sticky.

## Fixtures

The shared Harness supplies the fake ctx with a DISTINCT root object, the real factory, and the real
built Target, and the trees come from `node:fs` temp directories under the OS temp dir.

The optional service is injected as `Run.Context.workingDirectory = { get }`, which is the same shape
the real harness service exposes and never a hard inject.

## Expected ledger strings (byte-exact, `hook-dsh-doc-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty family, the no-signal shape),
`abstained no-companions PackageProse 0.87`,
`suggest Index 0.87 1 companions <the temp Documentation/INDEX.md path>`.

## Expected count

8 PASS.
