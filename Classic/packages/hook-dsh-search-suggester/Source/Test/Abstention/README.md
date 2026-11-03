# Abstention

The plan's suite 4 covers the abstention path: the six reasons the plugin can give, each with its byte-exact ledger line, the downstream decision returned unchanged, the durable `[ISO]` form, and the standing rule that an abstention is silence (no note, ever).

## Scenarios

- A1: a call the explicit pack does not match produces `abstained no-signal  0.00`.
- A2: a weak match under a raised config floor (0.9) produces `abstained low-confidence Version 0.87`.
- A3: a packed workspace whose companion is absent produces `abstained no-companions Version 0.87`.
- A4: a candidate set the config excludes produces `abstained ambiguous-target Version 0.87`; the pack's own gate is the 0.5 floor, so the 0.87 confidence crosses the config's 0.75 and the exclusion is what empties the list.
- A5: a foreign workspace (no `.git`/`package.json` root, no session cwd) produces `abstained foreign-workspace  0.00`, with the downstream contexts untouched.
- A6: a rooted workspace with no explicit pack and no session history produces `abstained no-history  0.00`.
- A7: the abstention scenarios never emit a note and never warn.

## The source split

The four classifier reasons are driven by a temporary `.dsh/pack.yml` (the pack is an explicit override only), while `foreign-workspace` and `no-history` are the two reasons a workspace with no explicit pack and no session history gives.

The built-in pack is never consulted.

## Known gaps (the plan's search-specific abstentions)

The section 2.4 items 4 and 5 of the plan (the exploratory-question gate and the read-only-subagent threshold bump) are NOT implemented, because the classifier does not read the goal text and does not know the read-only posture of a lane.

They are recorded as residuals of the wave.

## Fixtures

The shared Harness plus `node:fs` temp trees under a dedicated temp parent: the packed workspace (its own `.dsh/pack.yml`), the empty packed workspace (no companion), the bare rooted workspace (no pack), and the foreign workspace (no root marker).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained no-signal  0.00`, `abstained low-confidence Version 0.87`, `abstained no-companions Version 0.87`, `abstained ambiguous-target Version 0.87`, `abstained foreign-workspace  0.00`, `abstained no-history  0.00`.

## Expected count

7 PASS.
