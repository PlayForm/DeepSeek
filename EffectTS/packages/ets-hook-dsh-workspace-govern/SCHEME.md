# SCHEME - @playform/hook-dsh-workspace-govern

The governance gate of the invisible flow of the workspace family.

## Position in the flow

```
observe stamps → semantics resolve → operate proposes → GOVERN GATES →
authority licenses → approve binds → merge → journal → audit → live
```

The gate is the enforcement boundary: the proposals become the effects ONLY through the gates.

The conversation never sees the gate until an outcome surfaces one.

## The means-check law (binding)

AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS.

The gate runs the independent checks (contributes + authorized scope + policy + preconditions) on
the ProposedChange BEFORE the AuthorizationDecision downstream.

The gate carries no intent of its own and reads no authority record, because the licensing is the
next step (`plugin-dsh-workspace-authority`), not this one.

## The fail-open recovery table

| Obligation      | Default behavior | Rationale                                                   |
| --------------- | ---------------- | ----------------------------------------------------------- |
| `contributes`   | fail-open        | a broken means-check must not block the workspace           |
| `scope`         | fail-closed      | the boundary itself never becomes unguarded                 |
| `policy`        | fail-open        | the gate never blocks on its own config                     |
| `preconditions` | fail-open        | an explicitly false precondition denies; unevaluable passes |

The behavior is configurable per row via the `recovery` config field.

## The policy block (D6) - the `automation` key

The config carries the shared per-action allowlist (`automation: Policy()`, composed from the block
of the factory), mapped to `State.Allow`.

The key is `automation`, **not** `policy`, because `policy` is already the decision rule table of
this hook (a different contract, the `plugin-dsh-route` precedent):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The action class of the hook is RECORD, which is **automatic**: it records a gate decision and
nothing else.

The package has **NO gated action** (no file write, no batch commit, no spawn), so the block
documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and the
`policy` section of a resolved pack overrides the defaults per action (the wiring is the next
refinement).

No new ledger line exists, because the package has no gated action.

## Records

- **Proposal** (`Source/Interface/Proposal.ts`).

    It is the ProposedChange of the operate family, self-contained: `operation`, `parent`,
    `category` (the recursion-prevention trio), `kind`, `target`, `contribution`, `scope`,
    `preconditions`, `holder`, `declared`.

- **Decision** (`Source/Interface/Decision.ts`).

    It holds `decision` (pass / deny / escalate), `reason`, the per-obligation outcomes, and
    `operation`.

- **PolicyRule / RecoveryRule** (`Source/Interface/{Policy,Recovery}.ts`).

    These are the two config-driven tables.

## The gate in the waterfall

`tools/pre-execute` runs next() first with a fail-open envelope: pass → unchanged; deny →
`{ kind: "deny", reason }`; escalate → `{ kind: "ask", reason }`.

`tools/post-execute` records the observed outcome of a gated call.

Excluded targets (`exclude` globs) are never gated, in silence, and the own activity of the hook
(the `Self` marker) is never gated.

## The license/weight separation

This hook holds no weights and no priorities: the gate decides pass / deny / escalate only.

The scheduling weights and the residency dispositions live in the authority service
(`plugin-dsh-workspace-authority`), because the license is the authority and the weight is the
representation (the logged pitfall).
