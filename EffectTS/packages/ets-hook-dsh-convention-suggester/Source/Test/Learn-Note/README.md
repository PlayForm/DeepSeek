# Learn-Note

The note gate of the D4 learning bootstrap: one note per workspace per process, on the first judged
call.

## Scenarios

- N1: a non-judged call (`bash`) neither scans nor writes nor notes - only the
  activation line is in the ledger and no proposal file appears.
- N2: the first judged call (`write`) emits the `learned pack 4 families`
  note with the byte-exact text, the `learned proposal <slug> 4 families
  <path>` ledger line in both forms, and the proposal file.
- N3: a SECOND mount of the hook in the same process does not re-note and does
  not recreate a proposal file that was deleted between the mounts - the
  reservation is module-level and keyed by the workspace root - and the gate's
  `abstained foreign-workspace  0.00` line still runs.
- N4: a DIFFERENT workspace gets its own proposal and note (the key is the
  root, not the process).
- N5: learning off (the default) emits no note and writes no file.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary
trees under the OS temp dir and a temporary `HOME` (`process.env.HOME`).

Each repo is a packless tree with `Documentation/INDEX.md`, the package layout and its prose (four
derived families).

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`learned proposal <slug> 4 families <absolute proposal path>`,
`abstained foreign-workspace  0.00`.

## Expected count

7 PASS.
