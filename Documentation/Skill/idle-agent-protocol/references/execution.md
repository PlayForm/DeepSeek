# Execution, Verification, and the Result

When the activation arrives, the lane stops being an idle holder of a spec and becomes a worker with
a slot.

This document covers the short window between the activation and the result.

## Activation

The activation message carries:

- `ACTIVATE`;
- the current-state block (the tree state, the other lanes, the counts);
- any amendment that landed since the spec was retained.

The current-state block is part of the spec.

Read it before touching the tree, because the tree may have moved while the lane was idle and the
activation is the only view of the tree at the moment the lane starts.

## The pre-work check

```sh
git status --short
git log --oneline -5
git -C Site status --short # when the site is in scope
```

The tree may carry the user's mid-session commits or another lane's edits.

Do not clean up what you did not create; read before edit.

An edit that assumes a clean tree will overwrite work that arrived while the lane was idle.

## Execute the spec

The spec's scope, exclusions, sequence, and acceptance check are constraints, not suggestions.

When the spec says "if X exists, verify and adjust", verify first and adjust minimally.

When the spec is silent on a detail, choose the reading that preserves the spec's intent and state
the assumption in the result.

Do not widen the scope to include work that seems related: the related work belongs to another lane
or to a later dispatch, and widening the scope is how a lane loses its spec boundary.

## Flag, do not silently fix

Raise these to the parent instead of resolving them alone:

- a contradiction with the shared facts (a count, a version, a ledger string);
- a stale claim in a document you were asked to trust;
- a file that another lane owns or has already modified;
- a spec item that cannot be satisfied as written.

A silent fix hides a decision the parent needed to make, and the hidden decision is worse than the
conflict because it enters the record as if the parent had approved it.

## Verify

Run the arbiter the spec names and report its printed result:

- code: the bundle's smoke suite (`smoke-writing`);
- site: `cd Site && pnpm prepublishOnly`, then grep the built output;
- docs: re-read the changed span.

A report without the printed result has not verified anything: the sentence that says the work is
done is not the same thing as the verifier that proves it.

## The result

```text
<NAME> - <task> - <DONE | PARTIAL | BLOCKED>

Items:
1. <item> - <before> -> <after> (<file>:<line>)
2. ...

Arbiter:
<the exact command> -> <the printed result>

Flags:
- <conflict or decision needed>

READY-TO-COMMIT (or the commit hash)
Files:
  <list>
Suggested message:
  <message>
```

The result is the lane's whole output.

The parent relays it; the user decides what happens next, which is why the result must carry the
evidence rather than a summary of the evidence.

## Failure modes

- **Skipping the pre-work check**: overwriting another lane's edit.
- **Silent fixes**: decisions made where the parent needed to decide.
- **Prose verification**: "tests pass" without the printed total.
- **A report without anchors**: the parent cannot locate the change.
