Sticky-Section-And-Ring - the second surface tests

The system-prompt/assemble and tools/change listeners run against the fake ctx and cover the surface off by default, the sticky section build and cache, the TTL semantics, and the tools/change invalidation.

## Scenarios

- S1: with `sectionMode` off (the default) the assemble waterfall passes through untouched, with no section appended and no ledger line.
- S2: with `sectionMode: "sticky"` and after a Version emit, the assemble appends one section named `hook-dsh-search-suggester` carrying the Version intent's full target list with one reason per target, the `section rebuilt (ttl 20)` ledger line is byte-exact in the logger and durable forms, and a second assemble inside the TTL serves the cached section without a second rebuild line.
- S3: the default (no-agent) ring builds and caches its own section, and `tools/change` invalidates exactly that cache with the byte-exact `section invalidated (tools/change)` line, after which the next assemble rebuilds it, while `tools/change` on an empty cache is silent.
- S4: an assemble with no cooled intent passes through with no section and no warnings.

## Fixtures

The fixtures use the shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target, and a temp knowledge file).

There is no fake clock, because the TTL is asserted on the ring's call counter (`sectionBuilt`), not on wall time.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`section rebuilt (ttl 20)`, `section invalidated (tools/change)`.

## Expected count

7 PASS.
