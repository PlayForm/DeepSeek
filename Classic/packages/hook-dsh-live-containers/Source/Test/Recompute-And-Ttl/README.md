# Recompute-And-Ttl

What this test verifies.

## Intent

The recompute/changing-value and refresh-policy tests. A request-trigger
block's rendered value CHANGES between two assemblies whose FAKE CLOCK
advances (no sleep, no real clock dependence), the counters recompute from
the pre-step/post-execute observers, the global refresh policy decides
between per-request re-rendering and the TTL cache (`refresh "ttl"` with
ttlCalls=2 renders once, reuses the cache on the second assembly, rebuilds on
the third with the byte-exact `section rebuilt (ttl 2)` line and a CHANGED
value; `refresh "request"` re-renders every assembly and never logs a rebuild
line), the per-block triggers (ttl/event) drive their own staleness within
any global policy, the per-turn counter reset runs at the pre-step boundary,
and the tools/change notification clears the section cache with the
byte-exact `section rebuilt (tools/change)` line without re-rendering steady
blocks.

## Scenario

- Group: refresh "ttl" with ttlCalls=2 (one request-trigger time block).
    - Sub: the first assembly renders and caches (one `block rendered t`
      line; the body carries the current fake-clock time)
    - Sub: the second assembly REUSES the cache (byte-identical body, no new
      ledger line)
    - Sub: after the clock advances past the TTL, the third assembly
      rebuilds - the value CHANGES, `section rebuilt (ttl 2)` is byte-exact,
      and a second `block rendered t` line appears
- Group: refresh "request".
    - Sub: the second assembly re-renders (value changes with the clock)
    - Sub: a `block rendered t` line per assembly; no `section rebuilt` line
      ever
- Group: per-block trigger "ttl" under refresh "request" (ttlCalls=2):
  render, reuse, re-render on the third assembly.
- Group: per-block trigger "event": steady assemblies reuse the cache; a
  post-execute observation marks the block dirty and the next assembly
  re-renders it.
- Group: the per-turn counter reset: after a tool call and a user message,
  the attempts table is cleared and the turn count advanced (the state
  probe; the rendered gauge values are covered in Render-And-Frames).
- Group: the tools/change notification.
    - Sub: `section rebuilt (tools/change)` byte-exact, once
    - Sub: the next assembly rebuilds the section body (identical text; the
      ttl rebuild line does NOT appear because the cleared cache is rebuilt
      silently) and steady blocks are not re-rendered

## Fixtures

The harness world with the fake clock (`MakeClocked`; `ClockBox.Now` is reset
to the same epoch at the start of every group, so the assembly indices and
the TTL arithmetic are deterministic). The waterfall helpers fire the
captured listeners directly: Assemble, PreStep, Post, and the tools/change
listener.

## Expected ledger strings (byte-exact)

- `hook-dsh-live-containers: block rendered <id> (<len> bytes)`
- `hook-dsh-live-containers: section rebuilt (ttl 2)`
- `hook-dsh-live-containers: section rebuilt (tools/change)`

## Edge cases

- The assembly count is advanced BEFORE the cache check, so both the hit and
  the miss paths see the same count - the TTL arithmetic is asserted from
  outside, never by reading the counter.
- A cache hit re-renders nothing and logs nothing (steady state is quiet);
  only the rebuild and the notification leave lines.
- The per-block ttl/event caches are independent of the global section
  cache: a cleared section cache reuses the steady per-block frames.

## Expected count

17 PASS.
