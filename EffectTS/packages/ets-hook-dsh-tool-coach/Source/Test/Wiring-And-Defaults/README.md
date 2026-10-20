# Wiring-And-Defaults

What this test verifies.

## Intent

The loader contract and the config schema are the two surfaces every other
folder (and every consumer) silently depends on: the volatile fields must
arrive as `{ get }` cells, every default must match the documented ladder
numbers, `apply` must return NOTHING while registering exactly the six
listeners, the state probe must carry the REAL factory instance and the
unwrapped cell values, the activation must log its byte-exact ledger line both
in-memory and durably ([ISO] prefixed in the file), and the schema must fail
LOUD on invalid configs (threshold below 1, a user pattern row duplicating a
built-in, maxSectionTools outside 1-24). A drift here breaks every later
folder, so it is its own folder. The assertions are moved verbatim from
`Classic/smokes/tool-coach-smoke.mjs` Run 1 + the three fail-loud validation
checks.

## Scenario

- Group: the volatile cells and the config defaults.
    - Sub: "volatile cells: log/enabled/fetchLive/notes arrive as { get }"
        - log, enabled, fetchLive and notes are `{ get }` callable cells
    - Sub: "config defaults: the ladder numbers, the enforce posture, the
      table defaults"
        - threshold=3, window=8, cooldown=10, escalateThreshold=6,
          cleanWindow=12, enforce="off", enforceThreshold=4,
          maxSectionTools=8, sectionTtl=20, fetchLive=true
        - judgeTools=["bash","pwsh"], notes = the three verbatim templates,
          patternTable = DEFAULT_PATTERNS, exemptPatterns = DEFAULT_EXEMPTS
- Group: the apply-time wiring and the activation.
    - Sub: "apply returns NOTHING (the loader contract)"
    - Sub: "all FIVE coaching listeners are registered" (tools/post-execute,
      tools/pre-execute, agent/pre-step, system-prompt/assemble, tools/change)
    - Sub: "plus the State builder's P10 loader/volatile-update refresh"
    - Sub: "exactly six registrations (5 coaching + 1 volatile refresh)"
    - Sub: "tools/post-execute is a PLAIN registration (runs AFTER ccr's
      {prepend:true})" and "pre-execute and assemble are plain registrations
      too"
    - Sub: "the module identity is hook-dsh-tool-coach" and "inject =
      [pluginFactory, tools]"
    - Sub: "state module = hook-dsh-tool-coach (the ledger prefix)", "state
      carries the REAL factory instance", the volatile unwraps (On=true,
      Threshold=3, FetchLive=true)
    - Sub: "activation ledger line byte-exact" and "the durable ledger file
      carries the [ISO] activation line"
- Group: fail-loud validation.
    - Sub: "fail-loud validation: an invalid config throws at load with a
      clear error" (threshold must be >= 1)
    - Sub: "fail-loud validation: a user row duplicating a built-in pattern
      is rejected"
    - Sub: "fail-loud validation: maxSectionTools outside 1-24 is rejected"

## Fixtures

The harness world: the fake ctx (on/get/logger capture + the root seam + the
configurable tools.schemas seam) with the REAL `@playform/ets-plugin-dsh-factory`
instance from its built Target, and one `Make(Validate({ logFile: Ledger }))`
against the harness tmpdir ledger. The validation group constructs three
throwaway applies through the same `Validate` helper (each throws before any
listener registration matters). The ledger file lives in a fresh per-process
mkdtemp directory.

## Expected ledger strings (byte-exact)

- `hook-dsh-tool-coach: activated (bundle 0.0.1, threshold=3/8, cooldown=10,
  escalate=6, clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)` (the
  in-memory info line)
- The same activation summary after the `[ISO] ` stamp in the durable ledger
  file: `] activated (bundle 0.0.1, threshold=3/8, cooldown=10, escalate=6,
  clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)`
- The refusal error messages (thrown, not logged): `hook-dsh-tool-coach:
  threshold must be >= 1`, `...duplicates a built-in pattern...`,
  `hook-dsh-tool-coach: maxSectionTools must be between 1 and 24`

## Edge cases

- The `notes` volatile cell is an object cell (its `get` returns the whole
  object) - asserted by `typeof .get === "function"` like the scalar cells.
- The registration-count check is the negative control: a seventh (or missing)
  listener registration fails the exact-six assertion.
- Each validation refusal is asserted on the exact error message (or a
  load-bearing substring), not merely on "it threw".

## Expected count

36 PASS.
