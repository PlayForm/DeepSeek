# Recompute-And-Ttl

What this test verifies.

## Intent

The recompute/changing-value and refresh-policy tests. The rendered value of a
request-trigger block CHANGES between two assemblies when the FAKE CLOCK
advances (no sleep, no dependence on the real clock); the counters recompute
from the pre-step/post-execute observers; the global refresh policy decides
between per-request re-rendering and the TTL cache (`refresh "ttl"` with
ttlCalls=2 renders once, reuses the cache on the second assembly, and rebuilds
on the third with the byte-exact `section rebuilt (ttl 2)` line and a CHANGED
value; `refresh "request"` re-renders at every assembly and never logs a
rebuild line); the per-block triggers (ttl/event) drive their own staleness
inside any global policy; the per-turn counter reset runs at the pre-step
boundary; and the tools/change notification clears the section cache with the
byte-exact `section rebuilt (tools/change)` line without re-rendering steady
blocks.

## Scenario

- Group: refresh "ttl" with ttlCalls=2 (one request-trigger time block).
    - Sub: the first assembly renders and caches (one `block rendered t`
      line, and the body carries the current fake-clock time).
    - Sub: the second assembly REUSES the cache (byte-identical body, no new
      ledger line).
    - Sub: after the clock advances past the TTL, the third assembly
      rebuilds - the value CHANGES, `section rebuilt (ttl 2)` is byte-exact,
      and a second `block rendered t` line appears.
- Group: refresh "request".
    - Sub: the second assembly re-renders (the value changes with the clock).
    - Sub: one `block rendered t` line per assembly, and no `section rebuilt`
      line ever.
- Group: per-block trigger "ttl" under refresh "request" (ttlCalls=2):
  render, reuse, and re-render on the third assembly.
- Group: per-block trigger "event": steady assemblies reuse the cache, a
  post-execute observation marks the block dirty, and the next assembly
  re-renders it.
- Group: the per-turn counter reset: after a tool call and a user message,
  the attempts table is cleared and the turn count advances (the state probe;
  Render-And-Frames covers the rendered gauge values).
- Group: the tools/change notification.
    - Sub: `section rebuilt (tools/change)` byte-exact, one time.
    - Sub: the next assembly rebuilds the section body (identical text; the
      ttl rebuild line does NOT appear because the cleared cache rebuilds
      silently), and steady blocks are not re-rendered.

## Fixtures

The harness world with the fake clock (`MakeClocked`; `ClockBox.Now` is reset
to the same epoch at the start of every group, so the assembly indices and
the TTL arithmetic are deterministic).

The waterfall helpers fire the captured listeners directly: Assemble,
PreStep, Post, and the tools/change listener.

## Expected ledger strings (byte-exact)

- `hook-dsh-live-containers: block rendered <id> (<len> bytes)`
- `hook-dsh-live-containers: section rebuilt (ttl 2)`
- `hook-dsh-live-containers: section rebuilt (tools/change)`

## Edge cases

- The assembly count advances BEFORE the cache check, so the hit path and the
  miss path see the same count - the test asserts the TTL arithmetic from
  outside, never by reading the counter.
- A cache hit re-renders nothing and logs nothing (steady state stays quiet),
  and only the rebuild and the notification leave lines.
- The per-block ttl/event caches are independent of the global section cache:
  a cleared section cache reuses the per-block frames that are steady.

## Expected count

17 PASS.
