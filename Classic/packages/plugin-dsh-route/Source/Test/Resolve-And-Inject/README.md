# Resolve-And-Inject - the policy resolution, the correction and the escalation

This folder covers the deterministic Resolve (kept / corrected / resolved / escalated), the keyword classification order, the attempts ladder, the silent injection on the launch path with its byte-exact ledger line, the volatile policy flip, and the purity of the resolver.

## Scenarios

- P1: the omission resolves the default role; a declared task type selects
  the role row; a keyword hit infers it; the planner keywords win over later
  ones (documented order); a complete policy-legal route is kept with its
  audit trail; a complete but illegal route is corrected with the passed
  route preserved; a partial route is resolved; the escalation flag selects
  the planner rung.
- P2: Classify maps the documented keywords; Escalate follows the attempts
  ladder (at most one rung).
- P3: with escalation disabled the flag falls through and the ladder is
  closed.
- P4: the silent injection on the launch path - the resolved route written
  in place into agentOptions (and the top-level spelling), next() awaited
  first, the decision returned unchanged, no warnings; a corrected and a
  kept route; a non-subagent tool passes through untouched and unlogged.
- P5: a policy hot-edit (the volatile cell + loader/volatile-update) lands
  on the next launch without a remount.
- P6: the same request and policy always produce the same route (pure).

## Expected ledger strings (byte-exact, `plugin-dsh-route: ` prefix)

`route coder resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`,
`route coder corrected cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`,
`route coder kept cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`,
`route explorer resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash low`.

## Expected count

18 PASS.
