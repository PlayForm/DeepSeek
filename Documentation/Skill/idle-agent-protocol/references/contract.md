# The Idle Contract

The idle contract exists so that a lane can be launched long before its slot opens without drifting
into preparation.

It rests on a simple exchange: the parent gives the lane a complete spec, the lane retains the spec
without acting, and the parent later sends an explicit activation that tells the lane the tree has
moved and the slot is open.

## Retain, do not prepare

The spec is the lane's only authority.

Retaining means holding it verbatim: the scope, the surface, the exclusions, the arbiter, the
acceptance check, and the current-state block.

"Do not prepare" is part of the contract and not an optional courtesy.

Reading files, sketching a plan, or checking the tree before activation means working against a
state that may change before the lane's slot opens.

The lane would then execute a plan built on stale facts, which is exactly what the idle queue exists
to prevent.

## No acknowledgment

An idle lane does no work and ends its turn, and it does not produce a status line, because the
acknowledgment is not work and the parent does not need a line to know that the lane waits.

Activation is explicit, so the parent sends `ACTIVATE` with the current-state block and the lane
starts.

A pause message stops the work:

```text
RE-PAUSE - the feedback delivery: STOP all work NOW
```

The lane does no work while it is paused and executes again only when it is activated.

## Amendments

An amendment overrides the base spec where the two conflict.

The lane retains the rest.

An amendment never authorizes work before activation; it changes what will be executed.

An amendment that arrives while the lane is working is applied only when it is compatible with the
work already done.

Otherwise the lane flags the incompatibility and waits for the parent's decision.

It does not improvise a merge.

## What idle is not

- It is not a paused build. No process is running, and there is nothing to resume.
- It is not a queue of acknowledgments. There is no acknowledgment, and the state is "no work yet".
- It is not a license to investigate "just a little". Any read before activation is a violation.

## Failure modes

- **Pre-work**: the lane reads and plans before activation; the plan is stale by the time the slot
  opens.
- **Invented status**: the lane spends its idle turn producing a line instead of doing nothing,
  which is the one thing that the idle turn is supposed to contain.
- **Silent amendment merge**: the lane combines an incompatible amendment with in-flight work; the
  report cannot be attributed to either spec.
