# Abstention

The plan's suite 4: the abstention path. The five reasons the plugin can
give, each with its byte-exact ledger line, the downstream decision
returned unchanged, the durable `[ISO]` form, and the standing rule that an
abstention is silence - no note, ever.

## Scenarios

- A1: an unrelated judged grep - `abstained no-signal  0.00`.
- A2: a weak Version call - `abstained low-confidence Version 0.84`.
- A3: the empty workspace (the signature only, none of the Owner set) -
  `abstained no-companions Owner 0.66`.
- A4: a pack whose whole candidate set is excluded by the config -
  `abstained ambiguous-target Version 0.87`.
- A5: a foreign workspace (a manifest, no signature) - `abstained
  foreign-workspace  0.00`, the downstream contexts untouched.
- A6: the abstention scenarios never emit a note and never warn.

## Known gaps (the plan's search-specific abstentions)

The plan's section 2.4 items 4 and 5 (the exploratory-question gate and the
read-only-subagent threshold bump) are NOT implemented: the classifier does
not read the goal text and does not know a lane's read-only posture. They
are recorded as residuals of the wave.

## Fixtures

The shared Harness plus `node:fs` temp trees: the empty workspace (the
built-in signature), the foreign workspace, and a packed workspace with its
own `.dsh/pack.yml` (read by `@playform/lib-dsh-pack`).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained no-signal  0.00`, `abstained low-confidence Version 0.84`,
`abstained no-companions Owner 0.66`,
`abstained ambiguous-target Version 0.87`,
`abstained foreign-workspace  0.00`.

## Expected count

6 PASS.
