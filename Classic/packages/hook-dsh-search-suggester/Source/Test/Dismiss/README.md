# Dismiss

The P4 DISMISS TOOL (`suggestion_dismiss`) covers the registered tool, the recorded dismissal, the family suppression, the path-level candidate drop, the durable reload, the TTL expiry, and the refusals.

## Scenarios

- D1: the tool registers through the loader's tool API with one definition, `intent` required, `path` optional, and the documented output schema.
- D2: a family dismissal is recorded (`until = now + dismissTtl`), the ledger carries `dismissed Version *`, the knowledge file stores the dismissal, and the next note is suppressed (`suppressed dismissed Version`).
- D3: a path dismissal is recorded (`dismissed Version package.json`), and the note drops that candidate while the rest of the set still emits.
- D4: a live dismissal survives a reload and still suppresses, while an expired one (`until` in the past) is pruned on the read and the note returns.
- D5: an unknown family is a self-describing error, and a disabled suggester refuses the tool.

## Fixtures

The fixtures use the shared Harness (the fake ctx captures `tools.register` into `Run.Tools`), and the durable reload writes a knowledge JSON with the given dismissals through `node:fs`.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`dismissed Version *`, `dismissed Version package.json`,
`suppressed dismissed Version`.

## Expected count

10 PASS.
