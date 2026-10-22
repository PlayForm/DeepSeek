# SCHEME - @playform/plugin-dsh-pass-on

The PASS-ON: the prepare direction of the batch flow. Service `passOn` on the context. READ-ONLY -
it never writes a target file.

## 1. The input

`Intent` (Interface/Intent.ts): `{ kind, targets?, params? }`. The kind names a row of the
configured kind table; the params carry the kind's arguments.

## 2. The pipeline (Function/Prepare)

1. **Resolve** (Function/Resolve) - the intent's explicit targets (validated to exist under the
   root), else the kind's default globs walked from the root (bounded: `maxTargets`, depth cap 8,
   `node_modules`/`.git`/`Target`/ `dist` pruned).
2. **Operate** (Function/Operate) - the deterministic transform per target, per kind: `version-bump`
   rewrites the `"version"` field, `set-field` rewrites a named string field, `replace` applies a
   literal find/replace. Declarative: find/replace strings, never executed here. A target with no
   effective change is skipped (recorded in the journal, not silently).
3. **Preview** (Function/Preview) - the matched region ±80 chars, before and after, capped at
   `maxPreviewBytes` per entry. The diff, not the files.
4. **Digest** (Function/Digest) - sha256 over `{ targets, operations }`; the proposal id is its
   first 12 hex chars. The version token per target is the sha256 of the file's content at prepare
   time (the fence).

## 3. The output

`Proposal` (Interface/Proposal.ts) stored in the state map and returned. `null` when the proposal
would be empty or ambiguous - the abstention rule.

## 4. The service surface

- `Prepare(intent)` - the pipeline above + a journal line
  (`{ at, event: "prepared", proposal, digest, targets, note }`).
- `Get(id)` - the stored proposal, or `null` when unknown/expired.

## 5. The write-trust boundary

The pass-on performs zero writes to target files. The only disk writes are its own ledger lines. The
ingester is the batch's only writer (plan section 9, risk 2).

## 6. The relation to the other members

- The search suggester supplies the intent (end-phase wiring).
- The decision (hook-dsh-batch-decision) consumes the proposal and emits the BatchDecision.
- The ingester consumes the proposal + decision and applies per target.
