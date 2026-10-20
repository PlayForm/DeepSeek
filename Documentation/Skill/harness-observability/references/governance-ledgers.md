# The Governance Ledgers and the Live Battery

> Source: SKILL.md, section 4 rule 4 + section 6, "The governance observability (the live battery)". Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

~/.dsh/ carries the LIVE LEDGERS - the fs/observed governance trail:

- governor.log - the governor ledger
- pinner.log - the pinner ledger
- cargo-governor.log - the cargo governor ledger
- normalize-*.log - the normalize family's ledgers
- mdash.log - the mdash ledger

Every tool-layer write is a governed event: the governor, the pinner, and
the cargo flavor fire on the AGENT'S OWN write/edit calls. The ledgers are
the live battery's evidence - the activation lines, the chain passes, the
refusals.

The live battery = real harness operations + the ledger inspection: the
agent performs genuine writes with the genuine tools and then reads the
ledgers to prove the chain fired. It is the battery built from the
interlock, the escape hatch, the direct-govern, and the v2 domain - the
full detail lives in the plugin-system skill.

## Why: The Full Philosophy

1. **The agent's own writes are the plugin usage.** There is no separate
   test harness needed to exercise the governance plugins: every write,
   edit, and raw-write the agent performs is a real event on the observed
   path. The agent IS the workload.
2. **Observability makes governance verifiable, not presumed.** A
   governance plugin that claims "every write is checked" is unverifiable
   until its trail is readable. The ledgers make the claim checkable: an
   activation line for the flavor, the chain passes for the event, and a
   refusal when the chain rejects.
3. **Refusals are evidence too.** A chain pass proves the happy path; a
   refusal in the ledger proves the enforcement path actually fires. Both
   belong in the battery's evidence, and both are observable in the same
   files.
4. **Real operations, real ledgers.** The battery's discipline is to avoid
   synthetic fixtures: the writes are genuine file operations in a genuine
   session, so the ledger entries carry real timestamps, real paths, and
   real outcomes - the strongest form of proof a governance plugin can
   produce.
5. **The flavors are separable.** Governor, pinner, cargo-governor,
   normalize-*, and mdash are distinct ledgers because they are distinct
   flavors of the chain; reading the right ledger answers the right
   question about which flavor handled an event.

## Examples

### Good

- Exercising the chain: perform a write with the write tool, then read the
  relevant ~/.dsh ledger for the activation line and the chain pass.
- Diagnosing a rejected write: look for the refusal line in the ledger -
  it names what the chain objected to.

### Bad

- Claiming "governance fired" without reading a ledger - the claim is then
  unverified.
- Testing governance with synthetic, out-of-band file operations that bypass
  the tool layer - the chain only sees tool-layer writes, so the test
  proves nothing about the real path.

## Exceptions

- Only tool-layer writes are governed events: terminal-side file operations
  bypass the observed path (which is one reason the code-authoring law
  forbids editing files through the terminal - see
  ./references/filesystem-web-access.md).
- Read-only tool traffic does not produce fs/observed governance events;
  the ledgers are the write-path trail.

## Failure Modes

- Assuming the chain fired instead of reading the ledger: the whole point
  of the trail is that "should have fired" is not "fired".
- Testing through a bypass and reporting green: an unobserved write proves
  nothing about the governed path.
- Reading the wrong flavor's ledger for the question at hand: each flavor
  logs its own events.

## Arbiters

- The ledgers are the arbiter of whether governance fired: activation
  lines, chain passes, and refusals in ~/.dsh/*.log are the evidence, and
  the plugin-system skill's smoke suites are the arbiter of the family's
  correctness discipline around them.
- The write/edit/raw-write tool path is the arbiter of what counts as a
  governed event.
