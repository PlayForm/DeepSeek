# Entry-And-Config

What this test verifies.

## Intent

The governor's loader contract and its Config schema are the two surfaces every
other folder (and every consumer) silently depends on: the plugin entry must
export `name`/`apply`/`Config`/`inject` with the factory + fs injections, the
BUILT Target must resolve the factory exclusively through the injected ctx
service (except the Config module's standalone Schema import, the module-load
use), and the schema must validate the shared volatile cells (`log`, `logFile`,
`updateCooldownMs`, `mutationTools`) and the plain module defaults
(`strict`, `maxUpdateFailures`, `updateMode`, `ncuBin`, `policyFile`,
`exclude`). A drift here breaks every later folder, so it is its own folder.
The assertions are moved verbatim from `Classic/smokes/governor-smoke.mjs`
sections 1-2 (the source suite stays in place during the migration).

## Scenario

- Group: the entry contract.
    - Sub: "entry: name/apply/Config/inject + the default object carries all four"
        - assert name === "hook-dsh-governor-package", typeof apply === "function"
        - assert Config present, inject deepEqual ["fs", "pluginFactory"]
        - the default object carries all four keys
    - Sub: "consumption: the built Target resolves the factory through ctx EXCEPT
      the Config module's standalone Schema import"
        - walk the built Target .js files; exactly one file may mention
          "ets-plugin-dsh-factory": Target/Variable/Config.js
    - Sub: "Config: volatile cells + defaults (factory.Schema shared-block parity)"
        - logFile/log/updateCooldownMs/mutationTools are volatile cells
        - strict=false, maxUpdateFailures=3, updateMode="programmatic",
          ncuBin="ncu", policyFile="", exclude = the six built-in segments
    - Sub: "Config: the default logFile is the documented ledger path"
        - logFile defaults to ~/.dsh/playform/ets-hook-dsh-package-governor.log (must
          equal the cordis.patch.yml row and the README)

## Fixtures

None beyond the harness ledger path: the Config check validates
`Governor.Config({ logFile: Ledger })` with the harness tmpdir ledger. The
consumption walk reads the built Target directory of the package itself (the
same bytes the live loader loads). No fake ctx, no factory, no apply.

## Expected ledger strings (byte-exact)

None. This folder asserts the entry shape and the schema defaults, not log
lines.

## Edge cases

- The consumption walk is the negative control for the "governor never imports
  the factory directly" architecture rule: any second importer fails the
  deepEqual.
- The volatile cells are exercised with `.get()` (they must be callable);
  the plain fields must NOT be cells (asserted by equality, not `.get`).

## Expected count

4 PASS.
