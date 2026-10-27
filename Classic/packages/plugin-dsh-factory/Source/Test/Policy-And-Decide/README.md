# Policy-And-Decide

This folder covers the shared policy block (D6): the `Policy` schema-block builder and the `Decide`
verdict lookup, the two module-level named exports beside `Schema`.

## Intent

D6 makes automation a per-plugin allowlist, where every plugin declares the action classes it can
take and, for each one, whether it runs automatically or waits for approval.

This folder is the arbiter of that shared surface: the eight keys of the block and their defaults,
the real validation of the schema, the composed use inside a `Config` of a consumer, and the lookup
that every gated action calls before it acts.

## Scenario

- Group: the block's shape and defaults.
    - Check: "Policy: the eight action classes in the D6 order with the D6
      defaults" - the dict keys are [read, index, record, suggest, write,
      commit, spawn, message]; the validated block deep-equals the D6
      defaults (read/index/record/suggest/message = auto, write/commit/spawn =
      approve); the block is a volatile cell.
- Group: the schema's real validation.
    - Check: "Policy: an explicit override replaces one action and keeps the
      rest" - a partial override merges over the defaults, and every action is
      independently overridable.
    - Check: "Policy: an unknown verdict fails loud at validation" - the enum
      rejects a value that is neither auto nor approve.
- Group: the composed use (the consumers' `policy: Policy()`).
    - Check: "Policy: composed into a consumer schema as ONE volatile cell" -
      the composed field is a cell carrying the defaults, accepts a partial
      override, and rejects an unknown verdict.
- Group: the `Decide` lookup.
    - Check: "Decide: the action names ARE the keys - every D6 verdict
      resolves" - the eight action names answer their defaults.
    - Check: "Decide: an override flips exactly its action" - one overridden
      action changes and its neighbors keep the default.
    - Check: "Decide: a missing or malformed key takes that action's D6
      default" - a partial block decides honestly, so a missing commit gives
      approve and a missing read gives auto; a malformed write never widens to
      auto and a malformed read falls back to automatic.
- Group: the entry's export surface.
    - Check: "Library: Policy and Decide are module-level functions beside
      Schema" - both named exports exist next to the unchanged `Schema`.

## Fixtures

The fixtures are the REAL built `Target/Library.js` entry with `Policy`, `Decide`, `Schema`, and
the `Allowlist` type, because a missing type export fails the test build.

No fake ctx exists here, because both helpers are module-level and never read a service.

## Expected ledger strings (byte-exact)

None, because the block and the lookup log nothing.

The defaults are the contract, and the checks assert them as an object and not as ledger text.

## Expected count

8 PASS.
