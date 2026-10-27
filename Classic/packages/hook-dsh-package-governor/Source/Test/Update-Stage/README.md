# Update-Stage

What this test verifies.

## Intent

The update stage is the second half of the governor, probed directly through its own exported
machinery: the pure leaves (Decode, Filter, Satisfy), the three update gates (circuit breaker,
in-flight, cooldown - each with its byte-identical line and the joint "gates log, nothing else"
window), the FAILED path (ncu exit 1, the breaker increment, the update-failed journal, the U-sub-2
refresh that runs even on failure), the first-wins Resolve pick (own directory, then
registry-adjacent, then the configured global, then the built-in default), the policy engine (the
file read, the verifyCommand through the /bin/sh -c seam, the merged rejects, the policy-naming
dispatched line), the exit-code matrix of verifyCommand (0 ok, 127 non-fatal, other fails the stage),
the absent/unparsable policy fallbacks, the programmatic npm-check-updates mode, the P1 job-ring
piping, the detached fallbacks (no registry service and the preflight rejection), the Follow
passage/Filter gates, the keep-list wiring of the factory on the observe path, and the ledger-prefix
invariant over the whole logger capture of the folder. The assertions are moved verbatim from
sections 7-9 and 12 of `Classic/smokes/governor-smoke.mjs`.

## Scenario

- Group: pure leaves.
    - Sub: "pure leaves: Decode - contained parse, null on failure/non-object"
    - Sub: "pure leaves: Filter - public deps -> true, all-chain manifest ->
      false"
    - Sub: "pure leaves: Satisfy - canonicalizes to ^resolved, idempotent ->
      null"
- Group: the update gates.
    - Sub: "update gates: circuit breaker -> `paused for ...` line, no job"
    - Sub: "update gates: in-flight -> `skipped for ... (in-flight)` line"
    - Sub: "update gates: cooldown -> `skipped for ... (cooldown)` line; gates
      log, nothing else"
- Group: the FAILED path.
    - Sub: "FAILED path: `update: ncu failed (base) status 1` + `update: FAILED
      - see lines above`"
    - Sub: "FAILED path: breaker incremented + `update stage FAILED (1) ...
      consecutive=1` + update-failed journal"
    - Sub: "FAILED path: U-sub-2 refresh runs even on failure"
- Group: the policy pick and the engines.
    - Sub: "Resolve: FIRST-WINS engine-input pick (global -> own dir ->
      registry-adjacent -> default)"
    - Sub: "policy engine: policy file read + verifyCommand through the seam +
      merged rejects"
    - Sub: "verifyCommand: exit 0 ok / 127 non-fatal / other fails the stage"
    - Sub: "policy fallbacks: absent + unparsable policy files -> built-in
      default lines"
    - Sub: "engine: programmatic mode - ncu library in-process, chain-safe
      reject list"
    - Sub: "P1 piping: collected bin-mode stdout appended to the ledger"
    - Sub: "P1 piping: the same text piped raw into the job's output ring"
    - Sub: "fallbacks: no-registry and preflight-rejection -> the contained
      detached chain"
    - Sub: "Follow: passage gate + Filter gate before the first-wins pick and
      dispatch"
    - Sub: "factory wiring: ResolvePolicy union discovery runs on the observe
      path (State.PolicyName)"
    - Sub: "factory wiring: configured-but-absent global policy is silently
      not a source"
    - Sub: "ledger prefix: every factory-composed line is
      `hook-dsh-governor-package: ...`"

## Fixtures

The harness world (Boot) with `Probe.Mode = "bin"`; proj-f as the recurring dispatch target (its
breaker count, Stash stamp, and in-flight set are seeded and cleaned around each gate check); the
Spawn knobs (Exits queue, Out text) drive the bin-mode runs; proj-g/proj-g2/registry-adjacent for
Resolve; proj-np for the policy fallbacks; proj-j for the programmatic mode (the npm-check-updates
import is heavy - the 200x50ms poll loop of the source is kept); proj-k for the observe-path wiring.

INTERLEAVED CAPTURES: where the source suite asserted BETWEEN two fixture actions (the generic
default-policy count between the two fallback dispatches; the dispatched count between the two
detached-fallback runs), the folder captures that intermediate count in the fixture phase and the
check asserts the captured value - the same point in the flow, the same semantics.

## Expected ledger strings (byte-identical)

- `update stage paused for <dir> (3 consecutive failures >= 3)` (U+2265)
- `update stage skipped for <dir> (in-flight)` / `(cooldown)`
- `update: ncu failed (base) status 1`, `update: FAILED - see lines above`
  (U+2014), `update stage FAILED (1) for <dir>; consecutive=1`
- `update: running verifyCommand: echo hi`, `update: verifyCommand ok`,
  `update: verifyCommand runner unavailable (exit 127) - skipped, non-fatal`,
  `update: verifyCommand failed (status 2)`
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, policy <path>)`
- `update: no policy at /no/such/policy.json - using built-in default`,
  `update: using built-in default policy`, `update: unreadable policy at
  <path> - using built-in default`
- `update: mode=programmatic (npm-check-updates library)`, `update: ncu (base)
  -> ...` (U+2192)
- `unreadable update-policy.json at <path> - using built-in default`

## Edge cases

- The three gates share one window: exactly 3 lines total, nothing else.
- The breaker increments on failure and resets on success; the U-sub-2 refresh re-emits with the
  stat version even on the FAILED path.
- 127 from the verify runner is non-fatal (the stage completes); any other non-zero fails the stage.
- The programmatic run is polled (the library import is heavy); the Mode field is restored to "bin"
  afterwards.

## Expected count

21 PASS.
