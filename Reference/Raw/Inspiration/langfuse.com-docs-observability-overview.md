DocsOverview
Copy page
# [Observability & Application Tracing](https://langfuse.com/docs/observability/overview#observability--application-tracing)
Generative AI systems are inherently non-deterministic. Therefore, debugging your application without any observability tool is more like guesswork. Implementing comprehensive AI observability gives you the tools to understand what's happening inside your application and why. It also gives your evaluations real production traces to run on, so you can continuously measure and improve your system.
The core of this is **application tracing** — structured logs of every request that capture the exact prompt sent, the model's response, token usage, latency, and any tools or retrieval steps in between.
Here's an example of a trace in the Langfuse UI:
🎥
[**Watch this walkthrough**](https://langfuse.com/watch-demo) of Langfuse Observability and how to integrate it with your application.
## [Getting Started](https://langfuse.com/docs/observability/overview#getting-started)
Start by [setting up your first trace](https://langfuse.com/docs/observability/get-started), and compare it against our [best practices guide](https://langfuse.com/docs/observability/best-practices) so you're set up for success. If you're new to AI observability, take a look at the [core concepts](https://langfuse.com/docs/observability/data-model) too.
## [Use your traces](https://langfuse.com/docs/observability/overview#sidebar-folder-docs-observability-features)
Once traces are coming in, the next step is to make sense of them and use what you learn to improve your agent. Read the chapter on [Monitoring in the Langfuse Academy](https://langfuse.com/academy/monitoring) to learn how to utilize your traces well.
For feature-specific implementation guidance, these are the most common ones to start with:
  * Track [model usage and cost](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
  * Monitor application quality with [scores](https://langfuse.com/docs/evaluation/scores/overview)
  * Analyze cost, latency, volume, and quality in [custom dashboards](https://langfuse.com/docs/metrics/features/custom-dashboards)
  * Get notified when a metric crosses a threshold with [alerts](https://langfuse.com/docs/observability/features/alerts)


Browse the [Features section](https://langfuse.com/docs/observability/overview#sidebar-folder-docs-observability-features) in the sidebar for a complete list of observability features.
What is the difference between observability and tracing?
+
**Observability** is the broader capability of understanding the internal state of your system from its outputs. It encompasses tracing, metrics, and logging. **Tracing** is a specific observability technique that records the flow of a request through your system, preserving causal relationships between operations. In the context of LLM applications, tracing is the most important observability tool because it captures the full context of each request — prompts, responses, tool calls, and their relationships.
What is application tracing?
+
Application tracing records the complete lifecycle of a request as it flows through your system. Each trace captures every operation — LLM calls, retrieval steps, tool executions, and custom logic — along with timing, inputs, outputs, and metadata. This gives you full visibility into what happened during each request, enabling debugging, performance optimization, and quality monitoring.
How does Langfuse compare to other tracing solutions?
+
Langfuse is purpose-built for LLM applications, which means it natively understands LLM-specific concepts like token usage, model parameters, prompt/completion pairs, and evaluation scores. Unlike general-purpose APM tools, Langfuse provides features specific to AI engineering: [LLM-as-a-Judge evaluation](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge), [prompt management](https://langfuse.com/docs/prompt-management/overview), [experiments and datasets](https://langfuse.com/docs/evaluation/experiments/datasets), and [custom dashboards](https://langfuse.com/docs/metrics/features/custom-dashboards). It's also [open source](https://langfuse.com/self-hosting) and can be self-hosted.
Does Langfuse add latency to my application?
+
No. Langfuse SDKs send tracing data asynchronously in the background. Trace events are queued locally and flushed in batches, so your application's response time is not affected. See [queuing and batching](https://langfuse.com/docs/observability/features/queuing-batching) for details.
Ask another question
Was this page helpful?
Last updated on 10/8/2026
[PreviousAsk AI](https://langfuse.com/docs/ask-ai)[NextGet Started](https://langfuse.com/docs/observability/get-started)
### On this page
[Observability & Application Tracing](https://langfuse.com/docs/observability/overview#observability--application-tracing)[Getting Started](https://langfuse.com/docs/observability/overview#getting-started)[Use your traces](https://langfuse.com/docs/observability/overview#sidebar-folder-docs-observability-features)[FAQ](https://langfuse.com/docs/observability/overview#faq)
Actions
[Give us feedback](https://github.com/langfuse/langfuse-docs/issues/new?title=Feedback+for+https%3A%2F%2Flangfuse.com%2Fdocs%2Fobservability%2Foverview&labels=feedback)[Edit this page on GitHub](https://github.com/langfuse/langfuse-docs/edit/main/content/docs/observability/overview.mdx)
Contributors
Last edited Oct 8, 2026
[Lotte Verheyden](https://github.com/Lotte-Verheyden)[Jannik Maierhöfer](https://github.com/jannikmaierhoefer)[Marc Klingen](https://github.com/marcklingen)+3 more
`Ask AI``A`
