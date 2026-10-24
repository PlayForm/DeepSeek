# Config-And-Activation

What this test verifies.

## Intent

The ccr config surface and the activation posture. Every volatile field
arrives as a `{ get }` cell (log, logFile, thresholdBytes, previewMaxChars,
multipliers), every config default is pinned (thresholdBytes 2048,
inlineThresholdBytes 1024, autoExpand true, autoExpandLimitBytes 102400,
compressFailures false, previewMaxChars 240, ttlSeconds 3600,
storeBudgetBytes 268435456, journalPath empty, contextEngine false,
contextEngineThresholdPct 30, protectFirstTurns 2, protectLastTurns 4, the
multipliers map, the 8-tool targets, the exempt list), and the activation
writes its byte-exact ledger line in BOTH forms - the logger form with the
`ccr: ` module prefix and the durable `[ISO]` file form without it - plus the
identical detail journaled to the shared storage domain. It is its own folder
because these are the identity-driven strings of the module: they change only
when the module's identity changes. This is the source suite's Run 1 (config
and activation parts) plus Run 8's activated-file-form check, moved verbatim.

## Scenario

- Group: Run 1 - the volatile cells and the config defaults.
    - Check: "volatile cell: log arrives as { get }".
    - Check: "volatile cell: logFile arrives as { get }".
    - Check: "volatile cell: thresholdBytes arrives as { get }".
    - Check: "volatile cell: previewMaxChars arrives as { get }".
    - Check: "volatile cell: multipliers arrives as { get }".
    - Check: "config default thresholdBytes=2048".
    - Check: "config default inlineThresholdBytes=1024".
    - Check: "config default autoExpand=true".
    - Check: "config default autoExpandLimitBytes=102400".
    - Check: "config default compressFailures=false".
    - Check: "config default previewMaxChars=240".
    - Check: "config default ttlSeconds=3600".
    - Check: "config default storeBudgetBytes=268435456".
    - Check: "config default journalPath='' (memory-only)".
    - Check: "config default logFile: ~/.dsh/playform/hook-dsh-ccr.log (the documented default)".
    - Check: "config default contextEngine=false (phase 4, inert)".
    - Check: "config default contextEngineThresholdPct=30".
    - Check: "config default protectFirstTurns=2".
    - Check: "config default protectLastTurns=4".
    - Check: "config default multipliers: error x8, grep/paths/web x2, the
      rest x1" (the runtime label uses U+00D7).
    - Check: "config default targets: the 8-tool terminal/search/fetch
      family".
    - Check: "config default exempt: mutators, the plugin's own tool, agents'
      briefs, user gates".
- Group: Run 1 - the activation posture.
    - Check: "activation ledger line byte-exact: 'ccr: activated (bundle
      0.1.0, targets 8, budget 268435456)'".
    - Check: "the activation record journals to the shared storage domain
      with the identical detail".
- Group: Run 8 - the durable ledger file.
    - Check: "the durable ledger file: '[ISO] activated (bundle 0.1.0,
      targets 8, budget 268435456)' (the file form has no module prefix)".

## Fixtures

- The Harness fake ctx + the REAL factory (`Furnace`) + the REAL ccr apply;
  `Raw1 = Validate({ logFile: Ledger })` for the config checks, `Run1 =
  Make(Raw1)` for the activation posture.
- Run 8's fixture: a fresh default-config run (`autoExpand: false`) with one
  oversized bash terminal result pushed through the post-execute listener, a
  10 ms settle, and a read of the durable ledger file.

## Expected ledger strings (byte-exact)

- `ccr: activated (bundle 0.1.0, targets 8, budget 268435456)` (the logger
  form).
- `[ISO] activated (bundle 0.1.0, targets 8, budget 268435456)` in the
  durable file (matched with the
  `^\[[^\]]+\] activated \(bundle 0\.1\.0, targets 8, budget 268435456\)$`
  regex; the stamp is the one non-deterministic part).

## Edge cases

- journalPath defaults to the empty string - the store is memory-only.
- contextEngine defaults to false - the engine phase stays inert.
- The activation record's detail is identical to the ledger line's message
  body.

## Expected count

25 PASS.
