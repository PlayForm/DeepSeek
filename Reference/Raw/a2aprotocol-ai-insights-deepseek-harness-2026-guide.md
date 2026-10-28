[Skip to content](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#main-content)
[SponsoredImage to Layers — No Photoshop Skills NeededTry ImageLayered ↗](https://imagelayered.com/image-to-layers?utm_source=a2aprotocol&utm_medium=referral)
# DeepSeek Harness 2026: Everything Is a Plugin — Developer Preview Guide
## 🎯 Core Takeaways (TL;DR)
  * **DeepSeek Harness** (CLI name `dsh`) opened its v0.1 developer preview to the global harness developer community on August 13, 2026, with the full source released under the **MIT license** on GitHub.
  * The defining design principle of **DeepSeek Harness** is **"everything is a plugin"** : models, tools, skills, sessions, sandboxes, storage, loops, scheduling, and UI are all Cordis plugins that can be freely swapped, replaced, and recombined — no source changes required.
  * **DeepSeek Harness** ships four run modes — Standard, PTC (Programmatic Tool Calling), Minimal, and Creation — each loading a different default plugin set for a different use case.
  * Every run of **DeepSeek Harness** is fully traceable: everything the model sees is written to an append-only session log, viewable by source in the Trajectory view, with resume, fork, retrieval, and replay all sharing the same event stream.
  * You can try **DeepSeek Harness** in under a minute: `npx @deepseek-ai/dsh web` starts the Web UI at `http://127.0.0.1:3080`.


## Table of Contents
  1. [What Is DeepSeek Harness?](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#what-is-deepseek-harness)
  2. [The "Everything Is a Plugin" Philosophy](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#everything-is-a-plugin)
  3. [Four Run Modes of DeepSeek Harness](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#four-run-modes)
  4. [Append-Only Session Logs and the Trajectory View](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#session-logs)
  5. [Architecture: Profiles, Bundles, and Core Packages](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#architecture)
  6. [How to Get Started with DeepSeek Harness](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#getting-started)
  7. [Building Plugins for DeepSeek Harness](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#building-plugins)
  8. [DeepSeek Harness vs. Other Agent Harnesses](https://a2aprotocol.ai/insights/deepseek-harness-2026-guide#comparison)


## What Is DeepSeek Harness?
**DeepSeek Harness** is an open-source agent harness developed by DeepSeek AI. It is the infrastructure layer that sits between a large language model and the tools, files, and environments an agent needs to get work done. Where many harnesses hard-code their components, **DeepSeek Harness** takes a radically different approach: every capability is a plugin, and the harness itself is just a composition of plugins.
On August 13, 2026, the DeepSeek Harness team announced the v0.1 developer preview, opening testing to harness developers worldwide and releasing the source code under the MIT license. The announcement, published on the team's official WeChat channel, was explicit that v0.1 is an early preview: many details are still being polished, and core plugins and base interfaces will iterate quickly in the coming releases. The team is inviting feedback from the global harness developer community as it builds out the DSH plugin ecosystem.
The project lives at `github.com/deepseek-ai/deepseek-harness`, is powered by the Cordis plugin framework, and is currently at version `0.1.0-rc.5` in its repository. The monorepo is organized into `apps/` (the `cli` and `web` applications) and `packages/` (core, llm, mcp, sandbox, context, plan, goal, and dozens more), which gives you a sense of the breadth of capabilities **DeepSeek Harness** composes out of the box.
> 💡 **Professional Tip:** Because **DeepSeek Harness** is in developer preview, expect compatibility-breaking changes. Pin the version you build against, and follow the GitHub repository for release notes before upgrading.
## The "Everything Is a Plugin" Philosophy
The single most important idea in **DeepSeek Harness** is stated in its own documentation: everything is a plugin. The architecture is built on the Cordis plugin system, which is designed for spatiotemporal composability — a programming paradigm described in the Cordis paper, _A Programming Paradigm for Spatiotemporal Composability_.
Cordis acts as a meta-framework: it is responsible only for loading and unloading plugins and managing their dependencies. Every concrete component of **DeepSeek Harness** — the model adapter, the tool registry, the session log, the agent loop itself — is a different Cordis plugin. Plugins cooperate through Cordis services and typed events, and they can be freely combined at the configuration layer.
What this means in practice is that developers do not need to modify the source code of **DeepSeek Harness** to independently select, replace, or extend any of its capabilities. If you want a different model provider, you swap the model plugin. If you want a different sandbox, you swap the sandbox plugin. If you want a completely different agent loop, you mount your own. There is no privileged core to patch — you extend **DeepSeek Harness** by mounting a plugin beside the others, and registrations are effects that unwind cleanly when their plugin unloads.
> ✅ **Best Practice:** Treat every capability of **DeepSeek Harness** as replaceable. Before writing custom code, check whether a plugin already exists — the ecosystem is designed so that composition beats modification.
## Four Run Modes of DeepSeek Harness
For different usage scenarios, **DeepSeek Harness** provides four modes, each of which loads a different default set of plugins:  
| Mode  | What It Loads  | Best For  |  
| --- | --- | --- |  
| Standard  | A complete tool set  | Everyday agentic work  |  
| PTC  | Programmatic Tool Calling — the model generates one piece of code that composes multiple tool calls  | Complex multi-step tool workflows  |  
| Minimal  | Only one shell tool and one file-edit tool  | Model benchmarking in minimal environments  |  
| Creation  | Inspect the current runtime, experiment with Cordis plugins in memory, and compose new modes  | Building and testing new plugin combinations  |  
The PTC mode deserves special attention. Programmatic Tool Calling is a distinctive design in **DeepSeek Harness** : instead of the model making many individual tool calls, the model generates a single piece of code that orchestrates multiple tool calls in sequence. This reduces round trips, improves reliability, and gives the model a more expressive way to compose tools.
The Creation mode is equally interesting for plugin developers. It lets you inspect the running runtime, experiment with Cordis plugins in memory, and compose and create new modes from what you learn — a sandbox for designing the next configuration of **DeepSeek Harness** without restarting anything.
## Append-Only Session Logs and the Trajectory View
One of the most developer-friendly features of **DeepSeek Harness** is its observability story. Every run is traceable: everything the model sees is written to an append-only session log, including system prompts, chain-of-thought, tool calls and their results, sub-agent scheduling, and every context injection.
In the Trajectory view, you can inspect all of this information by source. Because the log is append-only, nothing is ever silently rewritten — the record of what happened is preserved exactly as it occurred. Resume, fork, retrieval, and replay all share the same event stream, which means you can pick up a session where it left off, branch it into a new direction, search through its history, or replay it to understand what happened.
This design has practical consequences for debugging. When an agent run goes wrong, the session log of **DeepSeek Harness** shows you precisely what the model saw at every step — the exact system prompt, the exact tool output, the exact context injection. For teams building production agents, this level of traceability is the difference between guessing and knowing.
## Architecture: Profiles, Bundles, and Core Packages
Under the hood, a running **DeepSeek Harness** is a plugin tree composed at boot from ordered layers. Two concepts organize this tree: profiles and bundles.
A **profile** is a named composition stored in the Harness home directory. It lists the bundles it stacks, holds any out-of-tree plugins it installs, and keeps the user's own `cordis.patch.yml`. The `web` and `headless` profiles ship as templates. A **bundle** is a distribution format for Cordis config rows and the code they mount, so whatever a bundle inserts stays patchable by the layers above it.
The base layer of every profile is `dsh-base`, which provides model adapters, tools, persistence, sandbox and approval policy, settings, credentials, and telemetry. `dsh-web-app` adds the browser application, and `dsh-headless` adds a one-shot runner with no server at all. You can inspect the exact tree your machine boots with:

```
dsh --profile web --dump-config

```

Any row printed by that command can be replaced by a patch of your own. The core packages of **DeepSeek Harness** map cleanly to responsibilities:  
| Package  | Owns  |  `ctx` key  |  
| --- | --- | --- |  
| `core/session`  | The append-only `SessionEvent` log and in-memory store  | `ctx.sessions`  |  
| `core/system-prompt`  | Prompt-section and tool-schema assembly  | `ctx.systemPrompt`  |  
| `core/tools`  | The scoped tool registry and guarded execution pipeline  | `ctx.tools`  |  
| `core/agent`  | The `Agent` interface, live registry, and `agent/*` events  | `ctx.agents`  |  
| `core/agent-loop`  | The default driver implementing that interface  | `ctx.agentLoop`  |  
| `core/scope`  | The per-agent scoped-registration primitive  | library, no key  |  
## How to Get Started with DeepSeek Harness
Getting started with **DeepSeek Harness** takes minutes. The quickest path is the Web UI:

```
npx @deepseek-ai/dsh web

```

This command starts the Web UI, served at `http://127.0.0.1:3080` by default. From there, the workflow is straightforward:
  1. **Configure a model** : open Settings → Models, enter a DeepSeek API key, and save it. The model route becomes usable immediately without restarting the server. Other providers and custom OpenAI-compatible endpoints are supported via the model configuration guide.
  2. **Choose a workspace** : click Choose workspace, add the project directory where you started `dsh`, and select it. The session composer stays unavailable until a workspace is selected.
  3. **Run a task** : start a session and send a prompt. The agent can read and edit workspace files, run commands, delegate work, and maintain a plan. The Web UI asks before operations that require approval under the active permission policy.


If you prefer to run from source:

```
git clone https://github.com/deepseek-ai/deepseek-harness
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web

```

The `dsh` process uses its invoking directory as the default filesystem location, and a fresh Web UI has no selected workspace until you add one. For headless automation, **DeepSeek Harness** also ships a one-shot runner profile with no server at all, plus a Python SDK for programmatic use.
> ⚠️ **Attention:** The `dsh` Web UI asks for approval before operations that require it under the active permission policy. Configure your permission policy deliberately before running untrusted tasks.
## Building Plugins for DeepSeek Harness
Because everything in **DeepSeek Harness** is a plugin, plugin development is the primary extension path. The architecture documentation recommends starting with the Cordis primer and tutorial before writing plugins, since the framework's model of services, typed events, and reversible effects is the foundation of the whole system.
A plugin in **DeepSeek Harness** contributes services, typed events, and reversible effects to a shared context. When a plugin unloads, its registrations unwind — there is no orphaned state. Plugins are distributed as bundles, declared in `package.json` under a `dsh` field: `dsh.profile` lists a profile's bundles, and `dsh.bundle` points at a bundle's patch file.
The practical workflow for plugin authors is: experiment in Creation mode, where you can inspect the runtime and test Cordis plugins in memory; then package your plugin as a bundle; then mount it in a profile, either by editing `cordis.patch.yml` or by passing a `--patch` overlay. The `--dump-config` command shows you the exact rows your machine boots, so you always know what to patch.
The DeepSeek Harness team is explicitly courting the plugin ecosystem: the announcement invites global harness developers to co-build the DSH plugin ecosystem on open, reusable, composable infrastructure. If you build a plugin, you can add the `dsh-plugin` topic to your repository for discoverability.
## DeepSeek Harness vs. Other Agent Harnesses
How does **DeepSeek Harness** compare to the agent harnesses most developers already know? The differences are mostly architectural:  
| Dimension  | DeepSeek Harness  | Typical Harness  |  
| --- | --- | --- |  
| Architecture  | Everything is a plugin (Cordis)  | Monolithic core + extensions  |  
| Extension path  | Mount a plugin, no source changes  | Fork or patch the core  |  
| Observability  | Append-only session log + Trajectory view  | Varies, often partial  |  
| Run modes  | Standard / PTC / Minimal / Creation  | Usually one mode  |  
| License  | MIT, open source  | Varies  |  
| Tool calling  | Classic + PTC (code-composed calls)  | Usually classic only  |  
The most consequential difference is the plugin seam. In **DeepSeek Harness** , there is no privileged core to patch — every component, including the agent loop itself, is replaceable from configuration. For teams that have hit the limits of a harness's extension points, that is a meaningful difference. The append-only session log is also ahead of most alternatives, which typically log tool calls but not every context injection.
## FAQ
### Q: Is DeepSeek Harness free and open source?
A: Yes. **DeepSeek Harness** is released under the MIT license, and the full source is available at `github.com/deepseek-ai/deepseek-harness`. The v0.1 developer preview opened to the global community on August 13, 2026.
### Q: How do I start DeepSeek Harness quickly?
A: Run `npx @deepseek-ai/dsh web` in a terminal with Node.js installed. The Web UI starts at `http://127.0.0.1:3080`. Then add a model API key in Settings → Models and choose a workspace.
### Q: What does "everything is a plugin" mean in practice?
A: It means every capability of **DeepSeek Harness** — models, tools, skills, sessions, sandboxes, storage, loops, scheduling, UI — is a Cordis plugin. You can select, replace, or extend any of them without modifying the source code of **DeepSeek Harness** itself.
### Q: What are the four modes of DeepSeek Harness?
A: Standard (complete tool set), PTC (programmatic tool calling, where the model writes code to compose tool calls), Minimal (one shell tool and one file-edit tool for benchmarking), and Creation (inspect the runtime and compose new modes in memory).
### Q: Can I use DeepSeek Harness with models other than DeepSeek's?
A: Yes. The model configuration guide covers other providers and custom OpenAI-compatible endpoints. The model adapter is itself a plugin, so it is replaceable by design.
### Q: Is DeepSeek Harness production-ready?
A: Not yet. v0.1 is an early developer preview with compatibility-breaking changes expected. It is ideal for experimentation, benchmarking, and plugin development, but teams should pin versions and follow the repository before relying on it in production.
## Conclusion
**DeepSeek Harness** enters the agent infrastructure landscape with a bold bet: that the right architecture for agent harnesses is one where everything is a plugin. By building on Cordis, releasing under MIT, and shipping four run modes plus an append-only session log, the DeepSeek Harness team has given developers a harness that is open, observable, and composable to its core.
The v0.1 developer preview is explicitly a starting point, not a finish line. The team is inviting global harness developers to co-build the DSH plugin ecosystem on open, reusable, composable infrastructure, and the plugin-first design makes that invitation concrete: anyone can mount a plugin beside the others, no fork required.
If you build agents, the practical next step is simple. Clone the repository, run `npx @deepseek-ai/dsh web`, and spend an hour in Creation mode experimenting with plugins. Whether **DeepSeek Harness** becomes your production harness or just informs how you think about harness architecture, the everything-is-a-plugin design is worth studying — and it is now open for everyone to explore.
## Discover Products
Discover useful AI products and services.
### [Decisions API](https://a2aprotocol.ai/products/decisions-api)
Decisions API brings multiple AI decision models into one workflow for classifying, scoring, routing, and evaluating text with structured outputs.
### [Decision API](https://a2aprotocol.ai/products/decision-api-1)
Build smarter AI workflows with a unified API for classification, scoring, routing, verification, and other structured decisions.
### [Jev AI Model](https://a2aprotocol.ai/products/jev-ai-model)
Try Jev AI Model online for free after sign in. Classify, score, and route text with structured results. Buy credits for API access.
The latest thinking
## Latest Insights
Fresh perspectives on AI, emerging technology, and products shaping the industry.
[Browse all insights ](https://a2aprotocol.ai/insights)
Oct 26, 2026
### [Understanding Learn Arduino: A Hands-On Introduction to the Arduino Uno](https://a2aprotocol.ai/insights/learn-arduino)
Learn how Learn Arduino pairs an interactive 3D Arduino Uno, guided lessons, board references, and starter sketches for beginners.
ArduinoElectronics
Oct 25, 2026
### [Understanding WikiMasters: Turn Wikipedia Topics into a Card Game](https://a2aprotocol.ai/insights/wikimasters)
Explore WikiMasters, a browser-based card collecting game built around French Wikipedia topics, trades, and knowledge-based duels.
GamesTrivia
Oct 25, 2026
### [Understanding VidRush: AI Production for Long-Form Videos](https://a2aprotocol.ai/insights/vidrush)
Explore VidRush's workflow for researching, scripting, narrating, and editing long-form videos from a creator's brief.
Video ProductionAI Video
