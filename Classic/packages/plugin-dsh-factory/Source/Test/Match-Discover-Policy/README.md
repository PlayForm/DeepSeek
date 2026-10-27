# Match-Discover-Policy

This file states what the test verifies.

## Intent

This folder covers the pure resolution helpers of the factory: `Match`, the exclusion-first segment
match; `Discover`, the walk-up search for the auxiliary registry with the node_modules boundary and
the nearest-wins rule; `Parse`, the contained JSON read; and `ResolvePolicy`, the union keep-list
that takes the global policy, then the directory policy, then the found-adjacent registry, then the
P3 chain keys, with the unreadable-source skip and the Options parameterization.

These helpers have their own folder because they touch the filesystem but never write: every
scenario reads real files from a temp root, and the union ORDER is a contract that the module leaves
depend on.

This folder holds sections 4-6 of the source suite plus the nearest-wins, directory, and
absent-policy edge checks, moved verbatim.

## Scenario

- Group: 4 - Match: exclusion-first segment match.
    - Check: "Match: exclusion-first segment match" - a node_modules segment
      matches, while its absence, an empty list, and a null list all do not.
- Group: 5 - Discover + Parse (the auxiliary plain-fs exemption).
    - Check: "Discover/Parse: walk-up + node_modules boundary + contained JSON
      read" - Discover finds the registry at the proj root, stops at
      node_modules, and returns null at the filesystem root; Parse reads the
      contained JSON and returns null for a corrupt file and for a missing
      file.
- Group: 6 - ResolvePolicy: the union keep-list with chain keys.
    - Check: "ResolvePolicy: union keep-list + P3 chain-keys + unreadable
      handling" - the union order is global -> dir -> found -> chain
      (["g","a","b","c","leftpad"]); no registry drops the found-adjacent
      source; the Options parameterization works on a State without
      PolicyName; an unreadable global is skipped AND logged with the
      parameterized filename.
- Group: nearest registry wins when several exist up the tree.
    - Check: "Discover: nearest-wins over multiple levels" - the directory of
      the deepest registry wins.
- Group: Parse on a directory is contained.
    - Check: "Parse: directory path contained to null".
- Group: configured-but-absent global policy: not a source, no unreadable
  line.
    - Check: "ResolvePolicy: configured-but-absent policy is silently not a
      source" - the keep-list is empty and the durable ledger gains no line.
- Group: Match - the manifest basename itself as an excluded segment.
    - Check: "Match: exact-segment equality".

## Fixtures

- The Harness fake ctx and the REAL factory instance, a fresh OS tmpdir root
  with the prefix "factory-smoke-" and the ledger path, and the st1 State of
  the source suite rebuilt verbatim, which the Options-parameterized scenario
  needs.
- Real files in the temp root: `registry.json`
  (`{"effectiveLatest":{"leftpad":"1.0.0"}}`), `bad.json` ("{ nope"),
  `global-policy.json` rewritten several times from `{"keep":["g","a"]}` to
  "{ nope", `proj/pin-policy.json` (`{"keep":["a","b"]}`), `pin-policy.json`
  at the root (`{"keep":["b","c"]}`), a `proj/deeper` directory with a
  rewritten nearest registry, and a `node_modules/deep` directory for the
  walk-up boundary.
- NO pin-policy.json survives this folder, because the source suite deletes
  both before the Continue section and the same absence is part of the state of
  the ResolvePolicy scenarios.

## Expected ledger strings (byte-exact)

- `unreadable pin-policy.json at <abs-path>/global-policy.json - using built-in
  default` carries U+2014, an em dash, as the separator in the runtime string,
  and the check asserts it through
  `loggerLines.info.some(...includes(...))`, composed with the parameterized
  filename.

The configured-but-absent case writes NO ledger line, which is the negative control.

## Edge cases

- Match with an empty list and with null gives false in both cases.
- Discover at the filesystem root and inside node_modules gives null in both
  cases.
- Parse on a corrupt file, on a missing file, and on a directory gives null in
  all three cases.
- The union order (global, dir, found, chain) and the unreadable skip are both
  covered.

## Expected count

7 PASS.
