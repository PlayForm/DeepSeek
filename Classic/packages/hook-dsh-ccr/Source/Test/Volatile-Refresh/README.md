# Volatile-Refresh

This file states what the test verifies.

## Intent

The suite covers the P10 `loader/volatile-update` refresh listener of the State builder as the ccr
State carries it: exactly two listeners after a default apply (tools/post-execute plus the P10 refresh
of the State builder), so a config change committed to the running plugin reaches the State without a
remount.

It has its own folder because the refresh dispatch is the hazardous path, since a rebuild would
re-apply and duplicate the registrations.

## Scope note (what this folder does NOT assert)

The source suite asserts the PRESENCE of the listener here and nothing more.

The dispatch BEHAVIOR is the SHARED machinery of the factory, because `Factory.State` registers the
listener, and it is exercised byte-verbatim by the Entry-And-State folder of the factory package in
its P10 volatile-refresh section.

That behavior covers the in-place field updates on the key-array, dotted, and nested-object paths, the
identity preservation, the safety of the unknown and failed path, and the shared `log` -> Enabled
mapping.

This folder holds the ccr-side registration assertion from Run 1 of the source suite, moved verbatim,
and no assertion was invented here.

The engine flag ON adds agent/pre-step as a third listener, and that posture belongs to the
Engine-Flag-On folder.

## Scenario

- Group: Run 1 - the State builder's P10 refresh listener on the ccr State.
    - Check: "tools/post-execute plus the State builder's P10
      loader/volatile-update refresh".

## Fixtures

- The Harness fake ctx with the REAL factory and the REAL ccr apply, where
  `Raw1 = Validate({ logFile: Ledger })` and `Run1 = Make(Raw1)`.
- The `Listeners` capture records every `on()` registration with its name, and the assertion counts
  the captured set.

## Expected ledger strings (byte-exact)

None, because the folder asserts the listener SET and not ledger lines.

## Edge cases

- Exactly two listeners exist by default, so the count assertion is the negative control against an
  accidental extra registration such as an agent/pre-step leak from the engine path.

## Expected count

1 PASS.
