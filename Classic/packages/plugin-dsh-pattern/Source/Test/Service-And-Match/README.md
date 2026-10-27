# Service-And-Match - the service surface and the ranked match tests

This folder covers the class-form loader contract, the Service registration, the cold-start catalog, the idempotent registry, the byte-exact activation line, and the matcher's scoring arithmetic with both abstention paths.

## Scenarios

- S1: the Service base binds the instance under `pattern` through
  ctx.reflect.provide; the Config and inject statics hold the loader
  contract; the cold start loads exactly the four static patterns; the
  activation line is byte-exact (`activated (seeded 4 patterns)`).
- S2: Get/Put/List - idempotent Put by id, an unknown Get returns undefined,
  and List comes sorted by id.
- S3: the match arithmetic - keyword overlap 0.6, tool match 0.2, confidence
  0.2, checked with exact scores; a below-threshold score and an
  ambiguity-tied top pair both return the empty result; maxMatches caps the
  list; a disabled service returns empty.

## Expected count

13 PASS.
