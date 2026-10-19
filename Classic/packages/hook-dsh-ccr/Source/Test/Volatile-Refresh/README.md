# Volatile-Refresh

What this test verifies.

## Intent

The State builder's P10 `loader/volatile-update` refresh listener as the ccr
State carries it: exactly two listeners after a default apply
(tools/post-execute plus the State builder's P10 refresh), so a config change
committed to the running plugin reaches the State without a remount. It is
its own folder because the refresh dispatch is the hazardous path - a rebuild
would re-apply and duplicate the registrations.

## Scope note (what this folder does NOT assert)

The source suite asserts the listener's PRESENCE here and nothing more; the
dispatch BEHAVIOR (the in-place field updates on the key-array, dotted and
nested-object paths, the identity preservation, the unknown/failed path
safety, the shared `log` -> Enabled mapping) is the factory's SHARED
machinery - the listener is registered by `Factory.State` - and is exercised
byte-verbatim by the factory package's Entry-And-State folder (its P10
volatile-refresh section). This folder holds the ccr-side registration
assertion from the source suite's Run 1, moved verbatim; no assertion was
invented here. (The engine flag ON adds agent/pre-step as a third listener -
that posture is the Engine-Flag-On folder's.)

## Scenario

- Group: Run 1 - the State builder's P10 refresh listener on the ccr State.
    - Check: "tools/post-execute plus the State builder's P10
      loader/volatile-update refresh".

## Fixtures

- The Harness fake ctx + the REAL factory + the REAL ccr apply;
  `Raw1 = Validate({ logFile: Ledger })`, `Run1 = Make(Raw1)`.
- The `Listeners` capture records every `on()` registration with its name;
  the assertion counts the captured set.

## Expected ledger strings (byte-exact)

None - the folder asserts the listener SET, not ledger lines.

## Edge cases

- Exactly two listeners by default: the count assertion is the negative
  control against an accidental extra registration (e.g. an agent/pre-step
  leak from the engine path).

## Expected count

1 PASS.
