# Raw-Write-Tool

What this test verifies.

## Intent

The raw-write tool surface: the tool this flavor registers alongside its
stream listener. This is its own folder because the tool is a complete
second product - a registration schema, an execution path through the shared
write executor, a per-call flavor selection, and a govern path - none of
which touches the llm/stream waterfall the other folders cover. This folder
is the post-blueprint growth of the suite (the source suite's Run 8, Run 9
and Run 10 incl. its addendum), moved verbatim.

## Scenario

- Group: Run 8 - the raw-write tool (registration capture + exec).
    - Check: "exactly one tool registered".
    - Check: "the tool registration is captured: the tool is named
      raw-write".
    - Check: "input schema: file_path is a required string".
    - Check: "input schema: content is a required string".
    - Check: "input schema: normalize is an OPTIONAL union (boolean | "all"
      | the flavor-name array - the harness tools reject unknown keys, so
      the whole selection shape is declared)".
    - Check: "normalize stays OPTIONAL".
    - Check: "input schema: govern is an OPTIONAL union (boolean | "all" |
      the step-name array)".
    - Check: "govern stays OPTIONAL".
    - Check: "output schema mirrors the built-in write envelope
      (path/operation/before/after)".
    - Check: "normalize absent: content written VERBATIM (em dash and curly
      quotes untouched)".
    - Check: "the fs/write-intent waterfall's next() default flowed through
      (unconditional write)".
    - Check: "bare backend: no sandbox policy stamped onto the write".
    - Check: "fs/observed emitted with the written version (the governance
      hooks' trigger)".
    - Check: "the emitted actor is the WRAPPED exec: the govern marker
      present, false for an absent flag (the factory's gate skips the event
      path)".
    - Check: "the wrapped actor preserves every exec field (the spread -
      name/callId/agent/signal survive for the harness's own listeners)".
    - Check: "the write outcome is returned (path, create, before null,
      after verbatim)".
    - Check: "normalize: true -> all six transforms applied (em dash->-,
      curly quotes->straight, ellipsis->..., NBSP->space, zero-width
      removed, fullwidth->halfwidth)".
    - Check: "the normalized write to a new path reports create with the
      normalized after".
    - Check: "an overwrite reports update with the real before/after
      contents".
    - Check: "normalize: false -> content written VERBATIM".
    - Check: "the volatile replacement knob flows into the tool (literal $&
      - the function replacer)".
    - Check: "a pre-aborted signal rejects the call".
    - Check: "a pre-aborted signal writes NOTHING (no fs write after the
      abort)".
- Group: Run 9 - the fine-grained normalize selection (per-call flavors).
    - Check: "normalize: ["dash"] -> ONLY the dashes replaced (quotes,
      ellipsis, spaces, invisible, fullwidth untouched)".
    - Check: "the ["dash"] write's after mirrors the selection".
    - Check: "normalize: ["quotes"] -> ONLY the curly quotes replaced (em
      dash untouched)".
    - Check: "normalize: ["fullwidth"] -> ONLY the fullwidth mapped
      (fullwidth-A -> A)".
    - Check: "an out-of-order selection applies the flavors in the FAMILY
      order (dashes -> quotes -> fullwidth)".
    - Check: "normalize: "all" -> all six transforms (byte-equivalent with
      normalize: true)".
    - Check: "normalize: [] -> an empty selection writes VERBATIM".
    - Check: "normalize: ["bogus"] - the union schema REJECTS unknown
      flavor names (harness-style args validation; the chain's own filter
      is the second gate)".
    - Check: "presentCall shows the selection-aware content (card and file
      can never disagree)".
    - Check: "presentResult shows the selection-aware content".
- Group: Run 10 - the govern call path (the registry is EMPTY here).
    - Check: "govern: true with an empty registry - the write completes
      (the governed call is a contained no-op)".
    - Check: "govern: true - the wrapped actor carries the selection value
      (true; the gate checks presence, the direct path gets the original
      flag)".
    - Check: "govern: a step-name array with an empty registry - the write
      completes (the governed call is a contained no-op)".
    - Check: "govern: [steps] - the wrapped actor carries the array
      selection as-is".
    - Check: "govern: ["bogus"] - the union schema rejects unknown step
      names at the harness boundary".
    - Check: "govern: "all" with an empty registry - the write completes".
    - Check: "govern: "all" - the marker maps to true like the boolean".
    - Check: "govern: the empty registry stays empty (no steps registered
      by the calls)".
    - Check: "govern + normalize compose on one call (selection-aware
      write, contained govern)".
    - Check: "govern: false - no governance chain, verbatim write".
    - Check: "govern: false - the marker maps to false (still present: the
      event path stays skipped)".
    - Check: "govern actor probe: the write completes with a registered
      step in the chain".
    - Check: "govern actor probe: the direct step runs once with the
      written outcome's fresh version (the fs/observed emit's token)".
    - Check: "govern actor probe: the direct step receives the WRAPPED
      actor - the govern marker present with the mapped selection (NOT the
      plain exec)".
    - Check: "govern actor probe: the spread preserves the exec fields
      (callId, signal ride along)".
    - Check: "govern: false - the Govern call is omitted entirely (the
      registered probe step never runs)".
    - Check: "govern sequential fold: the write completes with an async
      registered step in the chain".
    - Check: "govern sequential fold: the async step ran ONCE and completed
      BEFORE the tool result returned (the exec awaits the fold)".
    - Check: "govern sequential fold: the async step receives the wrapped
      actor like the sync steps".

## Fixtures

The harness fake ctx (the capturing fs seams, the waterfall delegate, the
synchronous emit recorder, the self-root) + the REAL factory + the REAL dash
apply. Three applies: one for Run 8 (the registration + exec + the
replacement-knob sub-run + the abort sub-run), one for Run 9 (the
selection), one for Run 10 (the govern path). The `Exec` helper builds the
call identity (signal, undefined agent, callId `call_smoke`). The two govern probes register on the harness Furnace
(sync "pin" and async "slow"). The write-count arithmetic inside Run 10 is
kept relative exactly as the source suite does it (the addendum re-baselines
after the main block; see the comment in the test). The durable ledger is
cleared at folder start and before the replacement-knob sub-run.

## Expected ledger strings (byte-exact)

None asserted in this folder - the tool path's count lines belong to the
executor, and this folder pins behavior/schema/identity instead. The
govern/normalize union enums are the byte-exact contracts here:
`dash,quotes,ellipsis,spaces,invisible,fullwidth` and
`canonicalize,pin,cargo,update`.

## Edge cases

- normalize absent, explicit false, empty array, unknown name (schema
  rejection), "all" as string - the full verbatim/reject/rewrite boundary.
- Overwrite vs create reporting, before/after fidelity.
- Pre-aborted signal: rejection with NO write.
- Govern with an empty registry: contained no-op; with a registered probe:
  the wrapped actor, the fresh version token, the sequential fold; govern
  false: the call omitted entirely.

## Expected count

52 PASS.
