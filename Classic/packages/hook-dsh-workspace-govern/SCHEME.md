# SCHEME - @playform/hook-dsh-workspace-govern

The governance gate of the workspace family's invisible flow.

## Position in the flow

```
observe stamps → semantics resolve → operate proposes → GOVERN GATES →
authority licenses → approve binds → merge → journal → audit → live
```

The gate is the enforcement boundary: the proposals become the effects ONLY
through the gates. The conversation never sees the gate until an outcome
surfaces one.

## The means-check law (binding)

AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS. The gate runs the independent
checks (contributes + authorized scope + policy + preconditions) on the
ProposedChange BEFORE the AuthorizationDecision downstream. The gate carries no
intent of its own and reads no authority record: the licensing is the next
step (`plugin-dsh-workspace-authority`), not this one.

## The fail-open recovery table

| Obligation      | Default behavior | Rationale                                              |
| --------------- | ---------------- | ------------------------------------------------------ |
| `contributes`   | fail-open        | a broken means-check must not block the workspace      |
| `scope`         | fail-closed      | the boundary itself never becomes unguarded            |
| `policy`        | fail-open        | the gate never blocks on its own config                |
| `preconditions` | fail-open        | an explicitly false precondition denies; unevaluable passes |

Configurable per row via the `recovery` config field.

## Records

- **Proposal** (`Source/Interface/Proposal.ts`): the operate family's
  ProposedChange, self-contained - `operation`, `parent`, `category` (the
  recursion-prevention trio), `kind`, `target`, `contribution`, `scope`,
  `preconditions`, `holder`, `declared`.
- **Decision** (`Source/Interface/Decision.ts`): `decision` (pass / deny /
  escalate), `reason`, per-obligation outcomes, `operation`.
- **PolicyRule / RecoveryRule** (`Source/Interface/{Policy,Recovery}.ts`): the
  two config-driven tables.

## The gate in the waterfall

`tools/pre-execute`, next() first, fail-open envelope: pass → unchanged;
deny → `{ kind: "deny", reason }`; escalate → `{ kind: "ask", reason }`.
`tools/post-execute` records the observed outcome of a gated call. Excluded
targets (`exclude` globs) are never gated, in silence. The hook's own activity
(the `Self` marker) is never gated.

## The license/weight separation

This hook holds no weights and no priorities: the gate decides pass / deny /
escalate only. The scheduling weights and the residency dispositions live in
the authority service (`plugin-dsh-workspace-authority`) - the license is the
authority, the weight is the representation (the logged pitfall).
