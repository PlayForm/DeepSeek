/

# gen-ai

/ Copy path More options More options and Open commit detailssuccess Oct 27, 2026
[e19717d](https://github.com/open-telemetry/semantic-conventions-genai/commit/e19717d65f890955777b044bca2a3cd71ae8b498)
· Oct 27, 2026
[History](https://github.com/open-telemetry/semantic-conventions-genai/commits/main/docs/gen-ai)
Open commit details History

| Name | Name | Last commit message                                                                                                                                                                                                                                                       | Last commit date |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
|      |      | [Reject malformed message parts and give guidance on vendor-specific p…](https://github.com/open-telemetry/semantic-conventions-genai/commit/390a4667ed098276b834522d3575184ff8e49f48 "Reject malformed message parts and give guidance on vendor-specific parts \(#584\) |

- Use a fixed type for generic message parts

## Description

Fixes #519.

`GenericPart.type` is now the literal `"generic"`, and a new optional `generic_type` string records
what kind of content the part holds.

> \[!WARNING\] Breaking change, only the `type`s in the schema are valid now.

The stricter schema caught invalid `blob` parts in the openai and google-genai reference scenarios,
which were missing the required `modality` \(and `content` for google-genai output\). They used to
validate only because `GenericPart` accepted any `type`. This PR fixes them.

<details>
<summary>Before/after examples</summary>

Vendor-prefixed part type:

```jsonc
// Before
{
  "type": "anthropic_document",
  "source": {"type": "url", "url": "https://example.com/report.pdf"},
  "title": "Quarterly report"
}

// After
{
  "type": "generic",
  "generic_type": "anthropic_document",
  "source": {"type": "url", "url": "https://example.com/report.pdf"},
  "title": "Quarterly report"
}
```

Provider block with no matching part type:

```jsonc
// Before
{
  "type": "search_result",
  "source": "https://example.com/docs/otel",
  "title": "OpenTelemetry overview",
  "content": \[{"type": "text", "text": "OpenTelemetry is an observability framework."}\]
}

// After \(as recorded by the Anthropic reference scenario\)
{
  "type": "generic",
  "generic_type": "search_result",
  "source": "https://example.com/docs/otel",
  "title": "OpenTelemetry overview",
  "content": \[{"type": "text", "text": "OpenTelemetry is an observability framework."}\]
}
```

</details>

## Motivation

Explained in https://github.com/open-telemetry/semantic-conventions-genai/issues/519.

- This makes it so each part has it's own discriminator value
- Makes the schema forward compatible since generic/vendor specific values would go in
  `generic_type` which is a free-form string.

## Prototype

The Anthropic scenario records a `search_result` input block, which has no matching part type, as a
generic part with `generic_type` read from the block's `type`.

I checked the example from #519 with ajv against the input messages schema on `main` and on this
branch:

```json
\[{"role": "user", "parts": \[{"type": "text", "content": 123}\]}\]
```

```console
$ npx ajv-cli validate --spec=draft2020 --validate-formats=false \\
    -s model/gen-ai/gen-ai-input-messages.json -d text_int_content.json
```

- `main`: valid
- this branch: invalid, `/0/parts/0/content must be string`

`--validate-formats=false` is needed because ajv rejects the existing `format: "binary"` on
`BlobPart.content`.

## Checklist

- \[x\] Motivation section filled in above
- \[x\] Reference scenarios updated for affected libraries \(Anthropic\)
- \[x\] Towncrier fragment added under `changelog.d/`

* Allow any non-known part type on GenericPart and drop generic_type

Use a not-enum constraint on GenericPart.type so any part type not defined by semantic conventions
is accepted as a generic part, while parts with a defined type must match that part's schema instead
of falling through to the catch-all.

Recommend prefixing provider-specific part type values with gen_ai.provider.name \(for example
anthropic.search_result\) to avoid collisions with part types defined by semantic conventions.

- Address review feedback on examples-llm-calls.md and anthropic scenario comment

- Exclude only defined system instruction part types on GenericSystemInstructionPart") | Oct 26,
  2026 |  
  | | | | Oct 27, 2026 |  
  | | | | Oct 27, 2026 |  
  | | | [Clarify client inference span is a logical operation
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference
  span")[#562](https://github.com/open-telemetry/semantic-conventions-genai/pull/562)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference span") | Oct 26, 2026 |  
  | | | [Clarify client inference span is a logical operation
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference
  span")[#562](https://github.com/open-telemetry/semantic-conventions-genai/pull/562)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference span") | Oct 26, 2026 |  
  | | | [Clarify client inference span is a logical operation
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference
  span")[#562](https://github.com/open-telemetry/semantic-conventions-genai/pull/562)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference span") | Oct 26, 2026 |  
  | | | [Use `gen_ai.client.embeddings.duration` and
  `gen_ai.client.embeddings…](https://github.com/open-telemetry/semantic-conventions-genai/commit/20259355b9631e3f032dcc099d1b5a2666818c42 "Use `gen_ai.client.embeddings.duration`and`gen_ai.client.embeddings.operation.input_tokens`
  metrics for embeddings, move embeddings signals to one file \(#578\)

- Add embeddings duration and input token metrics, move embeddings signals to one file

- Record embeddings duration on errors, drop redundant inference token notes, format

- Tailor embeddings attribute notes and examples

- Fix OpenAI embeddings error scenario transport") | Oct 26, 2026 |  
  | | | [Clarify client inference span is a logical operation
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference
  span")[#562](https://github.com/open-telemetry/semantic-conventions-genai/pull/562)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference span") | Oct 26, 2026 |  
  | | | [Unified OpenTelemetry model for tracking agent-to-agent interactions
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/6481373a60d49f59730bae2c87274d99d6d9e743
  "Unified OpenTelemetry model for tracking agent-to-agent interactions \(#447\)

- Add agent interaction type semantics

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify invoke_agent ownership and tighten interaction.type conditions

* invoke_agent.client and invoke_agent.internal notes now explicitly state these are caller-owned
  operations, gen_ai.agent.* identifies the target, the child execution represents the executing
  agent, and interaction.type MUST NOT be copied to the target execution span.
* execute_tool.internal note now explains tool-mediated agent-directed semantics and clarifies that
  gen_ai.agent.name on this span identifies the tool's owning/executing agent, not the delegation
  target.
* All three conditionally_required conditions now require that the instrumented framework or
  protocol explicitly distinguishes the operation as delegation or handoff, ruling out wrapper
  inference.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix execute_tool agent.name conditional target semantics

When gen_ai.agent.interaction.type is present on an execute_tool span, gen_ai.agent.name MUST
identify the target agent, not the owning agent. Without interaction.type the default owning-agent
meaning is preserved. State the same discriminator in the registry attribute note.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix shared execute_tool group: agent.name brief states conditional discriminator

The shared attributes.gen_ai.execute_tool.common group described gen_ai.agent.name only as 'the
agent executing the tool', contradicting the execute_tool.internal span rule that requires it to
identify the target agent when gen_ai.agent.interaction.type is present. Update the brief to state
both meanings explicitly: target agent when the interaction type attribute is present, executing
agent otherwise. Add a note that the duration metric \(which does not carry interaction type\)
always uses the executing-agent meaning.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove topology assumptions from invoke_agent and interaction.type notes

* Replace 'child span created by the executing agent' with topology-neutral wording: target
  execution may be represented by a separate invoke_agent span, which MUST NOT carry
  gen_ai.agent.interaction.type.
* Remove 'The source agent remains the parent execution context.' from the registry attribute note;
  ownership semantics are preserved by the existing target-identity rule.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Extend execute_tool.duration metric with interaction.type for cross-signal consistency

Add gen_ai.agent.interaction.type to gen_ai.execute_tool.duration with the same
conditionally_required condition as the execute_tool span. Update the metric note to clarify that
gen_ai.agent.name identifies the target agent when interaction.type is present, otherwise the
executing agent.

Remove the now-stale sentence from the shared attributes.gen_ai.execute_tool.common brief that
incorrectly implied the metric always uses the executing-agent meaning.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Add multi-agent interaction references

Emit gen_ai.agent.interaction.type on the caller-owned execute_tool operation for the libraries
whose current public APIs make the target and interaction type available at that boundary:

- google-adk: agent-as-tool delegation via google.adk.tools.agent_tool.AgentTool. The execute_tool
  span carries interaction.type=delegation and names the target sub-agent; the child invoke_agent
  span carries only the target's executing identity.
- openai-agents: agent-as-tool delegation via Agent.as_tool and native handoff via handoff\(\); the
  caller-owned execute_tool spans carry interaction.type \(delegation / handoff\) and the target
  agent name. Both also record the gen_ai.execute_tool.duration metric with the interaction type and
  target agent.
- crewai: left unchanged. Its delegate tool takes the target coworker as a free-form string argument
  matched against agent roles; the deterministic mock fills string arguments with placeholders
  \(mock-coworker\), so a Crew.kickoff\(\) run cannot drive a real delegation to a named target
  through the harness. Recorded as an honest capture gap.

Regenerated scenario data.json and the affected status report pages.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix Task 2 review findings: distinct handoff target span and finally-timed tool duration

Fix 1 \(openai-agents native handoff\): demonstrate the target billing-agent execution as its own
`invoke_agent billing-agent` span, reached through the public `Runner.run\(triage_agent, ...\)`
entry point by wrapping the SDK's private per-turn `run_single_turn` seam \(no private API is called
directly\). The target span carries the billing agent's response and no
`gen_ai.agent.interaction.type`; the caller `invoke_agent triage-agent` span no longer carries the
target output, and the immediate `execute_tool transfer_to_billing_agent` operation stays bounded as
its child.

Fix 2 \(openai-agents delegation + handoff, google-adk delegation\): record the manual
`gen_ai.execute_tool.duration` metric in `finally` so a failed tool/agent operation is still timed.
Error propagation is preserved \(try/finally, no except\) and success-only result attributes are set
only after the wrapped call returns, so nothing is manufactured on failure.

Generated data.json and reports are unchanged: the fixes correct span topology and failure-time
timing, not the per-span-type attribute coverage that data.json records.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Show nested delegated agent as its own invoke_agent span \(agent-as-tool\)

Generalize the handoff fix's per-turn `run_single_turn` instrumentation seam into a shared
`_invoke_agent_span_per_turn` context manager and use it from both the native-handoff and the
agent-as-tool delegation scenarios. Because a delegated agent runs through `Agent.as_tool`'s own
nested `Runner.run` -- which also flows through `run_single_turn` -- the delegated target
`weather-specialist` now gets its own `invoke_agent weather-specialist` span, nested under the
caller-owned `execute_tool weather-specialist` operation, carrying the delegated agent's response
and no `gen_ai.agent.interaction.type` \(that stays caller-owned on the execute_tool op\). The
caller's turns get their own `invoke_agent assistant` spans. The public entry point stays
`Runner.run\(caller, ...\)`; the private seam is patched, never called directly, and always
restored.

No data.json / report change: attribute-key coverage per span type is unchanged; this corrects span
topology \(a distinct nested target execution span\).

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore patched instrumentation-seam methods in finally

Every scenario that installs an instrumentation seam by patching an SDK instance method now saves
and restores the original in `finally` -- including on exceptional paths -- via a small
`_patched_method` context manager. Previously `weather_tool.on_invoke_tool` \(openai-agents
delegation\), `billing_handoff.on_invoke_handoff` \(openai-agents handoff\), and
`agent_tool.run_async` \(google-adk delegation\) were assigned but never restored, so a raised run
would leave the traced wrapper installed on the object.

Per repository rules, patching a public or private method as a seam is fine as long as the scenario
still enters through the library's public API \(`Runner.run` / `runner.run_async`\); the fix is
symmetric save/restore, not a seam redesign. No behavior or telemetry change on the success path.

No data.json / report change \(byte-identical\): this is a restoration-hygiene fix, not an
attribute-coverage change.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate agent interaction documentation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Rename changelog fragment to PR 447

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Scope agent interaction type to tool-mediated operations

`gen_ai.agent.interaction.type` is only proven capturable on the tool call that directs work to
another agent \(agent-as-tool delegation, native handoff via a generated transfer tool\), so keep it
there and drop it from the `invoke_agent` client and internal spans, along with the caller-owned
notes those span types had grown.

Also drop the weaker `SHOULD be recorded` sentence from the `execute_tool` note: the
conditionally-required requirement level already states when the attribute is recorded, so the note
now only defines what it means.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Record one execute_tool.duration point per ADK tool execution

Google ADK records `gen_ai.execute_tool.duration` itself for every tool call, dimensioned by the
calling agent and by the tool's Python class name. With the scenario also recording it for the
`AgentTool` delegation, one delegation produced two points that disagreed on both
`gen_ai.agent.name` and `gen_ai.tool.type`.

Suppress ADK's instrument alongside the client ones already suppressed, and record the metric next
to every `execute_tool` span the scenario emits: the ordinary `get_weather` call names the agent
executing the tool and carries no interaction type, the `AgentTool` delegation names the target
agent with `gen_ai.agent.interaction.type=delegation`. Both are timed in `finally`, so a failing
tool is still measured and errors propagate.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Give each logical agent invocation one execution span

The openai-agents scenario opened an `invoke_agent` span per SDK turn, so a caller that took two
turns to answer was split across two execution spans, one owning the input and the other the
response.

Bound logical executions instead:

- Agent-as-tool delegation needs no per-turn seam at all. The caller's whole invocation is the
  public `Runner.run\(caller, ...\)` call, so its execution span wraps that call and owns the
  caller's input and response. The delegated target's execution span wraps the `on_invoke_tool`
  call, which is what runs the target agent through its own nested `Runner.run`, and carries the
  target's response.
- A native handoff switches the active agent mid-run, which the SDK exposes no public boundary for.
  `_invoke_agent_execution_spans` keeps the state to derive one: the span stays open across every
  consecutive turn of the same agent and is replaced only when the active agent changes, so triage
  and billing get one execution span each and the target's output lands on billing, not triage.

No execution span carries `gen_ai.agent.interaction.type`; it stays on the caller-owned
`execute_tool` operation. Every patched seam is restored in `finally`, including the open execution
span.

The delegated target's `gen_ai.input.messages` is an honest omission: the invoker seam exposes the
delegated input only as the tool's raw argument JSON, which the caller-owned `execute_tool` span
already records verbatim as `gen_ai.tool.call.arguments`.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Correlate the OpenAI handoff target execution with its run

A native handoff started the target agent's execution span from whatever context was current between
turns, which is empty once the previous execution span's `use_span` scope has exited -- so
`invoke_agent billing-agent` became a root span in a brand-new trace, disconnected from the triage
execution and the transfer that caused it.

Capture the caller-owned `execute_tool transfer_to_<agent>` span context at the handoff seam and
start the target's execution span from it, so the transfer causally parents the work it handed over:
source execution, transfer and target execution are one chain in one trace under the public
`Runner.run`. An active-agent change with no captured transfer falls back to the run's own context
\(its first execution span\), so it still joins that trace rather than starting another. The holder
is created per run, so no context leaks into the next `Runner.run`, the seam is still restored in
`finally`, and errors still propagate.

Also record `gen_ai.execute_tool.duration` for the ordinary `get_weather` tool, which only the
delegation and handoff operations were recording. It is timed in `finally` so a failed execution is
still measured, names the agent executing the tool, and carries no `gen_ai.agent.interaction.type`
-- an ordinary tool call is not an agent interaction. Each of the three tool operations now records
exactly one point.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore invoke_agent delegation and handoff interaction type

The proposal covers every caller-owned operation that directs work to another agent, not just the
tool-mediated ones, so `gen_ai.agent.interaction.type` is referenced again by
`gen_ai.invoke_agent.client` and `gen_ai.invoke_agent.internal`, conditionally required only when
the instrumented framework or protocol explicitly distinguishes that caller-owned invocation as a
delegation or handoff to another agent.

The invoke_agent notes stay scoped and topology-neutral: they say what the attributes mean _when_
the span represents such a delegation or handoff, keep the ordinary execution-span meaning
otherwise, and forbid the attribute on a target agent's execution when that execution is its own
`invoke_agent` span. No source or peer attribute and no context-propagation guidance is added.

The reference reports keep telling the truth: no scenario library exposes an explicit per-call
delegation-vs-handoff classification at a non-tool `invoke_agent` boundary, so both invoke-agent
reports show `\(none\)` for the attribute and no scenario data was manufactured to cover it.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Model the native OpenAI handoff as a caller-owned invoke_agent operation

`handoff\(\)` is not an ordinary tool execution: the SDK gives it its own `Handoff` object and its
own invoker, `on_invoke_handoff`, whose whole purpose is to switch the active agent so the target
owns the remaining work. That dedicated boundary is a caller-owned agent invocation, so the scenario
now opens an `invoke_agent billing-agent` span around it, naming the target agent and carrying
`gen_ai.agent.interaction.type=handoff`, instead of an `execute_tool transfer_to_billing_agent`
span.

The generated `transfer_to_<agent>` name the model sees is a prompt-level artifact of that API
rather than a tool the agent executes, so the operation emits no `gen_ai.tool.*` attributes and
records no `gen_ai.execute_tool.duration` point. `Agent.as_tool` delegation is untouched: it really
is a tool call, and stays on `execute_tool` with its duration point.

The target agent's own execution is still a separate `invoke_agent billing-agent` span with no
interaction type, parented to the caller-owned handoff span, so the whole run stays one causally
connected trace.

This gives `gen_ai.invoke_agent.internal` honest reference coverage for the attribute: the report
now credits `\[openai-agents\]`. The client span keeps `\(none\)` — no library here exposes that
classification at a remote agent call.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- State that a dedicated agent-transfer operation is an invoke_agent span

Frameworks that model a handoff as their own operation, distinct from tool execution, left the
mapping ambiguous: the model still selects the transfer like a tool, so an instrumentation could
reasonably have recorded it as `execute_tool`. The `invoke_agent` note now says which span to emit
-- record the transfer as the caller-owned `invoke_agent` operation naming the target agent, not as
`gen_ai.execute_tool` -- and cites the prior art the rule comes from: the OpenAI Agents SDK records
a native handoff with its own handoff span naming the source and target agents, distinct from the
spans it records for function tools.

The `execute_tool` note states the same boundary from the other side: such a transfer is recorded as
a `gen_ai.invoke_agent` operation instead, and neither the `execute_tool` span nor
`gen_ai.execute_tool.duration` is recorded for it.

This is the rule the openai-agents reference scenario already implements.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Record agent-execution metrics only for the agent's own execution

A caller-owned `invoke_agent` delegation or handoff operation directs work to another agent; it is
not that agent running. The OpenAI native handoff makes the ambiguity concrete: one logical
billing-agent invocation produces two `invoke_agent billing-agent` spans -- the caller-owned
transfer and the target's own execution -- so an instrumentation that follows every `invoke_agent`
span would emit two data points for one invocation.

State the carve-out on all three agent-execution metrics \(`gen_ai.invoke_agent.duration`,
`gen_ai.invoke_agent.inference_calls`, `gen_ai.invoke_agent.tool_calls`\) and once on the
`gen_ai.invoke_agent.internal` span, so the span and metric surfaces agree: the operation carrying
`gen_ai.agent.interaction.type` MUST NOT record them. The metrics gain no new attribute -- the
marker is the interaction type already defined on the span.

The openai-agents scenario now records `gen_ai.invoke_agent.duration` per logical agent execution in
the handoff run, proving the carve-out: two `invoke_agent billing-agent` spans, one billing-agent
data point.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Record error.type on manual duration metrics for failed executions

The openai-agents and google-adk reference scenarios record several gen_ai.execute_tool.duration and
gen_ai.invoke_agent.duration points manually, in a finally block, so a failed operation is still
timed. None of those sites carried error.type when the operation failed, even though it is
conditionally required by the metric model's shared error attribute group for exactly that case.

Fix each site \(openai-agents ordinary get_weather, openai-agents Agent.as_tool delegation,
openai-agents invoke_agent execution -- both source and target -- google-adk get_weather, google-adk
AgentTool delegation\) the same way: catch Exception narrowly around the instrumented call, derive a
low-cardinality error.type from the exception's class name \(matching ADK's own resolve_error_type
fallback\), immediately re-raise, and add error.type to the metric attributes recorded in finally
only when the call failed. Success attributes and patch restoration are unchanged.

Verified with forced-failure probes \(deleted after use\) against a live mock server: each site was
RED before this change \(exception propagated, but error.type was missing from the recorded point\)
and GREEN after. Full openai-agents and google-adk scenario runs still complete cleanly. Ruff
check/format clean; no drift in model/, docs/, reference/reports, or committed data.json, since
error.type is only ever emitted on a failure path the happy-path scenarios don't exercise.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Add LangChain agent interaction proofs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix: resolve langchain review findings

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify LangGraph handoff invariant

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify agent interaction semantics

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Document transfer attribute redesign

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Plan transfer attribute redesign

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Test transfer attribute coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Define GenAI transfer attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Demonstrate GenAI transfer attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Format transfer coverage test

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate transfer convention docs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Tighten transfer reference evidence

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove local planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Refine agent transfer documentation

Move detailed A2A trace examples to a non-normative page and synchronize generated documentation and
reference scenario data with CI.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Limit transfer attributes to tool execution

Use the existing invoke_agent client semantics for API and protocol invocations, where
gen_ai.agent.* identifies the invoked agent.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Move agent interaction guidance after spans

Keep the cross-span A2A selection guidance after the individual span definitions.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate invoke agent client documentation

Remove transfer attributes and their generated definitions from the invoke_agent client span
documentation.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Decouple transfer mode and target attributes

Allow execute_tool spans and metrics to record each explicitly available transfer value
independently.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore transfer mode requirement

Keep transfer target attributes conditional on gen_ai.transfer.mode being present.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Keep transfer attributes span-only

Remove transfer dimensions from execute_tool duration metrics and reference metric snapshots while
preserving source-agent attribution.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore agent name wording

Revert the unrelated execute_tool agent-name description change and remove the added metric
explanation.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Tighten transfer reference evidence

Remove the unsupported transfer target ID and derive LangGraph transfer attributes from the
validated Command result.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate transfer span documentation

Apply Weaver's footnote renumbering after removing the unsupported transfer target ID.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- refactor\(reference\): minimize transfer scenarios

Restore unrelated scenario behavior and keep one framework-native transfer proof per supported agent
framework.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore\(reference\): refresh transfer snapshots

Apply the telemetry snapshots generated by CI after removing unrelated scenarios.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(reference\): add A2A client invocation scenario

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- ref\(reference\): demonstrate A2A with Google ADK

Move the remote A2A proof into Google ADK's RemoteA2aAgent scenario and verify invoke_agent
INTERNAL-to-CLIENT nesting.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(gen-ai\): align A2A transfer coverage

Make provider identity conditional for generic remote agent services and record the known agent
target type in the LangChain handoff scenario.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore\(reference\): refresh Google ADK findings

Remove the provider warning after making provider identity conditional for generic remote agent
services.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): source A2A provider from agent card

Keep invoke_agent provider requirements unchanged and limit the generated agent-span documentation
diff to the new A2A section.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): refresh Google ADK findings

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: design agent transfer span refinement

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- refactor\(gen-ai\): refine agent transfer tool spans

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): document agent transfer refinement

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: remove implementation planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: design transfer refinement follow-up

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(gen-ai\): clarify transfer tool refinement

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): detail transfer refinement behavior

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): align transfer refinement coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: remove implementation planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore\(reference\): refresh transfer scenario findings

Record the current conformance runner finding for refinement-specific execute-tool span names.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- test\(reference\): prove ADK workflow A2A caller

Run RemoteA2aAgent inside a named ADK workflow and verify the workflow identity remains available at
the A2A client boundary without emitting unregistered caller attributes.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(gen-ai\): add caller-aware agent invocation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): link caller refinement example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: design refinement-only span attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: plan refinement-only span attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: ignore local worktrees

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(gen-ai\): isolate span refinement attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(gen-ai\): tighten task 1 refinement tests

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(reference\): record span refinement coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): run Task 2 coverage tests directly

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(reference\): report span refinement coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): separate span refinement attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix refinement report ordering

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove accidental session artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: remove implementation planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): group agent interaction refinements

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): refresh refinement scenario outputs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): address interaction review feedback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix reference scenario CI output

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Format merged reference scenarios

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix merged reference scenario coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix merged reference scenario coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Strengthen agent caller instrumentation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Stabilize ADK caller reference

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Refresh Google ADK conformance data

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Rerun CI after link timeout

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Use public APIs for ADK caller reference

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove redundant transfer target type

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Move caller attributes to invoke agent span

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Address remaining agent interaction review feedback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove refinement coverage infrastructure

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify agent interaction tracking guidance

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove transfer cross-reference from client span

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Align agent interaction guidance and ADK reference

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify remote agent interaction example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Simplify remote agent interaction example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Address agent transfer review feedback

Remove caller attributes and custom attribution context. Tighten tool transfer requirements and move
complete span examples into the existing examples document.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Tighten transfer guidance and align examples

* Remove registry notes that repeated the transfer requirement conditions
* Merge the transfer refinement applicability and reporting sentences
* Use bold span labels in agent transfer examples, as other examples do
* Shorten the ADK remote-agent README description

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Remove remote agent invocation example

The PR does not change invoke-agent conventions, so this example is out of scope.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Remove remote A2A invocation from ADK scenario

This PR adds only the agent transfer refinement; remote invoke-agent spans use existing conventions.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Address agent transfer review feedback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
f5d89543-238c-476f-940c-cccccfa8bd87

- Capture agent transfer execution metadata

Register SDK-identifiable LangChain agents directly in the handoff graph and verify routing, span
parentage, and invocation boundaries. Record available per-agent token usage and finish reasons,
preserve ADK session correlation, and instrument actual nested runner calls.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

Copilot-Session: f5d89543-238c-476f-940c-cccccfa8bd87

- Preserve observed usage when ADK closes a transferring agent

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
05b28e37-551f-421b-a672-4c819598f6f3

- Refresh reference report after removing LangGraph transfer example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
05b28e37-551f-421b-a672-4c819598f6f3

---

Co-authored-by: Nikhil Chitlur Navakiran \(from Dev Box\) <nikhilc@microsoft.com> Co-authored-by:
Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335 Copilot-Session: f5d89543-238c-476f-940c-cccccfa8bd87
Copilot-Session:
05b28e37-551f-421b-a672-4c819598f6f3")[#…](https://github.com/open-telemetry/semantic-conventions-genai/pull/447)
| Oct 26, 2026 |  
| | | [Define and formalize GenAI content capture and upload configuration
o…](https://github.com/open-telemetry/semantic-conventions-genai/commit/24a1bd1e729ac4f99f9a3bd1fa98e87b2dbcfe2c
"Define and formalize GenAI content capture and upload configuration options \(#543\)

- Define and document GenAI content capture and upload configuration options

Assisted-by: Gemini

- Update changelog fragment with PR number #543

Assisted-by: Gemini

- Address comments

- Format scenario.py with ruff

- Address Comments

- Revert changes

- Address review comment: remove memory.record.count from schema attribute exclusion

- Update hook env var to OTEL_INSTRUMENTATION_GENAI_CONTENT_HOOK

- Apply changes") | Oct 26, 2026 |  
  | | | [Pin the signal requirement level link to the upstream version
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/7e6e1884b242a277e6e2494e698f69481fe6fea8
  "Pin the signal requirement level link to the upstream version \(#436\)

Co-authored-by: Copilot App
<223556219+Copilot@users.noreply.github.com>")[#436](https://github.com/open-telemetry/semantic-conventions-genai/pull/436)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/7e6e1884b242a277e6e2494e698f69481fe6fea8
"Pin the signal requirement level link to the upstream version \(#436\)

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>") | Aug 5, 2026 |  
| | | [Use `gen_ai.client.embeddings.duration` and
`gen_ai.client.embeddings…](https://github.com/open-telemetry/semantic-conventions-genai/commit/20259355b9631e3f032dcc099d1b5a2666818c42 "Use `gen_ai.client.embeddings.duration`and`gen_ai.client.embeddings.operation.input_tokens`
metrics for embeddings, move embeddings signals to one file \(#578\)

- Add embeddings duration and input token metrics, move embeddings signals to one file

- Record embeddings duration on errors, drop redundant inference token notes, format

- Tailor embeddings attribute notes and examples

- Fix OpenAI embeddings error scenario transport") | Oct 26, 2026 |  
  | | | [Unified OpenTelemetry model for tracking agent-to-agent interactions
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/6481373a60d49f59730bae2c87274d99d6d9e743
  "Unified OpenTelemetry model for tracking agent-to-agent interactions \(#447\)

- Add agent interaction type semantics

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify invoke_agent ownership and tighten interaction.type conditions

* invoke_agent.client and invoke_agent.internal notes now explicitly state these are caller-owned
  operations, gen_ai.agent.* identifies the target, the child execution represents the executing
  agent, and interaction.type MUST NOT be copied to the target execution span.
* execute_tool.internal note now explains tool-mediated agent-directed semantics and clarifies that
  gen_ai.agent.name on this span identifies the tool's owning/executing agent, not the delegation
  target.
* All three conditionally_required conditions now require that the instrumented framework or
  protocol explicitly distinguishes the operation as delegation or handoff, ruling out wrapper
  inference.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix execute_tool agent.name conditional target semantics

When gen_ai.agent.interaction.type is present on an execute_tool span, gen_ai.agent.name MUST
identify the target agent, not the owning agent. Without interaction.type the default owning-agent
meaning is preserved. State the same discriminator in the registry attribute note.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix shared execute_tool group: agent.name brief states conditional discriminator

The shared attributes.gen_ai.execute_tool.common group described gen_ai.agent.name only as 'the
agent executing the tool', contradicting the execute_tool.internal span rule that requires it to
identify the target agent when gen_ai.agent.interaction.type is present. Update the brief to state
both meanings explicitly: target agent when the interaction type attribute is present, executing
agent otherwise. Add a note that the duration metric \(which does not carry interaction type\)
always uses the executing-agent meaning.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove topology assumptions from invoke_agent and interaction.type notes

* Replace 'child span created by the executing agent' with topology-neutral wording: target
  execution may be represented by a separate invoke_agent span, which MUST NOT carry
  gen_ai.agent.interaction.type.
* Remove 'The source agent remains the parent execution context.' from the registry attribute note;
  ownership semantics are preserved by the existing target-identity rule.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Extend execute_tool.duration metric with interaction.type for cross-signal consistency

Add gen_ai.agent.interaction.type to gen_ai.execute_tool.duration with the same
conditionally_required condition as the execute_tool span. Update the metric note to clarify that
gen_ai.agent.name identifies the target agent when interaction.type is present, otherwise the
executing agent.

Remove the now-stale sentence from the shared attributes.gen_ai.execute_tool.common brief that
incorrectly implied the metric always uses the executing-agent meaning.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Add multi-agent interaction references

Emit gen_ai.agent.interaction.type on the caller-owned execute_tool operation for the libraries
whose current public APIs make the target and interaction type available at that boundary:

- google-adk: agent-as-tool delegation via google.adk.tools.agent_tool.AgentTool. The execute_tool
  span carries interaction.type=delegation and names the target sub-agent; the child invoke_agent
  span carries only the target's executing identity.
- openai-agents: agent-as-tool delegation via Agent.as_tool and native handoff via handoff\(\); the
  caller-owned execute_tool spans carry interaction.type \(delegation / handoff\) and the target
  agent name. Both also record the gen_ai.execute_tool.duration metric with the interaction type and
  target agent.
- crewai: left unchanged. Its delegate tool takes the target coworker as a free-form string argument
  matched against agent roles; the deterministic mock fills string arguments with placeholders
  \(mock-coworker\), so a Crew.kickoff\(\) run cannot drive a real delegation to a named target
  through the harness. Recorded as an honest capture gap.

Regenerated scenario data.json and the affected status report pages.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix Task 2 review findings: distinct handoff target span and finally-timed tool duration

Fix 1 \(openai-agents native handoff\): demonstrate the target billing-agent execution as its own
`invoke_agent billing-agent` span, reached through the public `Runner.run\(triage_agent, ...\)`
entry point by wrapping the SDK's private per-turn `run_single_turn` seam \(no private API is called
directly\). The target span carries the billing agent's response and no
`gen_ai.agent.interaction.type`; the caller `invoke_agent triage-agent` span no longer carries the
target output, and the immediate `execute_tool transfer_to_billing_agent` operation stays bounded as
its child.

Fix 2 \(openai-agents delegation + handoff, google-adk delegation\): record the manual
`gen_ai.execute_tool.duration` metric in `finally` so a failed tool/agent operation is still timed.
Error propagation is preserved \(try/finally, no except\) and success-only result attributes are set
only after the wrapped call returns, so nothing is manufactured on failure.

Generated data.json and reports are unchanged: the fixes correct span topology and failure-time
timing, not the per-span-type attribute coverage that data.json records.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Show nested delegated agent as its own invoke_agent span \(agent-as-tool\)

Generalize the handoff fix's per-turn `run_single_turn` instrumentation seam into a shared
`_invoke_agent_span_per_turn` context manager and use it from both the native-handoff and the
agent-as-tool delegation scenarios. Because a delegated agent runs through `Agent.as_tool`'s own
nested `Runner.run` -- which also flows through `run_single_turn` -- the delegated target
`weather-specialist` now gets its own `invoke_agent weather-specialist` span, nested under the
caller-owned `execute_tool weather-specialist` operation, carrying the delegated agent's response
and no `gen_ai.agent.interaction.type` \(that stays caller-owned on the execute_tool op\). The
caller's turns get their own `invoke_agent assistant` spans. The public entry point stays
`Runner.run\(caller, ...\)`; the private seam is patched, never called directly, and always
restored.

No data.json / report change: attribute-key coverage per span type is unchanged; this corrects span
topology \(a distinct nested target execution span\).

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore patched instrumentation-seam methods in finally

Every scenario that installs an instrumentation seam by patching an SDK instance method now saves
and restores the original in `finally` -- including on exceptional paths -- via a small
`_patched_method` context manager. Previously `weather_tool.on_invoke_tool` \(openai-agents
delegation\), `billing_handoff.on_invoke_handoff` \(openai-agents handoff\), and
`agent_tool.run_async` \(google-adk delegation\) were assigned but never restored, so a raised run
would leave the traced wrapper installed on the object.

Per repository rules, patching a public or private method as a seam is fine as long as the scenario
still enters through the library's public API \(`Runner.run` / `runner.run_async`\); the fix is
symmetric save/restore, not a seam redesign. No behavior or telemetry change on the success path.

No data.json / report change \(byte-identical\): this is a restoration-hygiene fix, not an
attribute-coverage change.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate agent interaction documentation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Rename changelog fragment to PR 447

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Scope agent interaction type to tool-mediated operations

`gen_ai.agent.interaction.type` is only proven capturable on the tool call that directs work to
another agent \(agent-as-tool delegation, native handoff via a generated transfer tool\), so keep it
there and drop it from the `invoke_agent` client and internal spans, along with the caller-owned
notes those span types had grown.

Also drop the weaker `SHOULD be recorded` sentence from the `execute_tool` note: the
conditionally-required requirement level already states when the attribute is recorded, so the note
now only defines what it means.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Record one execute_tool.duration point per ADK tool execution

Google ADK records `gen_ai.execute_tool.duration` itself for every tool call, dimensioned by the
calling agent and by the tool's Python class name. With the scenario also recording it for the
`AgentTool` delegation, one delegation produced two points that disagreed on both
`gen_ai.agent.name` and `gen_ai.tool.type`.

Suppress ADK's instrument alongside the client ones already suppressed, and record the metric next
to every `execute_tool` span the scenario emits: the ordinary `get_weather` call names the agent
executing the tool and carries no interaction type, the `AgentTool` delegation names the target
agent with `gen_ai.agent.interaction.type=delegation`. Both are timed in `finally`, so a failing
tool is still measured and errors propagate.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Give each logical agent invocation one execution span

The openai-agents scenario opened an `invoke_agent` span per SDK turn, so a caller that took two
turns to answer was split across two execution spans, one owning the input and the other the
response.

Bound logical executions instead:

- Agent-as-tool delegation needs no per-turn seam at all. The caller's whole invocation is the
  public `Runner.run\(caller, ...\)` call, so its execution span wraps that call and owns the
  caller's input and response. The delegated target's execution span wraps the `on_invoke_tool`
  call, which is what runs the target agent through its own nested `Runner.run`, and carries the
  target's response.
- A native handoff switches the active agent mid-run, which the SDK exposes no public boundary for.
  `_invoke_agent_execution_spans` keeps the state to derive one: the span stays open across every
  consecutive turn of the same agent and is replaced only when the active agent changes, so triage
  and billing get one execution span each and the target's output lands on billing, not triage.

No execution span carries `gen_ai.agent.interaction.type`; it stays on the caller-owned
`execute_tool` operation. Every patched seam is restored in `finally`, including the open execution
span.

The delegated target's `gen_ai.input.messages` is an honest omission: the invoker seam exposes the
delegated input only as the tool's raw argument JSON, which the caller-owned `execute_tool` span
already records verbatim as `gen_ai.tool.call.arguments`.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Correlate the OpenAI handoff target execution with its run

A native handoff started the target agent's execution span from whatever context was current between
turns, which is empty once the previous execution span's `use_span` scope has exited -- so
`invoke_agent billing-agent` became a root span in a brand-new trace, disconnected from the triage
execution and the transfer that caused it.

Capture the caller-owned `execute_tool transfer_to_<agent>` span context at the handoff seam and
start the target's execution span from it, so the transfer causally parents the work it handed over:
source execution, transfer and target execution are one chain in one trace under the public
`Runner.run`. An active-agent change with no captured transfer falls back to the run's own context
\(its first execution span\), so it still joins that trace rather than starting another. The holder
is created per run, so no context leaks into the next `Runner.run`, the seam is still restored in
`finally`, and errors still propagate.

Also record `gen_ai.execute_tool.duration` for the ordinary `get_weather` tool, which only the
delegation and handoff operations were recording. It is timed in `finally` so a failed execution is
still measured, names the agent executing the tool, and carries no `gen_ai.agent.interaction.type`
-- an ordinary tool call is not an agent interaction. Each of the three tool operations now records
exactly one point.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore invoke_agent delegation and handoff interaction type

The proposal covers every caller-owned operation that directs work to another agent, not just the
tool-mediated ones, so `gen_ai.agent.interaction.type` is referenced again by
`gen_ai.invoke_agent.client` and `gen_ai.invoke_agent.internal`, conditionally required only when
the instrumented framework or protocol explicitly distinguishes that caller-owned invocation as a
delegation or handoff to another agent.

The invoke_agent notes stay scoped and topology-neutral: they say what the attributes mean _when_
the span represents such a delegation or handoff, keep the ordinary execution-span meaning
otherwise, and forbid the attribute on a target agent's execution when that execution is its own
`invoke_agent` span. No source or peer attribute and no context-propagation guidance is added.

The reference reports keep telling the truth: no scenario library exposes an explicit per-call
delegation-vs-handoff classification at a non-tool `invoke_agent` boundary, so both invoke-agent
reports show `\(none\)` for the attribute and no scenario data was manufactured to cover it.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Model the native OpenAI handoff as a caller-owned invoke_agent operation

`handoff\(\)` is not an ordinary tool execution: the SDK gives it its own `Handoff` object and its
own invoker, `on_invoke_handoff`, whose whole purpose is to switch the active agent so the target
owns the remaining work. That dedicated boundary is a caller-owned agent invocation, so the scenario
now opens an `invoke_agent billing-agent` span around it, naming the target agent and carrying
`gen_ai.agent.interaction.type=handoff`, instead of an `execute_tool transfer_to_billing_agent`
span.

The generated `transfer_to_<agent>` name the model sees is a prompt-level artifact of that API
rather than a tool the agent executes, so the operation emits no `gen_ai.tool.*` attributes and
records no `gen_ai.execute_tool.duration` point. `Agent.as_tool` delegation is untouched: it really
is a tool call, and stays on `execute_tool` with its duration point.

The target agent's own execution is still a separate `invoke_agent billing-agent` span with no
interaction type, parented to the caller-owned handoff span, so the whole run stays one causally
connected trace.

This gives `gen_ai.invoke_agent.internal` honest reference coverage for the attribute: the report
now credits `\[openai-agents\]`. The client span keeps `\(none\)` — no library here exposes that
classification at a remote agent call.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- State that a dedicated agent-transfer operation is an invoke_agent span

Frameworks that model a handoff as their own operation, distinct from tool execution, left the
mapping ambiguous: the model still selects the transfer like a tool, so an instrumentation could
reasonably have recorded it as `execute_tool`. The `invoke_agent` note now says which span to emit
-- record the transfer as the caller-owned `invoke_agent` operation naming the target agent, not as
`gen_ai.execute_tool` -- and cites the prior art the rule comes from: the OpenAI Agents SDK records
a native handoff with its own handoff span naming the source and target agents, distinct from the
spans it records for function tools.

The `execute_tool` note states the same boundary from the other side: such a transfer is recorded as
a `gen_ai.invoke_agent` operation instead, and neither the `execute_tool` span nor
`gen_ai.execute_tool.duration` is recorded for it.

This is the rule the openai-agents reference scenario already implements.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Record agent-execution metrics only for the agent's own execution

A caller-owned `invoke_agent` delegation or handoff operation directs work to another agent; it is
not that agent running. The OpenAI native handoff makes the ambiguity concrete: one logical
billing-agent invocation produces two `invoke_agent billing-agent` spans -- the caller-owned
transfer and the target's own execution -- so an instrumentation that follows every `invoke_agent`
span would emit two data points for one invocation.

State the carve-out on all three agent-execution metrics \(`gen_ai.invoke_agent.duration`,
`gen_ai.invoke_agent.inference_calls`, `gen_ai.invoke_agent.tool_calls`\) and once on the
`gen_ai.invoke_agent.internal` span, so the span and metric surfaces agree: the operation carrying
`gen_ai.agent.interaction.type` MUST NOT record them. The metrics gain no new attribute -- the
marker is the interaction type already defined on the span.

The openai-agents scenario now records `gen_ai.invoke_agent.duration` per logical agent execution in
the handoff run, proving the carve-out: two `invoke_agent billing-agent` spans, one billing-agent
data point.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Record error.type on manual duration metrics for failed executions

The openai-agents and google-adk reference scenarios record several gen_ai.execute_tool.duration and
gen_ai.invoke_agent.duration points manually, in a finally block, so a failed operation is still
timed. None of those sites carried error.type when the operation failed, even though it is
conditionally required by the metric model's shared error attribute group for exactly that case.

Fix each site \(openai-agents ordinary get_weather, openai-agents Agent.as_tool delegation,
openai-agents invoke_agent execution -- both source and target -- google-adk get_weather, google-adk
AgentTool delegation\) the same way: catch Exception narrowly around the instrumented call, derive a
low-cardinality error.type from the exception's class name \(matching ADK's own resolve_error_type
fallback\), immediately re-raise, and add error.type to the metric attributes recorded in finally
only when the call failed. Success attributes and patch restoration are unchanged.

Verified with forced-failure probes \(deleted after use\) against a live mock server: each site was
RED before this change \(exception propagated, but error.type was missing from the recorded point\)
and GREEN after. Full openai-agents and google-adk scenario runs still complete cleanly. Ruff
check/format clean; no drift in model/, docs/, reference/reports, or committed data.json, since
error.type is only ever emitted on a failure path the happy-path scenarios don't exercise.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Add LangChain agent interaction proofs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix: resolve langchain review findings

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify LangGraph handoff invariant

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify agent interaction semantics

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Document transfer attribute redesign

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Plan transfer attribute redesign

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Test transfer attribute coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Define GenAI transfer attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Demonstrate GenAI transfer attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Format transfer coverage test

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate transfer convention docs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Tighten transfer reference evidence

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove local planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Refine agent transfer documentation

Move detailed A2A trace examples to a non-normative page and synchronize generated documentation and
reference scenario data with CI.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Limit transfer attributes to tool execution

Use the existing invoke_agent client semantics for API and protocol invocations, where
gen_ai.agent.* identifies the invoked agent.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Move agent interaction guidance after spans

Keep the cross-span A2A selection guidance after the individual span definitions.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate invoke agent client documentation

Remove transfer attributes and their generated definitions from the invoke_agent client span
documentation.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Decouple transfer mode and target attributes

Allow execute_tool spans and metrics to record each explicitly available transfer value
independently.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore transfer mode requirement

Keep transfer target attributes conditional on gen_ai.transfer.mode being present.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Keep transfer attributes span-only

Remove transfer dimensions from execute_tool duration metrics and reference metric snapshots while
preserving source-agent attribution.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Restore agent name wording

Revert the unrelated execute_tool agent-name description change and remove the added metric
explanation.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Tighten transfer reference evidence

Remove the unsupported transfer target ID and derive LangGraph transfer attributes from the
validated Command result.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Regenerate transfer span documentation

Apply Weaver's footnote renumbering after removing the unsupported transfer target ID.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- refactor\(reference\): minimize transfer scenarios

Restore unrelated scenario behavior and keep one framework-native transfer proof per supported agent
framework.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore\(reference\): refresh transfer snapshots

Apply the telemetry snapshots generated by CI after removing unrelated scenarios.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(reference\): add A2A client invocation scenario

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- ref\(reference\): demonstrate A2A with Google ADK

Move the remote A2A proof into Google ADK's RemoteA2aAgent scenario and verify invoke_agent
INTERNAL-to-CLIENT nesting.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(gen-ai\): align A2A transfer coverage

Make provider identity conditional for generic remote agent services and record the known agent
target type in the LangChain handoff scenario.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore\(reference\): refresh Google ADK findings

Remove the provider warning after making provider identity conditional for generic remote agent
services.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): source A2A provider from agent card

Keep invoke_agent provider requirements unchanged and limit the generated agent-span documentation
diff to the new A2A section.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): refresh Google ADK findings

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: design agent transfer span refinement

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- refactor\(gen-ai\): refine agent transfer tool spans

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): document agent transfer refinement

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: remove implementation planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: design transfer refinement follow-up

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(gen-ai\): clarify transfer tool refinement

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): detail transfer refinement behavior

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): align transfer refinement coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: remove implementation planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore\(reference\): refresh transfer scenario findings

Record the current conformance runner finding for refinement-specific execute-tool span names.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- test\(reference\): prove ADK workflow A2A caller

Run RemoteA2aAgent inside a named ADK workflow and verify the workflow identity remains available at
the A2A client boundary without emitting unregistered caller attributes.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(gen-ai\): add caller-aware agent invocation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): link caller refinement example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: design refinement-only span attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs: plan refinement-only span attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: ignore local worktrees

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(gen-ai\): isolate span refinement attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(gen-ai\): tighten task 1 refinement tests

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(reference\): record span refinement coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): run Task 2 coverage tests directly

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- feat\(reference\): report span refinement coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): separate span refinement attributes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix refinement report ordering

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove accidental session artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- chore: remove implementation planning artifacts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- docs\(gen-ai\): group agent interaction refinements

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): refresh refinement scenario outputs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- fix\(reference\): address interaction review feedback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix reference scenario CI output

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Format merged reference scenarios

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix merged reference scenario coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Fix merged reference scenario coverage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Strengthen agent caller instrumentation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Stabilize ADK caller reference

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Refresh Google ADK conformance data

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Rerun CI after link timeout

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Use public APIs for ADK caller reference

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove redundant transfer target type

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Move caller attributes to invoke agent span

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Address remaining agent interaction review feedback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove refinement coverage infrastructure

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify agent interaction tracking guidance

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Remove transfer cross-reference from client span

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Align agent interaction guidance and ADK reference

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Clarify remote agent interaction example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Simplify remote agent interaction example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Address agent transfer review feedback

Remove caller attributes and custom attribution context. Tighten tool transfer requirements and move
complete span examples into the existing examples document.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Tighten transfer guidance and align examples

* Remove registry notes that repeated the transfer requirement conditions
* Merge the transfer refinement applicability and reporting sentences
* Use bold span labels in agent transfer examples, as other examples do
* Shorten the ADK remote-agent README description

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Remove remote agent invocation example

The PR does not change invoke-agent conventions, so this example is out of scope.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Remove remote A2A invocation from ADK scenario

This PR adds only the agent transfer refinement; remote invoke-agent spans use existing conventions.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335

- Address agent transfer review feedback

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
f5d89543-238c-476f-940c-cccccfa8bd87

- Capture agent transfer execution metadata

Register SDK-identifiable LangChain agents directly in the handoff graph and verify routing, span
parentage, and invocation boundaries. Record available per-agent token usage and finish reasons,
preserve ADK session correlation, and instrument actual nested runner calls.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

Copilot-Session: f5d89543-238c-476f-940c-cccccfa8bd87

- Preserve observed usage when ADK closes a transferring agent

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
05b28e37-551f-421b-a672-4c819598f6f3

- Refresh reference report after removing LangGraph transfer example

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
05b28e37-551f-421b-a672-4c819598f6f3

---

Co-authored-by: Nikhil Chitlur Navakiran \(from Dev Box\) <nikhilc@microsoft.com> Co-authored-by:
Copilot <223556219+Copilot@users.noreply.github.com> Copilot-Session:
55d65119-c5f6-4c80-9ada-55b6761a4335 Copilot-Session: f5d89543-238c-476f-940c-cccccfa8bd87
Copilot-Session:
05b28e37-551f-421b-a672-4c819598f6f3")[#…](https://github.com/open-telemetry/semantic-conventions-genai/pull/447)
| Oct 26, 2026 |  
| | | [Use `gen_ai.client.embeddings.duration` and
`gen_ai.client.embeddings…](https://github.com/open-telemetry/semantic-conventions-genai/commit/20259355b9631e3f032dcc099d1b5a2666818c42 "Use `gen_ai.client.embeddings.duration`and`gen_ai.client.embeddings.operation.input_tokens`
metrics for embeddings, move embeddings signals to one file \(#578\)

- Add embeddings duration and input token metrics, move embeddings signals to one file

- Record embeddings duration on errors, drop redundant inference token notes, format

- Tailor embeddings attribute notes and examples

- Fix OpenAI embeddings error scenario transport") | Oct 26, 2026 |  
  | | | | Oct 17, 2026 |  
  | | | [Clarify client inference span is a logical operation
  (](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference
  span")[#562](https://github.com/open-telemetry/semantic-conventions-genai/pull/562)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/760c1da52f3a30ed0e940f519b5adc314271747a
  "Clarify client inference span is a logical operation \(#562\)

- Clarify inference span scope when the model provider is instrumented

- Rename changelog fragment

- feedback

- clean up

- clean up

- Clarify nested inference spans and link service entity

- Scope response attribute wording to client inference span

- Scope usage attribute briefs to client inference span") | Oct 26, 2026 |  
  | View all files |

## [README.md](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/docs/gen-ai#readme)

# Semantic conventions for generative AI systems

**Status** : [Development](https://opentelemetry.io/docs/specs/otel/document-status) Semantic
conventions for Generative AI operations are defined for the following signals:

- [Client Inference](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/client-inference.md):
  Semantic Conventions for Generative AI inference operations - _spans, events, and metrics_.
- [Client Embeddings](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/client-embeddings.md):
  Semantic Conventions for Generative AI embeddings operations - _spans and metrics_.
- [Events](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-events.md):
  Semantic Conventions for Generative AI inputs and outputs - _events_.
- [Exceptions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-exceptions.md):
  Semantic Conventions for Generative AI _exceptions_.
- [Metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md):
  Semantic Conventions for Generative AI operations - _metrics_.
- [Inference Token Metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-token-metrics.md):
  Semantic Conventions for Generative AI inference token metrics - _metrics_.
- [Model spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md):
  Semantic Conventions for Generative AI model operations - _spans_.
- [Agent spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md):
  Semantic Conventions for Generative AI agent operations - _spans_.

Technology specific semantic conventions are defined for the following GenAI system:

- [Anthropic](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/anthropic.md):
  Semantic Conventions for Anthropic.
- [Azure AI Inference](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/azure-ai-inference.md):
  Semantic Conventions for Azure AI Inference.
- [AWS Bedrock](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/aws-bedrock.md):
  Semantic Conventions for AWS Bedrock.
- [OpenAI](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/openai.md):
  Semantic Conventions for OpenAI.

See also:

- [Agent2Agent Protocol](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/a2a.md):
  Semantic Conventions for [A2A](https://a2a-protocol.org)
- [Model Context Protocol](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/mcp.md):
  Semantic Conventions for [MCP](https://modelcontextprotocol.io)

You can’t perform that action at this time.
