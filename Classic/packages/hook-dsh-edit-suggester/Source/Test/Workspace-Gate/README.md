Workspace-Gate - the workspace gate and the existence filter

The `tools/post-execute` listener against the fake ctx and REAL temp
workspaces: a foreign workspace abstains before detect/score, our workspace
emits only the companions that exist, an emptied family abstains
`no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with `Documentation/INDEX.md` but no
  `Documentation/ARCHIVE-STYLE.md`), cwd through the optional
  `workingDirectory` service - the downstream decision comes back UNCHANGED
  with no note, the logger and durable forms carry the byte-exact
  `abstained foreign-workspace  0.00` line, no `suggest` line appears, and the
  foreign call does not touch the ring. A service getter that THROWS still
  abstains with no logger warning (the probe never throws).
- G2: with NO `workingDirectory` service at all, the absolute foreign path
  still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH `Documentation/ARCHIVE-STYLE.md`, a
  `Source/Variable/Config.ts`, `README.md` and the site surface, WITHOUT
  `SCHEME.md`/`cordis.patch.yml`) - the Config note is byte-exact, names ONLY
  the two companions that exist, and never contains the missing paths; the
  `suggest Config 0.87 2 companions <path>` line counts only the existing
  companions.
- G4: a family whose whole companion set is absent (Workflow in the minimal
  tree) abstains `abstained no-companions Workflow 0.87`, both forms, with no
  note.
- G5: a foreign abstention followed by an in-workspace edit still emits the
  Config note (the gate is per call, not sticky).

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target) plus `node:fs` temp trees under the OS temp dir. The
optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty family, the no-signal shape),
`abstained no-companions Workflow 0.87`,
`suggest Config 0.87 2 companions <the temp Source/Variable/Config.ts path>`.

## Expected count

8 PASS.
