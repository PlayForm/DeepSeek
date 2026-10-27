Workspace-Gate - the workspace gate and the existence filter

The suite covers the `tools/post-execute` listener against the fake ctx and REAL temp workspaces: a
foreign workspace abstains before detect, our workspace emits only the target that exists, an emptied
intent abstains with `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace is a temp tree with `Source/Function/Apply.ts` but no
  `Documentation/ARCHIVE-STYLE.md`, and the cwd goes through the optional `workingDirectory` service.
- G1 continues: the downstream decision comes back UNCHANGED with no note, the logger and durable
  forms carry the byte-exact `abstained foreign-workspace  0.00` line, no `suggest` line appears, and
  the foreign call never creates per-agent memory.
- G1 ends: a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root
  and abstains with the same line.
- G3: OUR workspace is a temp tree WITH `Documentation/ARCHIVE-STYLE.md`, a package `Source/Library.ts`
  and `README.md`, and WITHOUT `SCHEME.md` and `cordis.patch.yml`.
- G3 continues: the Docs note is byte-exact, names ONLY `README.md`, and never contains the missing
  paths, and the `suggest Docs 0.95 1 candidates` line counts only the existing companion.
- G4: an intent whose whole target set is absent, which is Naming in the minimal tree where the
  `Source/...` globs do not exist, abstains with `abstained no-companions Naming 0.80` in both forms
  and with no note.
- G5: a foreign abstention followed by an in-workspace write still emits the Docs note, because the
  gate is per call and not sticky.

## Fixtures

The shared Harness supplies the fake ctx with a DISTINCT root object, the real factory, and the real
built Target, and the trees come from `node:fs` temp directories under the OS temp dir.

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape),
`abstained no-companions Naming 0.80`,
`suggest Docs 0.95 1 candidates call write`.

## Expected count

8 PASS.
