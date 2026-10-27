# Schema-Wire-Govern

This file states what the test verifies.

## Intent

This folder covers the three remaining service surfaces.

`Schema` holds the shared volatile fields log, logFile, updateCooldownMs, and mutationTools, with
the per-module defaults, the real schemastery validation that produces the volatile cells, the
Unwrap machinery, and the module field slots appended verbatim after the shared block.

`Wire` holds the fiber-owned fs/observed registration with the module-supplied activation proof.

The direct-govern registry holds the `RegisterGovern` storage per basename in registration order and
the selection resolution of `Govern` for true, all, array, name, and false, with the basename
routing, the per-step containment, and the in-place re-registration.

These surfaces have their own folder because the field ORDER of the schema and the selection
semantics of governance are contracts shared by every module leaf.

This folder holds sections 15, 13, and 17 of the source suite, moved verbatim.

## Scenario

- Group: 15 - Schema: shared volatile fields + module fields.
    - Check: "Schema: shared volatile fields, per-module defaults, module
      field slots, real validation + unwrap" - the first six dict keys are
      [log, logFile, updateCooldownMs, mutationTools, policyFile, exclude];
      the four volatile fields carry meta.volatile true; the defaults are
      the flavor logFile, 3000, "" and the SectionList; exclude is not
      volatile; real validation fills the defaults, produces the volatile
      logFile cell, and Unwrap turns the mutationTools cell into
      ["write","edit","str_replace_editor","raw-write"] with log true.
- Group: Schema - module fields appended last, after the shared block.
    - Check: "Schema: module field slots appended verbatim" - the `sections`
      field of the module is the LAST dict key, defaults to the SectionList,
      and keeps its own absent volatility.
- Group: 13 - Wire: registration + the module's own activation proof.
    - Check: "Wire: fiber-owned fs/observed registration +
      module-supplied activation proof" - the last captured listener is
      "fs/observed"; invoking it forwards target/observation/actor to the
      module callback; the activation line of the module reaches the durable
      ledger.
- Group: 17 - the direct-govern registry + Govern (the raw-write tool's
  path).
    - Check: "Govern: the direct-govern registry - RegisterGovern storage,
      selection resolution (true/all/array/name/false), basename routing,
      per-step containment, in-place re-registration" - the registry starts
      empty; steps are stored per basename in registration order; true runs
      every step with the actor/version/target; the array runs the named
      subset and ignores unknown names; a single name selects that step;
      unknown-only and false/null/undefined run nothing; basename routing
      fires only the Cargo.toml step; a throwing step is contained and later
      steps still run; same-name re-registration replaces in place and the
      replaced closure is the one that runs.

## Fixtures

- The Harness fake ctx and the REAL factory instance, a fresh OS tmpdir root
  with `ledger.log` and `flavor-ledger.log`, the st1 State of the source suite
  rebuilt verbatim as the Wire target, a `proj` directory for the Govern
  targets, and the `target`/`present`/`actor` fixtures verbatim.
- Unwrap and SectionList are imported from the REAL built Target subpaths
  `Target/Function/Unwrap.js` and `Target/Variable/Default.js`, which are the
  same dynamic imports that the source suite performs, hoisted to static
  imports.
- `ran` records the [name, targetPath, actor, version] of each govern step, and
  the govern selection values (true, arrays, names, false/null/undefined) are
  passed verbatim.

## Expected ledger strings (byte-exact)

- `activated (smoke)` sits in the durable ledger file as the module-supplied
  activation proof of the Wire group, behind the [ISO] stamp and the
  `smoke-flavor: ` logger prefix.

## Edge cases

- The Govern call on the empty registry is a contained no-op.
- Unknown names and the false/null/undefined selections run nothing.
- A throwing step never propagates, and later steps still run.
- Same-name re-registration replaces in place without a duplicate, and the
  replaced closure runs.
- exclude is NOT volatile, and module fields keep their own volatility.

## Expected count

4 PASS.
