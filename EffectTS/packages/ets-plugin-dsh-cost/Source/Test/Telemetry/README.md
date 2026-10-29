# Telemetry

What this test verifies.

## Intent

`Telemetry` - the signals the session log already carries (Documentation/Plans/COST-TRACK-PLUGIN.md
section 17.4): one session's records walked in order for the retry count (the assistant/attempt
events between a step/start and the assistant/message, one when none), the step-to-message latency,
the first stream record's `time0` (null when the stream is empty or the field is absent), the
tokens-per-second rate, the context window and its utilization (the surface over the window, null
when the window is absent) - and an unknown shape never throws.

## Scenario

- Check: "E4: two attempts between the step and the message are counted".
- Check: "E4: the latency is the step-to-message distance and the rate follows" - 2000 ms and 100
  tokens per second from 200 output tokens.
- Check: "E4: a missing or empty stream yields a null first-token latency" - no stream field, an
  empty stream, an absent `time0`, and the read value when the field is there.
- Check: "E4: utilization is the surface over the window, null when the window is absent" - 250
  over 1000 is 0.25, and a session without a `request/context` reports no window and no
  utilization.
- Check: "E4: an unknown shape never throws and the attempts default to one" - junk records walk
  through, no readable times leave the latency null, no failure leaves the code null.

## Fixtures

- None: the walk is a pure function over hand-built record arrays (the timestamp under the
  record's data, the stream array on the assistant message); the Harness supplies only the
  counter and the finish guard.

## Expected count

5 PASS.
