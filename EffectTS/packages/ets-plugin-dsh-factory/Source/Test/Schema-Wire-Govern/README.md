# Schema-Wire-Govern

What this test verifies.

## Intent

The three remaining service surfaces: `Schema` (the shared volatile fields -
log, logFile, updateCooldownMs, mutationTools - with the per-module defaults,
the real schemastery validation producing the volatile cells, the Unwrap
machinery, and the module field slots appended verbatim after the shared
block), `Wire` (the fiber-owned fs/observed registration with the
module-supplied activation proof) and the direct-govern registry
(`RegisterGovern` storage per basename in registration order, `Govern`'s
selection resolution - true/all/array/name/false - with the basename routing,
the per-step containment and the in-place re-registration). They are their own
folder because the schema's field ORDER and the governance selection
semantics are contracts shared by every module leaf. This is the source
suite's sections 15, 13 and 17, moved verbatim.

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
    - Check: "Schema: module field slots appended verbatim" - the module's
      `sections` field is the LAST dict key, defaults to the SectionList and
      keeps its own (absent) volatility.
- Group: 13 - Wire: registration + the module's own activation proof.
    - Check: "Wire: fiber-owned fs/observed registration +
      module-supplied activation proof" - the last captured listener is
      "fs/observed"; invoking it forwards target/observation/actor to the
      module callback; the module's activation line reaches the durable
      ledger.
- Group: 17 - the direct-govern registry + Govern (the raw-write tool's
  path).
    - Check: "Govern: the direct-govern registry - RegisterGovern storage,
      selection resolution (true/all/array/name/false), basename routing,
      per-step containment, in-place re-registration" - the registry starts
      empty; steps stored per basename in registration order; true runs
      every step with the actor/version/target; the array runs the named
      subset (unknown names ignored); a single name selects that step;
      unknown-only and false/null/undefined run nothing; basename routing
      fires only the Cargo.toml step; a throwing step is contained and later
      steps still run; same-name re-registration replaces in place and the
      replaced closure is the one that runs.

## Fixtures

- The Harness fake ctx + the REAL factory instance; a fresh OS tmpdir root
  with `ledger.log` and `flavor-ledger.log`; the source suite's st1 State
  rebuilt verbatim (the Wire target); a `proj` directory for the Govern
  targets; `target`/`present`/`actor` fixtures verbatim.
- Unwrap and SectionList are imported from the REAL built Target subpaths
  (`Target/Function/Unwrap.js`, `Target/Variable/Default.js`) - the same
  dynamic imports the source suite performs, hoisted to static imports.
- `ran` records each govern step's [name, targetPath, actor, version]; the
  govern selection values (true, arrays, names, false/null/undefined) are
  passed verbatim.

## Expected ledger strings (byte-exact)

- `activated (smoke)` in the durable ledger file (the Wire group's
  module-supplied activation proof, behind the [ISO] stamp and the
  `smoke-flavor: ` logger prefix).

## Edge cases

- The empty-registry Govern call is a contained no-op.
- Unknown names, false/null/undefined selections - all run nothing.
- A throwing step never propagates; later steps still run.
- Same-name re-registration replaces in place (no duplicate) and the
  replaced closure runs.
- exclude is NOT volatile; module fields keep their own volatility.

## Expected count

4 PASS.
