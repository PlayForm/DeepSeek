Docs
Copy page
# [Langfuse Overview](https://langfuse.com/docs#langfuse-overview)
Langfuse is an open-source AI engineering platform ([GitHub](https://github.com/langfuse/langfuse)) that helps teams collaboratively debug, analyze, and iterate on their AI agent applications. All platform features are natively integrated to accelerate the development workflow. Langfuse is open, self-hostable, and extensible ([_why Langfuse?_](https://langfuse.com/why)).
### Observability
  * Log traces
  * Lowest level transparency
  * Understand cost and latency


### Prompts
  * Version control and deploy
  * Collaborate on prompts
  * Test prompts and models


### Evaluation
  * Measure output quality
  * Monitor production health
  * Test changes in development


### Platform
  * API-first architecture
  * Data exports to blob storage
  * Enterprise security and administration


## [Observability](https://langfuse.com/docs#observability)
[Observability](https://langfuse.com/docs/observability/overview) is essential for understanding and debugging AI agent applications. Unlike traditional software, AI agent applications involve complex, non-deterministic interactions that can be challenging to monitor and debug. Langfuse provides comprehensive tracing capabilities that help you understand exactly what's happening in your application.
  * Traces include all LLM and non-LLM calls, including retrieval, embedding, API calls, and more
  * Support for tracking multi-turn conversations as sessions and user tracking
  * Agents can be represented as graphs
  * Capture traces via our native SDKs for Python/JS, 100+ library/framework integrations, OpenTelemetry, or via an LLM Gateway such as LiteLLM
  * Based on OpenTelemetry to increase compatibility and reduce vendor lock-in


Want to see an example? Play with the [interactive demo](https://langfuse.com/docs/demo).
🎥
Want to learn more?
[Watch end-to-end walkthrough](https://langfuse.com/watch-demo) of Langfuse Observability and how to integrate it with your application.
Trace DetailsSessionsTimelineUsersAgent GraphsDashboardAlerts
Traces allow you to track every LLM call and other relevant logic in your app.
Sessions allow you to track multi-step conversations or agentic workflows.
Debug latency issues by inspecting the timeline view.
Add your own `userId` to monitor costs and usage for each user. Optionally, create a deep link to this view in your systems.
LLM agents can be visualized as a graph to illustrate the flow of complex agentic workflows.
See quality, cost, and latency metrics in the dashboard to monitor your LLM application.
Get notified over Slack, GitHub Actions, or Webhooks when a metric crosses a threshold with [alerts](https://langfuse.com/docs/observability/features/alerts).
## [Prompt Management](https://langfuse.com/docs#prompts)
[Prompt Management](https://langfuse.com/docs/prompt-management/overview) is critical in building effective AI applications. Langfuse provides tools to help you manage, version, and optimize your prompts throughout the development lifecycle.
  * [Get started](https://langfuse.com/docs/prompt-management/get-started) with prompt management
  * Manage, version, and optimize your prompts throughout the development lifecycle
  * Test prompts interactively in the [LLM Playground](https://langfuse.com/docs/prompt-management/features/playground)
  * Run [Experiments](https://langfuse.com/docs/evaluation/features/prompt-experiments) against datasets to test new prompt versions directly within Langfuse


🎥
Want to learn more? [**Watch end-to-end walkthrough**](https://langfuse.com/watch-demo) of Langfuse Prompt Management and how to integrate it with your application.
CreateVersion ControlDeployMetricsTest in PlaygroundLink with TracesTrack Changes
Create a new prompt via UI, SDKs, or API.
Collaboratively version and edit prompts via UI, API, or SDKs.
Deploy prompts to production or any environment via labels - without any code changes.
Compare latency, cost, and evaluation metrics across different versions of your prompts.
Instantly test your prompts in the playground.
Link prompts with traces to understand how they perform in the context of your LLM application.
Track changes to your prompts to understand how they evolve over time.
## [Evaluation](https://langfuse.com/docs#evaluation)
[Evaluation](https://langfuse.com/docs/evaluation/overview) is crucial for ensuring the quality and reliability of your LLM applications. Langfuse provides flexible evaluation tools that adapt to your specific needs, whether you're testing in development or monitoring production performance.
  * [Evaluate Production Traffic](https://langfuse.com/docs/evaluation/get-started/online) to score live production traces
  * Get started with different [evaluation methods](https://langfuse.com/docs/evaluation/overview): LLM-as-a-judge, code evaluators, user feedback, manual labeling, or custom pipelines
  * Identify issues early by running evaluations on production traces
  * Create and manage [Datasets](https://langfuse.com/docs/evaluation/features/datasets) for systematic testing in development that ensure your application performs reliably across different scenarios
  * Run [Experiments](https://langfuse.com/docs/evaluation/core-concepts#experiments) to systematically test your LLM application


🎥
Want to learn more? [**Watch end-to-end walkthrough**](https://langfuse.com/watch-demo) of Langfuse Evaluation and how to use it to improve your LLM application.
AnalyticsUser FeedbackLLM-as-a-JudgeExperimentsAnnotation QueueCustom Evals
Plot evaluation results in the Langfuse Dashboard.
Collect feedback from your users. Can be captured in the frontend via our Browser SDK, server-side via the SDKs or API. Video includes example application.
Run fully managed LLM-as-a-judge evaluations on production or development traces. Can be applied to any step within your application for step-wise evaluations.
Evaluate prompts and models on datasets directly in the user interface. No custom code is needed.
Baseline your evaluation workflow with human annotations via Annotation Queues.
Add custom evaluation results, supports numeric, boolean and categorical values.

```
POST /api/public/scores
```

Add scores via Python or JS SDK.
Example (Python)

```
from langfuse import get_client

langfuse = get_client()

langfuse.create_score(
  trace_id="123",
  name="my_custom_evaluator",
  value=0.5,

```

## [Where to start?](https://langfuse.com/docs#where-to-start)
Setting up the full process of online tracing, prompt management, production evaluations to identify issues, and offline evaluations on datasets requires some time. Most teams eventually end up with a process that looks like this:
Deploy
[Online Trace traces · sessions · agents · prompts](https://langfuse.com/academy/tracing)[Online Monitor dashboards · LLM-as-judge · feedback](https://langfuse.com/academy/monitoring)[Offline Build datasets datasets · features-as-tests](https://langfuse.com/academy/datasets)[Offline Experiment prompts · models · code variants](https://langfuse.com/academy/experiments)[Offline Evaluate judges · custom evals · annotation](https://langfuse.com/academy/evaluate)
If you're new to AI engineering, take a look at the [Academy](https://langfuse.com/academy), where you'll find conceptual guidance on how to approach AI engineering, trade-offs, and best practices. If you already know what you want, [the getting-started guides below](https://langfuse.com/docs#quickstarts) will get you going.
💡
Tip: let your coding agent do the setup and work with Langfuse through the [Agent Skill](https://langfuse.com/docs/api-and-data-platform/features/agent-skill), [CLI](https://langfuse.com/docs/api-and-data-platform/features/cli), or [MCP server](https://langfuse.com/docs/api-and-data-platform/features/mcp-server). On Langfuse Cloud, you can also ask [Halo](https://langfuse.com/docs/api-and-data-platform/features/halo), the Langfuse assistant, about your project data from inside the app.
## [Quickstarts](https://langfuse.com/docs#quickstarts)
Get up and running with Langfuse in minutes. Choose the path that best fits your current needs:
### [Integrate LLM Application/Agent Tracing](https://langfuse.com/docs/observability/get-started)### [Integrate Prompt Management](https://langfuse.com/docs/prompt-management/get-started)### [Setup Evaluations](https://langfuse.com/docs/evaluation/get-started/online)
## [Why Langfuse?](https://langfuse.com/docs#why-langfuse)
  * **Open source:** Fully open source with public API for custom integrations
  * **Production optimized:** Designed with minimal performance overhead
  * **Best-in-class SDKs:** Native SDKs for Python and JavaScript
  * **Framework support:** Integrated with popular frameworks like OpenAI SDK, LangChain, and LlamaIndex
  * **Multi-modal:** Support for tracing text, images and other modalities
  * **Full platform:** Suite of tools for the complete LLM application development lifecycle


## [Community & Contact](https://langfuse.com/docs#community--contact)
We actively develop Langfuse in [open source](https://langfuse.com/open-source) together with our community:
  * Contribute and vote on the Langfuse [roadmap](https://langfuse.com/docs/roadmap).
  * Ask questions on [GitHub Discussions](https://langfuse.com/gh-support) or private [support channels](https://langfuse.com/support).
  * Report bugs via [GitHub Issues](https://langfuse.com/issue).
  * Chat with the community on [Discord](https://langfuse.com/discord).
  * Join a [community hour](https://langfuse.com/events) to talk to the team and ask questions live.


Langfuse evolves quickly, check out the [changelog](https://langfuse.com/changelog) for the latest updates. Subscribe to the **mailing list** to get notified about new major features:
Was this page helpful?
Last updated on 10/27/2026
[NextExample Project](https://langfuse.com/docs/demo)
### On this page
[Langfuse Overview](https://langfuse.com/docs#langfuse-overview)[Observability](https://langfuse.com/docs#observability)[Prompt Management](https://langfuse.com/docs#prompts)[Evaluation](https://langfuse.com/docs#evaluation)[Where to start?](https://langfuse.com/docs#where-to-start)[Quickstarts](https://langfuse.com/docs#quickstarts)[Why Langfuse?](https://langfuse.com/docs#why-langfuse)[Community & Contact](https://langfuse.com/docs#community--contact)
Actions
[Give us feedback](https://github.com/langfuse/langfuse-docs/issues/new?title=Feedback+for+https%3A%2F%2Flangfuse.com%2Fdocs&labels=feedback)[Edit this page on GitHub](https://github.com/langfuse/langfuse-docs/edit/main/content/docs/index.mdx)
Contributors
Last edited Oct 27, 2026
[Lotte Verheyden](https://github.com/Lotte-Verheyden)[Jannik Maierhöfer](https://github.com/jannikmaierhoefer)[Marc Klingen](https://github.com/marcklingen)+7 more
`Ask AI``A`
