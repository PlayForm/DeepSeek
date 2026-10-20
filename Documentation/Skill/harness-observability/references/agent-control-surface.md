# The Agent-Control Surface

> Source: SKILL.md, section 2, "The agent-control surface". Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The agent sees and steers its own delegation tree through five tools. The
tree is the model: every child is observable (status, position, lineage),
every direct child is steerable (message), every child is stoppable
(interrupt), and new children come from two delegation gates (subagent /
subagent_fork) or a script (workflow).

1. **list_agents** - the subagent tree with per-agent status. Scope
   "children" lists direct children (they accept send_message in any
   status); scope "descendants" lists the whole tree below with each entry's
   parent session id and depth (entries deeper than 1 accept only
   interrupt_agent). "running" means the agent is working; "inactive" means
   it is not currently working.
2. **send_message** - the continuation channel for a direct child. A working
   agent receives the message at its next step; an idle agent starts a new
   turn with it. The call returns a delivery confirmation, NOT the agent's
   answer. Canonical uses: activate an IDLE agent, amend a spec mid-flight,
   nudge a stalled agent.
3. **interrupt_agent** - ask a child to stop its current work. The call
   returns without waiting for it to stop. An external execution stops
   permanently and cannot receive follow-ups; subagents the child started
   keep running. Assess the tree state for partial edits FIRST.
4. **subagent / subagent_fork** - the two delegation gates. subagent runs a
   self-contained task in a separate context: the child sees only its
   prompt, and the parent receives the child's result, not its intermediate
   steps. subagent_fork seeds the child with this conversation's completed
   turns, for work that builds on shared context without consuming this
   conversation's budget.
5. **workflow** - orchestrate many agents from a script: phases, pipelines
   (per-item stages with no barrier), parallel thunks, schema-validated
   results. For genuine fan-out or an explicit user request; one or two
   delegations go through the plain subagent calls.

## Why: The Full Philosophy

1. **Observability makes the tree steerable.** A delegation the agent cannot
   see is a delegation it cannot correct: no status, no lineage, no way to
   know whether the child finished, stalled, or died. list_agents is what
   turns "I delegated something once" into a managed tree.
2. **Continuation is cheaper than termination.** send_message preserves the
   child's accumulated context; interrupt_agent destroys the child's current
   step and, for external executions, the child itself. Prefer a precise
   follow-up message over a restart whenever the child's state is still
   useful.
3. **Interrupt needs an assessment first.** A child mid-edit leaves a
   half-written file when interrupted. Check what it was doing (status, then
   the files it touched) before interrupting; the instruction "assess the
   tree state for partial edits first" exists because the stop itself gives
   no chance to clean up.
4. **Isolation is the point of subagent.** The child's context stays clean,
   the parent's stays unbloated, and the result arrives as data. That is
   also its limit: the child knows nothing except its prompt, so a
   self-contained prompt (paths, constraints, output contract) is the price
   of admission.
5. **Fork when context, subagent when cleanliness.** subagent_fork trades
   cleanliness for continuity - the child inherits the completed
   conversation. Use it for follow-up analyses and continuations; use plain
   subagent for independent work.
6. **Workflow is for scale, not for two calls.** Its overhead pays only when
   work genuinely fans out across many independent pieces.

## Examples

### Good

- A child went quiet mid-implementation: list_agents (status inactive), read
  the files it touched, then send_message with the precise remaining work.
- A long audit: one subagent per independent file set, each prompt fully
  self-contained (paths, discipline, report format).
- A stalled child that misunderstood one parameter: send_message the
  correction instead of interrupting and re-delegating from zero.

### Bad

- interrupt_agent on a child that is mid-edit without checking what it had
  already written - the file ends up half-written.
- Treating send_message's delivery confirmation as the child's answer - the
  answer arrives later, as the child's own message.
- workflow for a two-delegation job - orchestration overhead with no
  fan-out to amortize it.

## Exceptions

- Deeper-than-1 descendants accept only interrupt_agent - steering them
  directly is not part of the surface; steer through their parent.
- External executions stop permanently on interrupt and cannot receive
  follow-ups; only agent children can be continued with send_message.
- A finished child is inactive, not gone: send_message starts a new turn for
  it.

## Failure Modes

- Busy-polling list_agents instead of waiting for the finish notification:
  wasted turns; the runtime notifies when a subagent finishes.
- Interrupting without assessing partial edits: half-written files the next
  step then trusts.
- Re-delegating from scratch when a message would have fixed the child's
  course: the child's context is thrown away for no reason.
- Writing self-contained prompts that are not self-contained: the child
  guesses, and its guesses become facts in its report.

## Arbiters

- list_agents is the arbiter of tree state: every claim about a child's
  status, id, or lineage comes from it, not from memory.
- The runtime's finish notification is the arbiter of completion; the
  child's own report is the arbiter of its result.
