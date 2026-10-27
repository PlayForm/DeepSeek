# Update-Stage

What this test verifies.

## Intent

The update stage is the second half of the governor, probed directly through its own exported machinery.

The pure leaves come first (Decode, Filter, Satisfy).

Then the three update gates (circuit breaker, in-flight, cooldown), each with its byte-identical line and the joint "gates log, nothing else" window.

The FAILED path follows (ncu exit 1, the breaker increment, the update-failed journal, the U-sub-2 refresh that runs even on failure).

Then the first-wins Resolve pick (own directory, then registry-adjacent, then the configured global, then the built-in default).

The policy engine covers the file read, the verifyCommand through the /bin/sh -c seam, the merged rejects, and the policy-naming dispatched line.

The verifyCommand exit-code matrix follows (0 ok, 127 non-fatal, other fails the stage), then the absent/unparsable policy fallbacks, the programmatic npm-check-updates mode, the P1 job-ring piping, and the detached fallbacks (no registry service and the preflight rejection).

The Follow passage/Filter gates, the factory keep-list wiring on the observe path, and the ledger-prefix invariant over the whole logger capture of the folder close the list.

The assertions are moved verbatim from `Classic/smokes/governor-smoke.mjs` sections 7-9 and 12.

## Scenario

- Group: pure leaves.
    - Check: "pure leaves: Decode - contained parse, null on failure/non-object".
    - Check: "pure leaves: Filter - public deps -> true, all-chain manifest -> false".
    - Check: "pure leaves: Satisfy - canonicalizes to ^resolved, idempotent -> null".
- Group: the update gates.
    - Check: "update gates: circuit breaker -> `paused for ...` line, no job".
    - Check: "update gates: in-flight -> `skipped for ... (in-flight)` line".
    - Check: "update gates: cooldown -> `skipped for ... (cooldown)` line; gates log, nothing else".
- Group: the FAILED path.
    - Check: "FAILED path: `update: ncu failed (base) status 1` + `update: FAILED - see lines above`".
    - Check: "FAILED path: breaker incremented + `update stage FAILED (1) ... consecutive=1` + update-failed journal".
    - Check: "FAILED path: U-sub-2 refresh runs even on failure".
- Group: the policy pick and the engines.
    - Check: "Resolve: FIRST-WINS engine-input pick (global -> own dir -> registry-adjacent -> default)".
    - Check: "policy engine: policy file read + verifyCommand through the seam + merged rejects".
    - Check: "verifyCommand: exit 0 ok / 127 non-fatal / other fails the stage".
    - Check: "policy fallbacks: absent + unparsable policy files -> built-in default lines".
    - Check: "engine: programmatic mode - ncu library in-process, chain-safe reject list".
    - Check: "P1 piping: collected bin-mode stdout appended to the ledger".
    - Check: "P1 piping: the same text piped raw into the job's output ring".
    - Check: "fallbacks: no-registry and preflight-rejection -> the contained detached chain".
    - Check: "Follow: passage gate + Filter gate before the first-wins pick and dispatch".
    - Check: "factory wiring: ResolvePolicy union discovery runs on the observe path (State.PolicyName)".
    - Check: "factory wiring: configured-but-absent global policy is silently not a source".
    - Check: "ledger prefix: every factory-composed line is `hook-dsh-governor-package: ...`".

## Fixtures

The harness world (Boot) runs with `Probe.Mode = "bin"`, and proj-f is the recurring dispatch target (its breaker count, Stash stamp, and in-flight set are seeded and cleaned around each gate check).

The Spawn knobs (Exits queue, Out text) drive the bin-mode runs.

proj-g/proj-g2/registry-adjacent serve Resolve, proj-np serves the policy fallbacks, proj-j serves the programmatic mode (the npm-check-updates import is heavy, so the 200x50ms poll loop of the source is kept), and proj-k serves the observe-path wiring.

INTERLEAVED CAPTURES: where the source suite asserted BETWEEN two fixture actions (the generic default-policy count between the two fallback dispatches, and the dispatched count between the two detached-fallback runs), the folder captures that intermediate count in the fixture phase and the check asserts the captured value, at the same point in the flow and with the same semantics.

## Expected ledger strings (byte-identical)

- `update stage paused for <dir> (3 consecutive failures >= 3)` (U+2265)
- `update stage skipped for <dir> (in-flight)` / `(cooldown)`
- `update: ncu failed (base) status 1`, `update: FAILED - see lines above` (U+2014), `update stage FAILED (1) for <dir>; consecutive=1`
- `update: running verifyCommand: echo hi`, `update: verifyCommand ok`, `update: verifyCommand runner unavailable (exit 127) - skipped, non-fatal`, `update: verifyCommand failed (status 2)`
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, policy <path>)`
- `update: no policy at /no/such/policy.json - using built-in default`, `update: using built-in default policy`, `update: unreadable policy at <path> - using built-in default`
- `update: mode=programmatic (npm-check-updates library)`, `update: ncu (base) -> ...` (U+2192)
- `unreadable update-policy.json at <path> - using built-in default`

## Edge cases

- The three gates share one window: exactly 3 lines total, nothing else.
- The breaker increments on failure and resets on success, and the U-sub-2 refresh re-emits with the stat version even on the FAILED path.
- 127 from the verify runner is non-fatal (the stage completes), and any other non-zero fails the stage.
- The programmatic run is polled because the library import is heavy, and the Mode field is restored to "bin" afterwards.

## Expected count

21 PASS.
