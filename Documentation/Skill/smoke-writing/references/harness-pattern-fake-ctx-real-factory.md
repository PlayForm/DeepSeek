# The Harness Pattern (Fake ctx + Real Built Library)

> Source: SKILL.md, section "The harness pattern", rule 1. Mandate:
> the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every smoke suite loads the REAL built `Target/Library.js` of its
bundle (and the REAL factory instance where the bundle consumes it)
against a FAKE ctx. The fake ctx provides exactly the seams the code
touches:

- the capture seams: `on` / `emit` / `effect` / `get` / `reflect` /
  `fs` / `waterfall` / `logger` - each records what the code calls so
  assertions can read the recorded calls;
- the `root` seam: `get root() { return Context; }` - the fs/observed
  listeners register on the root, so the root must resolve to the
  Context the suite controls;
- the `__<name>State` probe attachments - the state objects the suite
  attaches to the fake ctx so the internals of the running code can be
  probed directly.

## Why: The Full Philosophy

1. **Real code, fake world.** The thing under test is the built
   artifact (`Target/Library.js`), not a re-implementation or a stub of
   the module. If a smoke exercised a copy of the logic, it would
   verify the copy, not the shipped code. The world around the code
   (ctx) is fake so the suite can observe and control every boundary.
2. **Determinism.** A real ctx would touch the filesystem, timers,
   logging, the observed root - none of which a smoke may vary. The
   fake ctx makes every side effect a recorded value: an assertion can
   be byte-identical only if the observable universe is fixed.
3. **The seam list is the contract of what the code may touch.** If a
   module reaches for something outside these seams, the suite cannot
   see it, which is exactly how vacuously-green results and hidden
   live-only behavior happen (see ./references/vacuously-green-trap.md).
   Extending the seam list is itself an additive change: the fake ctx
   grows, the existing assertions never weaken.
4. **The `root` seam exists for a concrete reason**: the fs and the
   observed listeners register on the root. A suite whose fake root
   does not resolve to its Context will silently register listeners
   where no assertion looks - a wiring bug that reads green.
5. **The `__<name>State` probes exist because behavior alone is not
   enough.** Some facts (which intent was queued, which version token
   was seen) are only visible in internal state; the probes let the
   suite assert on the state directly without weakening encapsulation
   in the shipped code.

## Examples

### Good

- A suite builds the bundle, loads
  `../packages/<bundle>/Target/Library.js`, constructs the fake ctx
  with all capture seams, attaches `__cargoState`, boots, then asserts
  on the recorded `logger` calls byte-identically.
- A suite's fake ctx defines `get root() { return Context; }` so the
  code's listener registration lands on the Context the suite owns.

### Bad

- A suite re-implements the module's logic inline "because the real
  build is awkward to load" - now the smoke tests the smoke's copy.
- A fake ctx missing one capture seam (say `waterfall`) so the suite
  cannot observe that path and quietly omits its assertions.
- A suite attaches no `__<name>State` probe and instead infers
  internals from side effects it happens to see - blind spots.

## Exceptions

- The REAL factory instance is loaded only "where the bundle consumes
  it": bundles that do not consume the factory do not fake one. The
  fake ctx shape follows the bundle's actual dependency surface, never
  a one-size template.
- The fs seam is the deliberate per-suite exception within the fake
  world - see ./references/fake-fs-variants.md: some suites use the
  capturing fs, the pinner's suite uses a real-token fs.

## Failure Modes

- Partial fake ctx: a seam present but not capturing (e.g., `on`
  registered but the handler table never read) - the suite believes it
  checked what it never stored.
- Fake code under a real ctx, or vice versa - both invert the
  pattern; the first tests a copy, the second makes the suite
  environment-dependent.
- Wrong `root` wiring: listeners land off-Context; the "pass" is
  vacuous for the registration path (the cargo's `boot()` lesson,
  see ./references/vacuously-green-trap.md).
- Probe drift: a `__<name>State` attachment renamed in the code but
  not in the suites - the probe reads `undefined` and every assertion
  on it either fails mysteriously or, worse, was comparing `undefined
  === undefined` all along.

## Arbiters

- Code review against this pattern: every new suite must show the
  real-library load line, the full capture-seam set, the root seam,
  and the probe attachments before merge.
- The cross-suite scan: all suites in the family import from
  `Target/...` (see ./references/smokes-dir-imports-symlinks.md);
  any suite importing another code path is a pattern violation.
