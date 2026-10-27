# Resolve-And-Inject - the policy resolution, the correction and the escalation

The suite covers the deterministic Resolve (kept / corrected / resolved / escalated), the keyword classification order, the attempts ladder, the silent injection on the launch path with its byte-exact ledger line, the volatile policy flip, and the purity of the resolver.

## Scenarios

- **P1.**

    The omission resolves the default role, a declared task type selects the role row, a keyword hit infers the role, and the planner keywords win over later ones (documented order).

    A complete policy-legal route is kept with its audit trail, a complete but illegal route is corrected with the passed route preserved, a partial route is resolved, and the escalation flag selects the planner rung.

- **P2.**

    Classify maps the documented keywords, and Escalate follows the attempts ladder (at most one rung).

- **P3.**

    With escalation disabled, the flag falls through and the ladder is closed.

- **P4.**

    The silent injection on the launch path writes the resolved route in place into agentOptions (and the top-level spelling), awaits next() first, returns the decision unchanged, and gives no warnings.

    A corrected route and a kept route both inject, and a non-subagent tool passes through untouched and unlogged.

- **P5.**

    A policy hot-edit (the volatile cell + loader/volatile-update) lands on the next launch without a remount.

- **P6.**

    The same request and policy always produce the same route (pure).

## Expected ledger strings (byte-exact, `plugin-dsh-route: ` prefix)

`route coder resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`,
`route coder corrected cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`,
`route coder kept cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`,
`route explorer resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash low`.

## Expected count

18 PASS.
