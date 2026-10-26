# Policy-Defaults

The policy block (D6) and the knob contract: the defaults, the merge, the
proposer posture, and the fail-loud checks.

## Intent

`write: approve` is the single most important default in this package - it is
what makes the review a PROPOSER rather than an autonomous editor, and it is the
one default a future refactor must not quietly flip. The knob checks are the
other half: a reversed stale/archive pair or a `NaN` cadence must fail AT LOAD,
where the message names the knob, not at the first review where the symptom is a
silent no-op.

## Scenario

- "P1: the schema fills the D6 policy defaults".
- "P2: a bare construction carries the D6 block in the knobs".
- "P3: a partial policy override merges over the defaults".
- "P4: the shipped posture is PROPOSE (write stays approve)".
- "P5: the schema's own defaults are the idle-forever posture" - disabled, ten
  turns, fourteen/thirty days, consolidation off.
- "P6: a reversed stale/archive pair throws AT LOAD".
- "P7: a bad domain name throws AT LOAD".
- "P8: a non-finite numeric knob falls back to its default" - `NaN` and a string
  both land on the default.
- "P9: the digest tail below two is refused".

## Fixtures

The shared Harness: the real built `Target/Library.js` class, the schema's own
validation (`LessonService.Config`), and the `Make` constructor mount. No
filesystem is touched by this folder.

## Expected ledger strings (byte-exact)

None new - the defaults are the contract and are asserted as objects.

## Expected count

9 PASS.
