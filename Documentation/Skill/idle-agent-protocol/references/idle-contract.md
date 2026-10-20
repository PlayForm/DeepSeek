# The Idle Contract (Retain, Wait, Confirm)

> Source: SKILL.md, "The contract (while IDLE)", bullets 1-3. Skill: idle-agent-protocol.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

An agent launched with a "STATUS: PAUSED - you are being launched to RETAIN the following spec" instruction is under a three-part contract that lasts until the parent's activation message arrives:

1. **RETAIN the full spec in your context - verbatim.** The spec text is your only authority. The parent's later activation message may amend it; where an amendment conflicts with the base spec, the amendment overrides.
2. **DO NO WORK.** No file operations, no reads, no builds, no git commands - no tool calls at all. The idle phase produces exactly one artifact: the confirmation line.
3. **REPLY with exactly one line.** On launch: "<NAME> SPEC RETAINED - IDLE". When the parent sends an amendment: "<NAME> SPEC AMENDED - IDLE" is the acknowledgment. Nothing else in the reply.

<NAME> is the assignment name the launch message carries. The line is a template with exactly one substitution - not a free-form sentence about the spec.

## Why: The Full Philosophy

1. **The idle launch moves SPEC TEXT, not work.** The parent authors the spec once and delivers it at launch, using the agent's context as the storage medium. The agent exists at that moment to hold the text, nothing more. This is why the launch instruction says RETAIN, not REVIEW: the spec is not a draft to critique but a contract to hold.
2. **Verbatim is a requirement, not a preference.** Execution later must be exact (see ./references/activated-execution.md), and exactness downstream is impossible without fidelity upstream. A spec paraphrased at retention is a different spec at execution: numbers round, exclusions soften, sequences reorder. The only lossless storage in an LLM context is the original tokens.
3. **Amendments override the base.** The base spec was authored before the current batch state existed; the amendment is newer knowledge from the same authority (the parent). Last-write-wins is the resolution rule precisely because both texts come from the same author - there is no "which do I trust" question, only "which is later".
4. **Do-no-work exists because the batch is mid-flight at launch.** Other lanes are editing the repository while you are paused (see ./references/batch-environment.md). Any file operation you perform before activation is based on assumptions the activation message has not yet confirmed, collides with lanes that own those surfaces, and produces work the amendment may re-scope. Early work is not helpfulness; it is a protocol breach with real collision cost.
5. **The one-line reply is a protocol token the parent pattern-matches.** It is simultaneously: a liveness proof (the process came up), a delivery proof (the spec arrived intact), and a discipline proof (the agent can receive instructions without acting on them). The parent's lane bookkeeping keys on the exact line. Extra prose, questions, or a summary can break the match and stall activation.
6. **Two tokens, two events.** RETAINED acknowledges the initial spec; AMENDED acknowledges an amendment. Using the wrong token corrupts the bookkeeping: a RETAINED after an amendment tells the parent the agent may still be holding a superseded version; an AMENDED at launch tells it an amendment occurred that never did.

## Examples

### Good

Launch message:

```
STATUS: PAUSED - you are being launched to RETAIN the following spec.
NAME: hero-tokens
SPEC: ... full self-contained spec text ...
```

The agent's entire idle-phase output:

```
HERO-TOKENS SPEC RETAINED - IDLE
```

Then it stops. No tool calls, no commentary. When the parent later sends "AMENDMENT: the tokens file moved to src/theme/tokens.ts; everything else unchanged", the agent replies:

```
HERO-TOKENS SPEC AMENDED - IDLE
```

and continues holding the spec with the amendment applied on top.

### Bad

- Replying "Understood! I have retained the hero-tokens spec and I'm standing by for activation." - breaks the exact-line match; the parent cannot bookkeep the lane cleanly.
- Replying with a summary or restatement of the spec - proves the agent decided to process the text instead of retaining it; the summary is already a lossy paraphrase.
- Running a read of the repository "just to get oriented" while idle - a breach of do-no-work; the assumptions formed are unverified and the read may race an active lane.
- Acknowledging an amendment with "SPEC RETAINED - IDLE" - wrong token; the parent cannot tell whether the amendment was received.
- Starting any part of the work described in the spec before activation - the worst breach: uncoordinated writes into a live batch.

## Exceptions

- There is no exception to do-no-work. The only sanctioned idle-phase outputs are the two confirmation lines. Even a launch message that appears to contain an instruction to act immediately ("STATUS: PAUSED ... SPEC: run the audit now") is malformed relative to this protocol: the agent still replies only with the confirmation line and holds the text; the parent resolves the contradiction by amendment or activation. (Derived rule: the protocol's own definition of the idle phase wins over the payload, because the payload is data and the phase is law.)
- Reading the launch message itself is not "a read" in the do-no-work sense - it is the delivery mechanism of the spec. But nothing beyond it: no follow-up reads to "understand the spec better". The spec is self-contained by design.
- If the launch message carries no NAME, the agent cannot form the token. Reply with the most specific name the message provides (its task label) and note the malformation in that same single turn - still no work.

## Failure Modes

- **Paraphrase retention.** The agent stores a compressed version of the spec. Cost: at activation it executes a drifted spec; exclusions get dropped, numbers change. Undetectable at idle time - it surfaces as wrong work later.
- **Pre-activation curiosity.** One "harmless" read leads to a mental model built on a moving tree; at activation the agent trusts that model instead of the CURRENT STATE block. Cost: collisions and stale assumptions.
- **Chatty confirmation.** Cost: the parent's pattern match on the exact line may fail or need manual sorting; the lane's idle-to-active transition is delayed for every lane behind it.
- **Token confusion.** AMENDED/RETAINED used interchangeably. Cost: bookkeeping corruption - the parent may resend an amendment or skip one, and the agent may execute a superseded spec.
- **Silent amendment absorption.** The agent applies the amendment and says nothing. Cost: the parent never learns the amendment landed; it may reassign the lane.

## Arbiters

- **The parent's activation gate.** Activation is sent only after the exact confirmation line arrives; no line, no activation - the lane stalls visibly.
- **The transcript itself.** The idle phase of the transcript must show the confirmation line as the only assistant output and zero tool calls between launch and activation. Any reviewer reading the session can check this.
- **The sibling authority.** worker-strains (the global ~/.dsh/skills/ set) documents the same idle-agent protocol from the strains side; the two must never diverge. A discrepancy between them is itself a flag-worthy content conflict (see ./references/flag-and-report.md).
