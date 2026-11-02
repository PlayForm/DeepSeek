# Trigger-And-Cap

This folder covers the idle edge: the iteration counter, the threshold, both write caps, and the
maintenance claim.

## Intent

The gate is the only thing between the harness's idle edge and a model call, so most of this folder
is about what does NOT happen. A disabled service, a count below the threshold, a capped session and
a busy agent each end the run before the review body is reached.

Two properties are the whole reason the file exists:

- **Both caps count successes, never attempts.** The existing nudge hook increments before the work
  and never decrements, which is why its ledger holds `cap reached` lines against zero completed
  reviews. Here a refused or failed run spends nothing, so the budget a real write needs is still
  there.
- **The interval advances on a CLAIMED run, not on a write.** The counter bounds how often the
  review may run; the caps bound how much it may write. Advancing the counter on a write would make
  a corpus with nothing to learn re-run on every idle edge.

The counter is a delta, not a lifetime total: `count` is the tool-call blocks since the last claimed
run, which is the only reading under which the ledger's `<n>/<m>` line means what it says.

## Scenario

- "T1: a disabled service answers `disabled` and never claims the agent" - `enabled: false` with a
  count past the interval is still `disabled`, and the idle phase is never claimed.
- "T2: below the threshold answers `below-threshold` and never claims" - an early tick costs
  nothing.
- "T3: the counter is a delta from the last claimed run" - a run at 5 then a count of 8 is a delta
  of 3, not 8.
- "T4: a due run claims the idle phase and returns the review's own class" - the claim goes through
  `agent.runMaintenance` and the review's `applied` comes back verbatim.
- "T5: the session cap is checked before the model" - at the cap the gate answers `capped` and the
  review is never called again.
- "T6: the cap counts successes, not attempts" - a run that spends nothing leaves the session free,
  so the next run still executes.
- "T7: `spend` advances the session counter and `writes` reports it" - the total carries across
  runs.
- "T8: the cap is keyed by the agent object" - one agent at its cap does not cap the other.
- "T9: a busy agent answers `busy` and the review never runs" - the harness's synchronous throw is
  the class, and nothing is retried.
- "T10: a claimed run advances the interval; a busy run does not" - a write-free run still advances
  the counter, and a busy run leaves it where it was.
- "T11: all twelve outcome classes are reachable without a model" - the five gate classes plus the
  seven the review returns cover the closed union.

## Fixtures

The fixtures are the shared Harness: `FakeAgent` (the derived history, the route, the maintenance
claim, and the two programmable throws), the `Review` stub that ends in one class and spends a
given number of writes, and the real built `Target/Function/Trigger.js` gate.

The gate is constructed directly (`new Gate()`), so each check owns its own counter maps; the agent
object is the cap's key, exactly as the live service keys it.

## Expected ledger strings (byte-exact)

None. The gate produces the verdict, and `Source/Library.ts` owns the ledger line that prints it, so
this folder asserts the verdict as data rather than a string it cannot build.

## Expected count

11 PASS.
