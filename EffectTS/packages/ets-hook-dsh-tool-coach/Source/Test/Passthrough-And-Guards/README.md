# Passthrough-And-Guards

What this test verifies.

## Intent

The zero-noise half of the coaching ladder: legitimate terminal commands must
pass through the tools/post-execute waterfall with NO additionalContexts, no
extra ledger lines and no warnings (R1); a malformed (cyclic) payload must hit
the fail-open envelope and return the downstream decision unchanged while
logging a prefixed warning instead of throwing; and the dedicated tools
(read/write) must never be judged, no matter what the command looks like.
These are the guarantees the rest of the system silently relies on. The
assertions are moved verbatim from `Classic/smokes/tool-coach-smoke.mjs` (R1
+ the fail-open envelope checks + the "dedicated tools are never judged"
check).

## Scenario

- Group: R1 - legitimate bash passthrough.
    - Sub: "R1: all 10 legitimate calls pass through with NO
      additionalContexts" (git status, pnpm build, node, ls, rm -rf build,
      python, make, docker ps, echo, true - each returns the downstream
      decision by identity)
    - Sub: "R1: the only ledger line is the activation"
    - Sub: "R1: no warnings (no listener ever throws)"
- Group: the fail-open envelope (the malformed payload guard).
    - Sub: "a malformed (cyclic) payload returns the downstream decision
      unchanged" (a self-referential arguments object through
      tools/post-execute)
    - Sub: "the fail-open envelope logs a prefixed warning instead of
      throwing" (the warning starts with `hook-dsh-tool-coach: `)
- Group: the dedicated tools are never judged.
    - Sub: "the dedicated tools are never judged (read/write calls)" (cat via
      the read tool, sed -i via the write tool - zero offense lines)

## Fixtures

The harness world: the fake ctx with the REAL factory instance and the live
registry schema fixture, one fresh `Make(Validate({ logFile: Ledger }))` per
group (three fresh applies, each against the cleared harness tmpdir ledger).
The R1 group drives ten `Post` waterfall passes; the fail-open group drives
one post-execute pass with a cyclic arguments object; the non-judged group
drives two post-execute passes with the tool name overridden to `read` and
`write`.

## Expected ledger strings (byte-exact)

- `hook-dsh-tool-coach: activated (bundle 0.3.0, threshold=3/8, cooldown=10,
  escalate=6, clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)` - the
  ONLY line the R1 group's run is allowed to have logged (asserted as "the
  only ledger line is the activation").
- No offense/exempt/strike lines anywhere in this folder; the fail-open
  warning is a logger.warn line starting with the `hook-dsh-tool-coach: `
  prefix.

## Edge cases

- `rm -rf build` and `echo hello` are legitimate despite looking destructive
  or write-ish - the passthrough check covers both.
- The cyclic payload is the negative control for JSON.stringify-based
  argument normalization: without the fail-open envelope the waterfall would
  throw.
- The non-judged check is the counter-example to the whole detection engine:
  identical commands are only offenses when the TOOL is a terminal.

## Expected count

6 PASS.
