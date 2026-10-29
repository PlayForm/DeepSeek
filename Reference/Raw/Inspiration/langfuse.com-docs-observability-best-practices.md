DocsBest Practices
[Docs](https://langfuse.com/docs)[Observability](https://langfuse.com/docs/observability/overview)[Best Practices](https://langfuse.com/docs/observability/best-practices)
Copy page
# [What does a good trace look like?](https://langfuse.com/docs/observability/best-practices#what-does-a-good-trace-look-like)
You see traces appearing in Langfuse, but how do you know if you've done it well? Here are a couple of things you can look at and optimize.
Trace structure is not just cosmetic — many Langfuse features build on top of it:
  * [LLM-as-a-judge evaluators](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) target observations by name and type, and read their input and output.
  * [Dashboards](https://langfuse.com/docs/metrics/features/custom-dashboards) filter and aggregate metrics by trace and observation names.
  * [Dataset experiments](https://langfuse.com/docs/evaluation/experiments) compare trace input and output across runs.
  * Saved views on the tracing table reference names and attributes.


A well-structured trace makes debugging faster today, and stable names with meaningful input/output keep your evaluators, dashboards, and experiments working as your application evolves.
## [What's the scope of one trace?](https://langfuse.com/docs/observability/best-practices#whats-the-scope-of-one-trace)
Langfuse's [data model](https://langfuse.com/docs/observability/data-model) has three levels of grouping: observations (individual steps) are grouped into traces via a `trace_id`, and traces can be grouped into sessions via a `session_id`.
A trace represents one self-contained unit of work in your application. Good examples of a typical trace:
  * One chatbot turn (user sends a message, your app retrieves context, calls the LLM, returns a response)
  * One agent run (the agent receives a task, reasons, calls tools, and produces a result)
  * One pipeline execution (a document comes in, gets chunked, embedded, and stored)


If multiple of these happen in sequence, e.g. a multi-turn conversation, or several agent runs that feed into a final report, that's where [sessions](https://langfuse.com/docs/observability/features/sessions) come in. Each step is its own trace, and the session ties them together. For a chatbot this means one trace per turn and one session per conversation — you don't know upfront when a conversation ends, and the per-turn model keeps traces small and easy to navigate in the session view.
A trace shows up in the Langfuse UI as a trace tree and an [agent graph](https://langfuse.com/docs/observability/features/agent-graphs):
## [Look at the trace tree](https://langfuse.com/docs/observability/best-practices#look-at-the-trace-tree)
When you click on a trace, you see the trace tree. There are a few things you can check:
### [Are the right steps showing up?](https://langfuse.com/docs/observability/best-practices#are-the-right-steps-showing-up)
You should see your LLM calls, tool calls, and other important steps represented in the tree. They should have the correct [observation type](https://langfuse.com/docs/observability/features/observation-types).
For example
  * an LLM call should show up as a `generation`. This is important because a `generation` can carry [cost, token usage, and model information](https://langfuse.com/docs/observability/best-practices#track-model-tokens-and-cost-on-generations).
  * a tool call should show up as a `tool`. You can then filter on tool call observations when you create [LLM-as-a-judge](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) evaluators.


Framework integrations typically set these types automatically. If you're instrumenting manually, you can set them via the `as_type` parameter (Python) or `asType` (JS/TS). See the [observation types docs](https://langfuse.com/docs/observability/features/observation-types) for a full list.
### [Is it nested correctly?](https://langfuse.com/docs/observability/best-practices#is-it-nested-correctly)
A tool call should nest under the `agent` or `span` [observation](https://langfuse.com/docs/observability/data-model#observations-traces-and-sessions) that orchestrates the step, as a sibling of the `generation` that requested it, so the tree shows which step each action belongs to instead of leaving tool calls dangling at the trace root.
Framework integrations usually get this right automatically. If you're instrumenting manually, see [nesting observations](https://langfuse.com/docs/observability/sdk/instrumentation#nesting-observations).
**Beware of aggregating LLM calls.** You should see a `generation` for each model invocation in an agent loop, interleaved with the `tool` calls it requested. Avoid wrapping the whole loop in one parent generation that only records the final output. This would make it impossible to:
  * see what the agent decided after each tool result
  * see the [thinking](https://langfuse.com/docs/observability/best-practices#capture-thinking) behind each decision
  * see which tool call has blown up your agent's context window (useful when optimizing cost)


**One generation wrapping the whole loop.** You only see aggregated cost and the final output.
**Each model invocation as its own generation.** You can see thinking, tokens, and cost after every step.
### [Is thinking captured?](https://langfuse.com/docs/observability/best-practices#capture-thinking)
Reasoning models produce **thinking** (also called **reasoning**) before they answer or call a tool. You should always capture thinking on each `generation` in the tree. Thinking data is instrumental in debugging why the agent made certain decisions, like calling a specific tool/endpoint/etc.
### [Is there noise you don't need?](https://langfuse.com/docs/observability/best-practices#is-there-noise-you-dont-need)
Not every observation in the tree is useful for understanding what your application did. HTTP [observations](https://langfuse.com/docs/observability/data-model#observations-traces-and-sessions), database queries, and framework internals often add clutter without giving you meaningful insight. If you see observations like these polluting your trace tree, you can [filter them out](https://langfuse.com/faq/all/unwanted-http-database-spans).
## [Choose good names](https://langfuse.com/docs/observability/best-practices#choose-good-names)
Observation- and trace names are used in many places:
  * When setting up [LLM-as-a-judge evaluators](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge), you target specific observations by name.
  * In [dashboards](https://langfuse.com/docs/metrics/features/custom-dashboards), you can filter and aggregate metrics by observation name.
  * In the tracing table, names help you quickly identify what each step does.


Because names are referenced in all these places, treat them like an API: when a name changes, evaluators, dashboard queries, and saved filters that target the old name silently stop matching. Pick names deliberately, and expect to keep them stable.
**Use active language.** Name observations after the action they perform, verb first: `classify-intent`, `retrieve-context`, `generate-response`, `summarize-results`. This makes the trace tree read like a description of what your application did, and makes filtering on a specific step easier.
**Keep dynamic values out of names.** Use `process-order`, not `process-order-8945` or `generate-response-retry-2`. A name should identify the operation, not a single execution of it — otherwise every trace produces new names and you can no longer group, filter, or target them. Put run-specific values in [metadata](https://langfuse.com/docs/observability/features/metadata) instead. (This is the same low-cardinality rule that OpenTelemetry recommends for span names.)
Try not to name observations after the AI model used (`gpt-4o`, `claude-sonnet`). All filters, evaluators, and dashboards that reference the name break as soon as you swap models. The model is already a separate attribute on `generation` observations, use that instead.
## [Choose meaningful input and output](https://langfuse.com/docs/observability/best-practices#choose-meaningful-input-and-output)
In general, it's recommended that operations have an input and/or output. If an observation has neither, ask yourself if an observation is actually useful or if you can drop it.
The **root observation** deserves the most care: the trace-level input and output are derived from it. They are shown in the tracing table, read by evaluators, and compared across runs in [dataset experiments](https://langfuse.com/docs/evaluation/experiments). Set them to what a reviewer needs at a glance — for a chatbot, the user message as input and the assistant response as output — not a raw JSON blob of function arguments. If you need the raw payload for debugging, put it in [metadata](https://langfuse.com/docs/observability/features/metadata).
For your **most viewed observations** , take some extra care to set them up. You will likely create pre-filtered views on your tracing and session screens. The observations you filter for here are the ones that will get looked at the most. For these, ask yourself: **what do I need to see to quickly evaluate a trace/session at a glance?**
Typical input/output for `GENERATION` observations:
  * For a chatbot: the user message (input) and the assistant response (output).
  * For a RAG pipeline: the user query and the generated answer.
  * For a classification task: the text being classified and the predicted label.


Most inputs/outputs can be rendered as a readable, role-labeled conversation rather than a raw JSON blob. If yours show up as raw JSON, you can take a look at the formatting: it should be a list of messages in the standard OpenAI format (each with a `role` and `content`), and it renders tool calls as cards only when they sit in an assistant message's `tool_calls` array with each call's `arguments` given as a JSON-encoded string (for example `"{\"location\": \"Paris\"}"`).
If your input and output fields are showing up empty unintentionally, see [why are the input and output of my trace empty?](https://langfuse.com/faq/all/empty-trace-input-and-output)
## [Useful attributes](https://langfuse.com/docs/observability/best-practices#useful-attributes)
Observations have a number of attributes that can be useful for your use cases. These will allow you to go even further with filtering, scoring, and making dashboards.
### [Add metadata for context](https://langfuse.com/docs/observability/best-practices#add-metadata-for-context)
[Metadata](https://langfuse.com/docs/observability/features/metadata) is a flexible key-value store on each observation. It's the right place for anything that is useful context but doesn't belong in the name or the input/output. Examples of metadata that is useful in practice:
  * **Evaluation context** : Ground truth, expected behavior, or other context an [LLM-as-a-judge evaluator](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) needs but that isn't part of the actual input/output. Evaluators can reference metadata fields in their variable mapping.
  * **Request context** : Internal request IDs, the API route or app version that handled the request, or the experiment variant / feature flags that were active. This lets you correlate a trace with your other systems and filter by rollout.
  * **Retrieval context** : For RAG steps, things like the data source, number of chunks retrieved, or the index queried — useful when debugging why a retrieval step returned poor results.
  * **Raw payloads** : Full request/response objects that would clutter the input/output fields but are occasionally needed for debugging.
  * **Annotation context** : When doing manual review, metadata gives annotators extra information to make better judgments.


You can filter by metadata keys in the Langfuse UI, which is helpful when you need to find traces with specific characteristics.
### [Track model, tokens, and cost on generations](https://langfuse.com/docs/observability/best-practices#track-model-tokens-and-cost-on-generations)
If you want to understand what your LLM usage costs, broken down by model, by user, by feature, you need three things on your `generation` observations:
  * **Model name** : Langfuse uses this to look up pricing in the [model pricing table](https://langfuse.com/docs/model-usage-and-cost). If the model name doesn't match, Langfuse can't calculate cost automatically.
  * **Usage details** : Input tokens, output tokens, and optionally cached tokens. This is what powers the token usage views in dashboards.
  * **Cost details** (optional): If you want to override Langfuse's automatic pricing — for example, if you have a custom pricing agreement — you can pass cost explicitly.


Most [integrations](https://langfuse.com/integrations) capture all of this automatically. If you're instrumenting manually, see the [token and cost tracking docs](https://langfuse.com/docs/observability/features/token-and-cost-tracking).
You can see these attributes on the `GENERATION` observation in the Langfuse UI.
### [Use tags for business-level dimensions](https://langfuse.com/docs/observability/best-practices#use-tags-for-business-level-dimensions)
[Tags](https://langfuse.com/docs/observability/features/tags) enable filtering and metric breakdowns across dimensions that matter to your business. Good tags answer questions like "how does latency differ between our `web` and `api` users?".
One property of tags is that they are **immutable and must be set at observation creation time**. This makes them great for things you know upfront (where the request came from, which feature it's part of), but not for things you learn later.
If you need to label traces based on something determined after the fact, like an [LLM-as-a-judge](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) evaluation result, use [scores](https://langfuse.com/docs/evaluation/overview) instead.
### [Link prompts to traces](https://langfuse.com/docs/observability/best-practices#link-prompts-to-traces)
If you [manage your prompts in Langfuse](https://langfuse.com/docs/prompt-management), you can [link them to your generations](https://langfuse.com/docs/prompt-management/features/link-to-traces). This lets you see which prompt version was used for a given trace, and track how metrics change across prompt versions. Useful when you're iterating on prompts and want to compare performance.
### [Set the environment](https://langfuse.com/docs/observability/best-practices#set-the-environment)
Set the [environment](https://langfuse.com/docs/observability/features/environments) attribute (`production`, `staging`, `development`) so that your test traces don't pollute production dashboards and evaluations.
### [Track users with user IDs](https://langfuse.com/docs/observability/best-practices#track-users-with-user-ids)
Setting the [user ID](https://langfuse.com/docs/observability/features/users) connects traces to specific users, which unlocks per-user views in Langfuse. Useful if you want to answer questions like:
  * Which users are costing us the most?
  * How does output quality vary across users?
  * What does a specific user's usage pattern look like?


### [Group related traces with session IDs](https://langfuse.com/docs/observability/best-practices#group-related-traces-with-session-ids)
If your application involves multiple traces that logically belong together, group them into a [session](https://langfuse.com/docs/observability/features/sessions). This gives you a session replay view where you can see the full interaction in sequence.
This makes sense when:
  * You're building a chatbot (each user message creates a new trace, but the whole conversation is one session)
  * You have multiple agents that each contribute to a final output (e.g., five agents that collaborate to produce a report)
  * Your workflow spans multiple requests with human-in-the-loop steps in between


If your application is single-request/single-response with no continuity between calls, you probably don't need sessions.
#### [How to instrument traces with session IDs](https://langfuse.com/docs/observability/best-practices#session-trace)
To get a readable conversation in the session view:
  * **Group the turns:** Set the same session ID (`session_id` in Python, `sessionId` in JS/TS) on every trace in the conversation. See the [session setup examples](https://langfuse.com/docs/observability/features/sessions#set-up-sessions).
  * **Repeat the conversation history:** Record each generation's input and output as role-labeled messages (`system`, `user`, `assistant`, `tool`). In each later generation's input, include the earlier messages followed by the new user message. Repeating that history across generations is how the session view connects the turns. Keep it faithful to what the model saw; put unrelated diagnostics in metadata. System messages alone do not connect turns.
  * **Match tool calls to results:** Give each tool call a unique ID and include that same ID with its result.


## [Multi-modal traces](https://langfuse.com/docs/observability/best-practices#multi-modal-traces)
Put user-provided images in the `user` message of a generation's input, and model-generated images in generation output. Use a supported content part or a Langfuse media reference; see [Multi-Modality and Attachments](https://langfuse.com/docs/observability/features/multi-modality).
Was this page helpful?
Last updated on 10/14/2026
[PreviousConcepts](https://langfuse.com/docs/observability/data-model)[NextSessions](https://langfuse.com/docs/observability/features/sessions)
### On this page
[What does a good trace look like?](https://langfuse.com/docs/observability/best-practices#what-does-a-good-trace-look-like)[What's the scope of one trace?](https://langfuse.com/docs/observability/best-practices#whats-the-scope-of-one-trace)[Look at the trace tree](https://langfuse.com/docs/observability/best-practices#look-at-the-trace-tree)[Are the right steps showing up?](https://langfuse.com/docs/observability/best-practices#are-the-right-steps-showing-up)[Is it nested correctly?](https://langfuse.com/docs/observability/best-practices#is-it-nested-correctly)[Is thinking captured?](https://langfuse.com/docs/observability/best-practices#capture-thinking)[Is there noise you don't need?](https://langfuse.com/docs/observability/best-practices#is-there-noise-you-dont-need)[Choose good names](https://langfuse.com/docs/observability/best-practices#choose-good-names)[Choose meaningful input and output](https://langfuse.com/docs/observability/best-practices#choose-meaningful-input-and-output)[Useful attributes](https://langfuse.com/docs/observability/best-practices#useful-attributes)[Add metadata for context](https://langfuse.com/docs/observability/best-practices#add-metadata-for-context)[Track model, tokens, and cost on generations](https://langfuse.com/docs/observability/best-practices#track-model-tokens-and-cost-on-generations)[Use tags for business-level dimensions](https://langfuse.com/docs/observability/best-practices#use-tags-for-business-level-dimensions)[Link prompts to traces](https://langfuse.com/docs/observability/best-practices#link-prompts-to-traces)[Set the environment](https://langfuse.com/docs/observability/best-practices#set-the-environment)[Track users with user IDs](https://langfuse.com/docs/observability/best-practices#track-users-with-user-ids)[Group related traces with session IDs](https://langfuse.com/docs/observability/best-practices#group-related-traces-with-session-ids)[How to instrument traces with session IDs](https://langfuse.com/docs/observability/best-practices#session-trace)[Multi-modal traces](https://langfuse.com/docs/observability/best-practices#multi-modal-traces)
Actions
[Give us feedback](https://github.com/langfuse/langfuse-docs/issues/new?title=Feedback+for+https%3A%2F%2Flangfuse.com%2Fdocs%2Fobservability%2Fbest-practices&labels=feedback)[Edit this page on GitHub](https://github.com/langfuse/langfuse-docs/edit/main/content/docs/observability/best-practices.mdx)
Contributors
Last edited Oct 14, 2026
[Marlies Mayerhofer](https://github.com/marliessophie)[Lotte Verheyden](https://github.com/Lotte-Verheyden)[Jannik Maierhöfer](https://github.com/jannikmaierhoefer)
`Ask AI``A`
