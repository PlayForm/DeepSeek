# Noise

The plan's suite 8 covers the ZERO-NOTE contract.

Twenty legitimate calls must produce EXACTLY zero notes, and the suite asserts the count rather than merely the absence of an error (the vacuous-green trap).

It also asserts that the silence is measured: every judged call that stayed silent left its abstention line.

## Scenarios

- N1: twenty calls (ten unrelated greps, five low-confidence matches across five intents, and five tools the suggester never judges: `webfetch`, `agent`, `web_search`, `list_agents`, `write`) produce zero notes, zero `suggest` lines, ten `no-signal` and five `low-confidence` abstention lines, and zero warnings.
- N2: a turn boundary (`agent/pre-step`) does not leak a note, so the fresh turn stays silent.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained no-signal  0.00` (ten),
`abstained low-confidence <Intent> 0.66` (five).

## Expected count

4 PASS.
