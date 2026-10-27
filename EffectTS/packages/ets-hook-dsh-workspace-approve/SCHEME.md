# SCHEME.md - @playform/hook-dsh-workspace-approve (v0.1.0, TypeScript, function plugin)

Status: **PoC** (the Classic tree, package + Source only; the smoke suite, the build verification
and the ETS twin are the end-phase per the PoC brief).

## 0. What this plugin is

The approval binder: the EXACT human approval - the candidate-bound approval + the constraints. It
is the approve step of the workspace family's invisible flow
(`... -> the authority licenses -> the approve binds -> the merge commits -> ...`). Source of truth:
`Documentation/Plans/Workspace-Family/APPROVE.md`, typed by
`Documentation/Plans/Workspace-Family/INVERSE-REPRESENTATION.md` (the Commitment, the
AuthorizationDecision, the intent model).

## 1. The data model

```ts
interface Candidate {
	path;
	fingerprint;
	version;
	constraints;
	summary;
}
interface Binding {
	id;
	path;
	fingerprint;
	version;
	constraints;
	summary;
	decision: "pending" | "approved" | "denied" | "rejected" | "revoked" | "invalidated";
	committedBy;
	sequence;
}
interface CheckRequest {
	path;
	fingerprint;
	version;
}
interface CheckResult {
	bound;
	decision;
	id;
	reason;
}
```

An approval binds the EXACT candidate: path + content fingerprint + the file version observed at the
approval. The constraints travel with the approval. The decision is the Commitment; the check
derives the AuthorizationDecision.

## 2. The state machine

```
pending -> approved -> revoked
pending -> denied
pending -> rejected            (constraints changed, or identity incomplete)
pending/approved -> invalidated (the file's observed version moved)
```

## 3. The check guard chain (in order)

1. **The unbound path.**

    No binding for the path + fingerprint gives `unbound`.

2. **The unapproved binding.**

    A binding that is not approved gives its own decision.

3. **The stale version.**

    An approved binding with a different version gives `stale` (the candidate changed after the
    approval; the intent must not authorize its own means).

4. **The fallback.**

    Otherwise the result is `approved`.

## 4. The listeners and effects

- `fs/observed` on the ROOT context (the factory's Wire): invalidates bindings whose file moved
  under the approval; synchronous recorder; own-actor ignored.
- The P5-style storage effect: opens the `workspace_approve` domain (tables `bindings` per id +
  `ring` meta `__ring`), recovers the by-id map, the ring and the monotonic sequence (max loaded),
  closes on dispose; absent facility = silent skip, failed open = one loud ledger line.

## 5. The identity (four agreeing places)

- package name: `@playform/hook-dsh-workspace-approve`;
- `name` export: `hook-dsh-workspace-approve`;
- the State build's `module:` option: `approve` (the ledger prefix);
- the ledger logFile default: `~/.dsh/playform/ets-hook-dsh-workspace-approve.log`.

## 6. The ledger strings (module-owned, byte-stable)

```text
approve: activated (domain=<domain>)
approve: disabled (enabled=false)
approve: bound <id> <path> fingerprint <fingerprint>
approve: decided <id> approved by <who>
approve: decided <id> denied by <who>
approve: revoked <id> by <who>
approve: rejected <id> (constraints changed)
approve: rejected <path> (<reason>)
approve: refused <id> (<action> on <decision>)
approve: unknown <id>
approve: invalidated <id> (version changed)
approve: checked <path> (<decision>)
approve: capped <id> (maxBindings <n>)
approve: failed <path> (<reason>)
approve: storage open failed: <reason>
```

## 7. The Config (all volatile)

| Field              | Type        | Default                                              |
| ------------------ | ----------- | ---------------------------------------------------- |
| logFile            | string      | `~/.dsh/playform/ets-hook-dsh-workspace-approve.log` |
| log                | boolean     | true (the factory's shared block)                    |
| enabled            | boolean     | false                                                |
| domain             | string      | `workspace_approve`                                  |
| maxBindings        | number      | 1000                                                 |
| requireConstraints | boolean     | true                                                 |
| policy             | `Allowlist` | the D6 defaults (see below)                          |

## 8. What this PoC does NOT do (honest)

- No smoke suite (the end-phase adds it per the PoC brief).
- No UI surface: the human decision arrives through the service methods; the wiring of a decision
  surface is a later slice.
- The candidate fingerprint is computed by the caller; the approve hook binds and checks, it never
  hashes content.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This package's actions are record, all AUTOMATIC; it has NO gated action (no file write, no batch
commit, no spawn), so the block documents the posture and refuses nothing. The block is one volatile
object, so a policy flip is hot-editable without a remount; a resolved pack's `policy` section
overrides the defaults per action (the wiring is the next refinement).

No new ledger line: the package has no gated action.
