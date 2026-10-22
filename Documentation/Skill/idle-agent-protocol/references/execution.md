# Execution, Verification, and the Report

## Activation

The activation message carries:

- `ACTIVATE`;
- the current-state block (the tree state, the other lanes, the counts);
- any amendment that landed since the spec was retained.

The current-state block is part of the spec. Read it before touching the tree.

## The pre-work check

```sh
git status --short
git log --oneline -5
git -C Site status --short # when the site is in scope
```

The tree may carry the user's mid-session commits or another lane's edits. Do not clean up what you
did not create; read before edit.

## Execute exactly

The spec's scope, exclusions, sequence, and report format are constraints, not suggestions. When the
spec says "if X exists, verify and adjust", verify first and adjust minimally. When the spec is
silent on a detail, choose the reading that preserves the spec's intent and state the assumption in
the report.

## Flag, do not silently fix

Raise these to the parent instead of resolving them alone:

- a contradiction with the shared facts (a count, a version, a ledger string);
- a stale claim in a document you were asked to trust;
- a file that another lane owns or has already modified;
- a spec item that cannot be satisfied as written.

A silent fix hides a decision the parent needed to make.

## Verify

Run the arbiter the spec names and report its printed result:

- code: the bundle's smoke suite (`smoke-writing`);
- site: `cd Site && pnpm prepublishOnly`, then grep the built output;
- docs: re-read the changed span.

A report without the printed result has not verified anything.

## The report format

```text
<NAME> - <task> - <DONE | PARTIAL | BLOCKED>

Items:
1. <item> - <before> -> <after> (<file>:<line>)
2. ...

Arbiter:
<the exact command> -> <the printed result>

Flags:
- <conflict or decision needed>

READY-TO-COMMIT
Files:
  <list>
Suggested message:
  <message>
```

The report is the lane's whole output. The parent relays it; the user decides.

## Failure modes

- **Skipping the pre-work check**: overwriting another lane's edit.
- **Silent fixes**: decisions made where the parent needed to decide.
- **Prose verification**: "tests pass" without the printed total.
- **A report without anchors**: the parent cannot locate the change.
