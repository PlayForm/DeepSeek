# Ownership and Governance

## The factory owns the machinery

The factory (`plugin-dsh-factory`) is the family's first service. It
exposes `ctx.pluginFactory` with 19 callable methods:

| Area             | Methods                                              |
| ---------------- | ---------------------------------------------------- |
| Ledger           | `Append`                                             |
| Exclusion        | `Match`                                              |
| Registry         | `Discover`, `Parse`                                  |
| Keep-list        | `ResolvePolicy`                                      |
| Gate             | `Gate`                                               |
| Writes           | `Write`, `GuardedWrite` (fresh-stat guard, fence, stash) |
| Re-emit          | `Refresh`                                            |
| Continuation     | `Continue` (detached, contained)                     |
| State            | the State builder                                    |
| Wiring           | `Wire`                                               |
| Registrations    | `Attach` (jobs, inflight, storage)                   |
| Journal          | `Journal`                                            |
| Schema           | `Schema`                                             |
| Seam             | `Seam`                                               |
| Inflight         | `UpdateKey`                                          |
| Direct govern    | `RegisterGovern`, `Govern` (the sequential fold)     |

The factory owns behavior that must be identical across modules: the
version guard, the fence, the stash, the root emit, the ledger append, the
gate, the continuation.

## The modules own their leaves

The modules are never absorbed into the factory. Each module owns:

- its transform or update engine;
- its update gates and breaker maps;
- its ledger strings;
- its config extensions and its docs.

The rule exists because a module's observable behavior is its contract.
Moving the wording or the transform into the factory would make every
module's output change whenever the shared machinery changed, and would
make the per-module smoke unable to enforce it.

## Governance steps

A governance module registers its steps at apply. The steps run through
the direct fold:

- sequential by default: one step's chain completes before the next step
  reads the file;
- a parallel marker is allowed only with proven disjointness of the files
  the steps touch.

## The direct-govern channel

The direct path is the `raw-write` tool's only governance channel:

1. The actor carries the `govern` marker.
2. The gate's `govern` reason skips the marked events.
3. An absent or false marker is the escape hatch: no chain.

Marked events are skipped, not blocked: they are governance's own
emissions, and re-governing them would deadlock the fold.

## The escape hatch is documented

An absent or false marker means no chain. That is intended for mechanical
writes that must not trigger the fold. It is named here so it stays a
choice, not an accident.

## Failure modes

- **Marker omission by accident**: a write intended to be governed ships
  ungoverned; no error, just skipped governance.
- **Marker cargo-culting**: `govern: true` on mechanical writes; the fold
  reacts to its own infrastructure.
- **A second channel**: a special-case write path that skips the gate;
  unattributed mutations with no version guard.
- **Absorbing a leaf**: the module's behavior moves into the factory; the
  per-module smoke loses its subject.
