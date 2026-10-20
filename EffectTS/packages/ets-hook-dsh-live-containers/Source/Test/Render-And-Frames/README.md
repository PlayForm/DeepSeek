# Render-And-Frames

What this test verifies.

## Intent

The R-series: the rendered section's shape and the substitution engine. The
assembly gains exactly ONE appended section named `live-containers` carrying
`interpolate: false` (so the harness's own prompt variables never resolve our
tokens), every phase-1 block kind renders inside the byte-exact LIVE
CONTAINER frame, the variable table (time/date/tz under the FAKE CLOCK,
messageCount/turnCount/sinceLastTool from the observers, cwd/sessionId) is
resolved per request, per-block `vars` override the built-ins, unknown
{{tokens}} render LITERALLY with the `render unknown <id> <token>` ledger
line (never a failure), and the budget failsafe collapses the OLDEST frames
to one-line summaries with the `failsafe section-collapse <n>` ledger line.
Every assertion lands on the rendered section text or a ledger line - never
on "no throw" (the vacuously-green guard).

## Scenario

- Group: the section shape and the six kind frames.
    - Sub: "exactly ONE section appended per assembly", the name, the
      interpolate: false flag, the untouched base section
    - Sub: "the section body is the byte-exact kind-frame table" - one frame
      each for time ({{time}} | {{date}} | {{tz}} under the fake clock),
      counter (m/t/s), manifest (cwd/session), gauge, note, template; the
      wave-2 kind (session-stats) is skipped, not rendered
    - Sub: "ledger: one block rendered line per rendered block (byte-exact)"
      with the (<len> bytes) values, and the
      `block skipped wave2 (unknown kind)` line
- Group: the recompute/changing-value cycle.
    - Sub: after two user messages, one tool call and a 7 s clock advance:
      counter recomputed (m=2 t=1 s=7s), gauge recomputed, template sees the
      whole table, time recomputed under the advanced clock
    - Sub: "ledger: request-trigger blocks re-rendered (second pass)"
- Group: {{}} replace-only, unknown tokens literal.
    - Sub: "{{provider}} and {{mystery}}" renders literally (the harness
      variable never resolves), with both `render unknown u provider` and
      `render unknown u mystery` byte-exact
- Group: per-block vars override the built-ins (a vars-overridden {{time}}
  renders the override; no unknown-token line).
- Group: the separator knob (a custom separator byte-exact in the frame).
- Group: the budget failsafe (the oldest frame collapses to the one-line
  `(collapsed, <bytes> bytes; not harness state)` summary; the last frame is
  never collapsed; `failsafe section-collapse 1` byte-exact).
- Group: nothing renders -> NO section at all, plus the
  `block skipped off (disabled)` line exactly once.

## Fixtures

The harness world with the fake clock: `MakeClocked` sets `State.Now` to the
harness clock through the `__hookDshLiveContainersState` probe; folders
advance `ClockBox` and never sleep. The expected {{time}}/{{date}} bytes are
computed with the same Intl shapes Counters.Table uses (en-GB time, en-CA
date, the host zone), so the assertions stay deterministic under the fake
clock.

## Expected ledger strings (byte-exact)

- `hook-dsh-live-containers: block rendered <id> (<len> bytes)`
- `hook-dsh-live-containers: block skipped wave2 (unknown kind)`
- `hook-dsh-live-containers: render unknown u provider` / `... u mystery`
- `hook-dsh-live-containers: failsafe section-collapse 1`
- `hook-dsh-live-containers: block skipped off (disabled)`

## Edge cases

- The frame is the model-facing contract:
  `--- LIVE CONTAINER <id> (recomputed each request; not harness state) ---`
  body `--- END LIVE CONTAINER <id> ---` - asserted byte-exact, not by
  substring presence alone where a full body is known.
- The wave-2 kind proves the kind registry's phase boundary: accepted in
  config, skipped at render until the wave-2 engine lands.
- The budget pass never collapses the last frame and never silently drops a
  block (the summary keeps the byte count).

## Expected count

23 PASS.
