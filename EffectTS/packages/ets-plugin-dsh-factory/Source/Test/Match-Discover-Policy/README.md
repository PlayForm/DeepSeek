# Match-Discover-Policy

What this test verifies.

## Intent

The factory's pure resolution helpers: `Match` (the exclusion-first segment match), `Discover` (the
walk-up search for the auxiliary registry with the node_modules boundary and the nearest-wins rule),
`Parse` (the contained JSON read), and `ResolvePolicy` (the union keep-list: global policy, then the
directory policy, then the found-adjacent registry, then the P3 chain keys, with the
unreadable-source skip and the Options parameterization).

They are their own folder because they are filesystem-touching but write-free - every scenario reads
real files from a temp root, and the union ORDER is a contract that the module leaves depend on.

This is the source suite's sections 4-6 plus the nearest-wins/directory/absent-policy edge checks,
moved verbatim.

## Scenario

- Group: 4 - Match: exclusion-first segment match.
    - Check: "Match: exclusion-first segment match" - a node_modules segment
      matches; its absence, an empty list and a null list all do not.
- Group: 5 - Discover + Parse (the auxiliary plain-fs exemption).
    - Check: "Discover/Parse: walk-up + node_modules boundary + contained JSON
      read" - Discover finds the registry at the proj root, stops at
      node_modules and returns null at the filesystem root; Parse reads the
      contained JSON, returns null for a corrupt file and for a missing file.
- Group: 6 - ResolvePolicy: the union keep-list with chain keys.
    - Check: "ResolvePolicy: union keep-list + P3 chain-keys + unreadable
      handling" - the union order is global -> dir -> found -> chain
      (["g","a","b","c","leftpad"]); no registry drops the found-adjacent
      source; the Options parameterization works on a State without
      PolicyName; an unreadable global is skipped AND logged with the
      parameterized filename.
- Group: nearest registry wins when several exist up the tree.
    - Check: "Discover: nearest-wins over multiple levels" - the deepest
      registry's directory wins.
- Group: Parse on a directory is contained.
    - Check: "Parse: directory path contained to null".
- Group: configured-but-absent global policy: not a source, no unreadable
  line.
    - Check: "ResolvePolicy: configured-but-absent policy is silently not a
      source" - the keep-list is empty and the durable ledger gains no line.
- Group: Match - the manifest basename itself as an excluded segment.
    - Check: "Match: exact-segment equality".

## Fixtures

- The Harness fake ctx + the REAL factory instance; a fresh OS tmpdir root (prefix "factory-smoke-")
  with the ledger path and the source suite's st1 State rebuilt verbatim (needed by the
  Options-parameterized scenario).
- Real files in the temp root: `registry.json` (`{"effectiveLatest":{"leftpad":"1.0.0"}}`),
  `bad.json` ("{ nope"), `global-policy.json` (rewritten several times: `{"keep":["g","a"]}` then
  "{ nope"), `proj/pin-policy.json` (`{"keep":["a","b"]}`), `pin-policy.json` at the root
  (`{"keep":["b","c"]}`), a `proj/deeper` directory with a rewritten nearest registry, and a
  `node_modules/deep` directory for the walk-up boundary.
- NO pin-policy.json survives this folder - the source suite deletes both before the Continue
  section, and the same absence is part of the ResolvePolicy scenarios' state.

## Expected ledger strings (byte-exact)

- `unreadable pin-policy.json at <abs-path>/global-policy.json - using built-in
  default` (the separator is U+2014, an em dash, in the runtime string;
  asserted through `loggerLines.info.some(...includes(...))`, composed with
  the parameterized filename).

The configured-but-absent case writes NO ledger line (the negative control).

## Edge cases

- Match with an empty list and with null - both false.
- Discover at the filesystem root and inside node_modules - both null.
- Parse on a corrupt file, a missing file, and a directory - all null.
- The union order (global, dir, found, chain) and the unreadable skip.

## Expected count

7 PASS.
