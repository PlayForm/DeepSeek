# DSH vocabulary: turn, step, request, tool, result, attempt

> Statement: The harness sources establish one vocabulary for what a session records: a turn is zero
> or more steps, a step is one model request plus the tools it calls, a request is the assembled
> model call reconstructed from the log, a tool call and its result are paired durable events, and
> an attempt is a model call that committed no surface message. The append-only session log is the
> source of truth, and every graph the site draws must fold from it.

## The six distinctions, quoted

- Turn: "A **turn** is zero or more steps: it opens before its first input is claimed and closes
  once nothing is owed." It opens with turn/start carrying the turn number and closes with turn/end
  carrying the turn number and a reason; the reason vocabulary is completed, aborted, blocked,
  error, max-tokens, interrupted, and forked.
- Step: "A **step** is one model request plus the tools it calls." It opens with step/start and
  closes with step/end, both carrying turn and step numbers.
- Request: the envelope is logged state. request/header records "The conversation's call
  configuration (provider, model, reasoning effort, and sampling scalars)" plus the assembled tool
  schemas, and request/context records route metadata only when "the provider, model, capacity, or
  systemPromptUpdate mode differs from the previous record". "Every model request must be
  reconstructable from the log."
- Tool call: "The model requested one tool invocation: `name` with the raw `arguments` JSON string
  exactly as the model produced it (unparsed). `callId` pairs the call with its `tool/result`."
- Tool result: "A completed tool call's model-facing result", with an optional failure identity
  "allowed only when the message has `isError: true`" and optional tool-private meta.
- Attempt: "One model attempt that committed no surface message. The embedded stream preserves a
  failed, retried, cancelled, or stream-error attempt that reached settlement without fabricating
  model-visible history."

## Node kinds the site should use

- Turn node, from turn/start and turn/end; the reason renders on the node.
- Step node, from step/start and step/end; it encloses its request, messages, and tool events by the
  turn and step fields every one of them carries.
- Request node, from request/header and request/context inside the step.
- Message nodes, from the five surface types: "system/message", "developer/message", "user/message",
  "assistant/message", "tool/result". These are the only events that join the ordered surface.
- Tool call node, from tool/call, paired by callId to its tool/result node.
- Attempt node, from assistant/attempt; it never joins the surface or the derived history:
  "Everything else (`turn/*`, `step/*`, `assistant/attempt`, plugin-owned `llm/retry`) is structural
  and does not project into a message."

## Edge kinds the site should use

- Containment: a turn contains its steps; a step contains its request, messages, tool calls, and
  tool results, through the turn and step fields.
- Order: "seq is the monotonic position in the log (seq = log.length)"; the append-only sequence is
  the timeline's backbone.
- Causality: a step's tool results feed the next request: "tools owe another request, or next-step
  input arrived -> claim -> next step".
- Pairing: tool/call to tool/result through callId.
- Attempt-of: assistant/attempt attaches to its step's request; it is evidence, not history.

## The six questions a selected event must answer

The Trajectory inspector is the documented answer set: it "opens a record inspector for token usage,
duration, input, output, timing, images, and attachment summaries". The site's inspector contract:

1. What is it: the event type and the node kind it renders.
2. Where does it sit: turn, step, seq, and the recorded epoch-ms time.
3. Who produced it: provider and model for an assistant message; source for a user message; tool
   name for a tool call.
4. What did it cost: the usage tokens the adapter reported, when it reported them.
5. How long did it take: duration and TTFT; blank for in-flight records, which "show a start marker
   without inventing elapsed time".
6. What did it say or do: the input and output content, meaning text, reasoning, arguments, result,
   and attachments.

## What we reject

- A request is not a turn and a step is not a request; the architecture separates all three.
- "Policy decision" is not a session event kind: the durable events remain tool/call and
  tool/result, and the decision is the pipeline stage between them, which "applies policy, hooks,
  sandboxing, filesystem guards ... without changing the loop".
- An attempt is not model history and must not be drawn as one.
- Empty assistant content is not model history: "An **empty-content** `assistant/message` is also
  skipped".
- Live agent/* frames are not durable: "SDK users that need replayable transcript data should
  consume `session/event`; `agent/*` is the live coordination API".
- A time value the log does not record: each event carries `time` in epoch milliseconds and nothing
  carries a duration for unfinished work.

## Sources

- DeepSeek Harness architecture (URL not recorded in the capture) -
  Reference/Raw/dsh-architecture.md
- DeepSeek Harness agent turn and step lifecycle (generated sequence diagram) -
  Reference/Raw/dsh-agent-lifecycle.md
- DeepSeek Harness tool execution pipeline (generated flowchart) -
  Reference/Raw/dsh-tool-pipeline.md
- DeepSeek Harness sessions (packages/core/session) - Reference/Raw/dsh-session.md
- DeepSeek Harness LLM streaming (packages/llm) - Reference/Raw/dsh-llm-streaming.md
- @deepseek-ai/dsh-client-ui-trajectory README - Reference/Raw/dsh-trajectory.md
