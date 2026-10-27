# Volatile-Refresh

What this test verifies.

## Intent

The P10 `loader/volatile-update` refresh listener of the State builder as the ccr State carries it.

Exactly two listeners exist after a default apply (tools/post-execute plus the P10 refresh of the
State builder), so a config change committed to the running plugin reaches the State without a
remount.

It is its own folder because the refresh dispatch is the hazardous path: a rebuild would re-apply
and duplicate the registrations.

## Scope note (what this folder does NOT assert)

The source suite asserts the PRESENCE of the listener here and nothing more.

The dispatch BEHAVIOR (the in-place field updates on the key-array, dotted and nested-object paths,
the identity preservation, the unknown/failed path safety, the shared `log` -> Enabled mapping) is
the SHARED machinery of the factory, and `Factory.State` registers the listener.

That behavior is exercised byte-verbatim by the Entry-And-State folder of the factory package (its
P10 volatile-refresh section).

This folder holds the ccr-side registration assertion from the source suite's Run 1, moved verbatim,
and no assertion was invented here.

The engine flag ON adds agent/pre-step as a third listener, and that posture belongs to the
Engine-Flag-On folder.

## Scenario

- Group: Run 1 - the State builder's P10 refresh listener on the ccr State.
    - Check: "tools/post-execute plus the State builder's P10
      loader/volatile-update refresh".

## Fixtures

- The Harness fake ctx + the REAL factory + the REAL ccr apply, with `Raw1 = Validate({ logFile: Ledger })` and `Run1 = Make(Raw1)`.
- The `Listeners` capture records every `on()` registration with its name, and the assertion counts the captured set.

## Expected ledger strings (byte-exact)

None, because the folder asserts the listener SET and not ledger lines.

## Edge cases

- Exactly two listeners by default, and the count assertion is the negative control against an accidental extra registration (for example an agent/pre-step leak from the engine path).

## Expected count

1 PASS.
