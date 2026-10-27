# Direct-Govern-Folds-Wiring

This test verifies the following behavior.

## Intent

The pinner's direct-govern and factory-integration surface registers the pin step and runs it through Factory.Govern: the guarded write at the fresh-stat version, the Stash seeding, the byte-identical `pinned <path> (N versions)` line, and unknown names ignored.

The two-chain-writer fold runs in BOTH registration orders, and the enforced real-token FS guard is itself the proof that the second step guarded the FRESH version, which is the live fold-abort failure mode.

The module transform contract is driven directly: next, count, and message, the null contracts, and the module's no-op lines logged INSIDE the transform.

The factory's throw containment composes the pinner's Module, and the P5 storage journal shows that the activated record drains and the disposer closes the domain.

The silence invariant holds: the broken ledger never throws out of the listener, and the hostile payload is suppressed logger-only.

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` sections 8b-11.

## Scenario

- Group: the direct-govern path.
    - Sub: "direct-govern: pin - Stash seed + Continue, ledger byte-identical, unknown names ignored"
- Group: the two-chain-writer fold (the live failure mode, enforced fs).
    - Sub: "two-chain-writer fold (pin -> canonicalize): both writes land at the fresh-stat version, both lines appear, final file canonical + pinned"
    - Sub: "two-chain-writer fold (canonicalize -> pin): reverse registration order converges to the same final state"
- Group: factory wiring.
    - Sub: "the transform contract: (current: string|null, section, keep) -> {next, count, message}|null - the module leaf"
    - Sub: "factory wiring: the detached continuation is contained, logger-only, Inflight-cleaned"
- Group: the P5 storage journal.
    - Sub: "P5 storage: the activated record drains; the disposer closes the domain"
- Group: the silence invariant.
    - Sub: "silence: the ledger append is best-effort - never throws out of the listener"
    - Sub: "silence: a throw inside the listener is suppressed logger-only (the tool call never sees it)"

## Fixtures

The harness Boot uses the real-token fs.

The fold fixtures create `registry.json` + package.json pairs under `fold-forward`/`fold-reverse`, a sim canonicalize transform (`FoldCan`) registered via `Factory.RegisterGovern`, and, for the reverse order, a second world (`ctxFold` + `FactoryFold`) with the sim step registered BEFORE the pinner's apply.

The transform-contract fixture builds a leaf directly from `Target/Function/Transform.js` with a capture-only Append furnace.

The P5 fixture is a third world with a `storageDomain` service stub.

The silence fixtures use a DIRECTORY as the logFile (appendFileSync fails) and a hostile payload with a throwing `displayPath` getter.

## Expected ledger strings (byte-identical)

- `pinned <path> (1 versions)` (the direct pass and both folds)
- `governed <path> -> <version>` (the sim canonicalize's line, U+2192)
- `observed non-JSON package.json <path> - skipped` (U+2014, twice, from the transform's own Append capture)
- `no changes to pin for <path>` (from the transform)
- `hook-dsh-pinner-package: continuation error (suppressed): boom`
- `hook-dsh-pinner-package: listener error (suppressed): hostile payload`

## Edge cases

- The real-token backend enforces the fold's FS guard, so two writes landing IS the proof of the fresh-stat basis.
- Reverse registration order converges to the same final dependencies.
- The transform's null contracts (failed read, undecodable, no change) each return null.
- The broken-ledger listener call must not throw and must still log.

## Expected count

8 PASS.
