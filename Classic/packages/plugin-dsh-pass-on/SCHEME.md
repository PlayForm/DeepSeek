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

## 3a. The publication (the real batch-contract wiring)

A prepared proposal is CONVERTED to the canonical batch contract (Function/Batch -
Interface/Batch.ts) and published two ways:

1. `batch/proposed` on the bus (structural emit - the decision hook records it and the ingester
   holds it);
2. the harness agent-team inbox: `agent.inject(message)` on the origin agent
   (`packages/core/agent/src/runtime-types.ts:241` - the read-only pre-step context splice that
   commits the durable `agent/inbox/spliced` event), carrying

    ```
    [BATCH PROPOSAL - <id>]
    <the canonical proposal JSON>
    ```

The origin is the caller's explicit argument, else the harness initiator
(`packages/core/agent/src/index.ts:297`), else `""` (no return address). The conversion maps the
intent OBJECT to the intent LABEL, adds `kind` to the operations beside the literal find/replace,
and turns the preview array into `{ entries, changes, skipped }`.

## 4. The service surface

- `Prepare(intent, origin?)` - the pipeline above + the `prepared` journal line
  (`{ at, event: "prepared", proposal, digest, targets, note }`), then the publication + the
  `delivered` journal line
  (`{ at, event: "delivered", proposal, digest, targets, note: "inbox <agent|none>" }`).
- `Get(id)` - the stored proposal, or `null` when unknown/expired.

## 5. The write-trust boundary

The pass-on performs zero writes to target files. The only disk writes are its own ledger lines. The
ingester is the batch's only writer (plan section 9, risk 2).

## 5a. The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call; the validated shape is `State.Config.policy` (the class form has no factory
State mapping):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The pass-on is READ-ONLY: it reads and proposes (`read`/`suggest`, both automatic) and never writes,
commits or spawns - those verdicts are declared for uniformity with the family's block and stay the
shipped `approve`. A resolved pack's `policy` section overrides the defaults per action (the wiring
is the next refinement; the type already exists in `@playform/lib-dsh-pack`). The defaults are
smoke-arbitrated in `Source/Test/Policy-Defaults`.

## 6. The relation to the other members

- The search suggester supplies the intent (end-phase wiring).
- The decision (hook-dsh-batch-decision) consumes the proposal on the bus and emits the
  BatchDecision.
- The board (plugin-dsh-batchstate) splices the proposal from the inbox.
- The ingester consumes the proposal + decision and applies per target.
