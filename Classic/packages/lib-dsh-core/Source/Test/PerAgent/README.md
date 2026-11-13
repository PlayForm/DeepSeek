# PerAgent

This test verifies the following behavior.

## Intent

`PerAgent` is the per-agent registry every agent-keyed hook shares: one state object per agent, born on first use by the caller's own factory, collected with the agent, and one shared default key for a call that carries no agent.

It is its own folder because the lifetime rule is a contract shared by the agent-keyed hooks, where a strong holder silently keeps every agent alive for the session.

## Scenario

- Group: PerAgent - the per-agent registry (one state per key, lazy, default key).
    - Check (one ok group): the four rules.
        - Leaf: the same key returns the same state.
        - Leaf: distinct keys hold distinct states.
        - Leaf: every no-agent call shares one default state.
        - Leaf: the factory runs once per distinct key, and two registries are independent.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

None. The registry writes no line.

## Edge cases

- A `undefined` or `null` key shares the one default state, so the no-agent path still works.
- The holder is a WeakMap, so no caller can iterate or clear the entries.

## Expected count

1 PASS.
