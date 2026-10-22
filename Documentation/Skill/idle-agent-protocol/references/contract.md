# The Idle Contract

## Retain, do not prepare

The spec is the lane's only authority. Retaining means holding it verbatim: the scope, the surface,
the exclusions, the arbiter, the report format, and the current-state block.

"Do not prepare" is part of the contract. Reading files, sketching a plan, or checking the tree
before activation means working against a state that may change before the lane's slot opens. The
lane would then execute a plan built on stale facts, which is exactly what the idle queue exists to
prevent.

## The exact lines

Idle launch:

```text
<NAME> SPEC RETAINED - IDLE
```

Amendment while idle:

```text
<NAME> SPEC AMENDED - IDLE
```

Pause on feedback (from the parent):

```text
RE-PAUSE - the feedback delivery: STOP all work NOW
```

The lane answers `"<NAME> PAUSED - IDLE"` with the amendment attached.

The exact strings matter: the parent greps for them to know the lane's state without reading the
lane's reasoning.

## Amendments

An amendment overrides the base spec where the two conflict. The lane retains the rest. An amendment
never authorizes work before activation; it changes what will be executed.

An amendment that arrives while the lane is working is applied only when it is compatible with the
work already done. Otherwise the lane flags the incompatibility and waits for the parent's decision.
It does not improvise a merge.

## What idle is not

- It is not a paused build. No process is running.
- It is not a queue of acknowledgments. The ACK is the state, not the work.
- It is not a licence to investigate "just a little". Any read before activation is a violation.

## Failure modes

- **Pre-work**: the lane reads and plans before activation; the plan is stale by the time the slot
  opens.
- **Ack-as-work**: the lane acknowledges an amendment and stops; the queue looks scheduled but
  nothing executes.
- **Silent amendment merge**: the lane combines an incompatible amendment with in-flight work; the
  report cannot be attributed to either spec.
- **Wrong line**: the lane confirms with its own wording; the parent cannot tell the state.
