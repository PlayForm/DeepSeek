# Noise

The plan's suite 8 covers the ZERO-NOTE contract: twenty legitimate calls must produce EXACTLY zero notes, and the suite asserts the count, not merely the absence of an error (the vacuous-green trap).

It also asserts that the silence is measured: every judged call that stayed silent left its abstention line.

## Scenarios

- N1: twenty calls (ten unrelated greps, five search literals with no session history behind them, and five tools the suggester never judges: `webfetch`, `agent`, `web_search`, `list_agents`, `write`) produce zero notes, zero `suggest` lines, fifteen `no-history` abstention lines, zero `low-confidence` lines, and zero warnings.
- N2: a turn boundary (`agent/pre-step`) does not leak a note, and the fresh turn stays silent.

## The silence

The judged calls run inside one temp workspace (rooted by its `package.json`, with no `.dsh/pack.yml`), so the silence is the history model's own: no adjacency, no explicit pack, no note.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained no-history  0.00` (fifteen).

## Expected count

4 PASS.
