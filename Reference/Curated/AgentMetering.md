# Coding Agent Usage Metering

> Decision: Coding-agent vendors meter inference at the token, prompt, or request level, never at the file level, so a plugin that attributes inference cost per file must join two layers: a usage meter that reports tokens and dollars per model, and an agent-side event stream that names which files each turn or tool call touched. Claude Code is the closest model: the /usage Session block computes cost locally from per-model input, output, cache read, and cache write token counts, and the plan usage breakdown attributes usage to skills, subagents, plugins, and MCP servers, but stops short of files; its one per-file signal is a recommendation row that names a single file and its per-request token cost ("25% Trim ~/code/api/CLAUDE.md - 49k tokens per request"). GitHub Copilot meters one premium request per user prompt times a per-model multiplier and explicitly does not count autonomous tool calls. The Cursor billing URL now redirects to a docs landing page that carries no billing fields, and the Codex pricing page was unreachable, so neither source settles its vendor's current unit economics. Per-file cost is a derived quantity: files attributed to turns, turns to token deltas, token deltas to dollars at list or contracted rates (the modelPricing managed setting is Claude Code's only in-product hook for contracted rates).

## Sources

- Title: Claude Code costs (body has no H1; sections: Track your costs, Manage costs for your organization, Reduce token usage) | URL: https://docs.anthropic.com/en/docs/claude-code/costs | Raw: Reference/Raw/anthropic-claude-code-costs.md
- Title: Cursor Documentation (landing page served for /en/account/plans-and-usage; both fit and raw captures) | URL: https://docs.cursor.com/en/account/plans-and-usage | Raw: Reference/Raw/cursor-plans-and-usage.md
- Title: Requests in GitHub Copilot (legacy) | URL: https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests | Raw: Reference/Raw/github-copilot-premium-requests.md
- Title: # 404 (whole body is 81 bytes) | URL: https://openai.com/codex/pricing/ | Raw: Reference/Raw/openai-codex-pricing.md

## What the sources establish

1. Claude Code charges by API token consumption; across enterprise deployments the average is around $13 per developer per active day and $150-250 per developer per month, with costs below $30 per active day for 90% of users. (https://docs.anthropic.com/en/docs/claude-code/costs)
2. The /usage Session block reports Total cost, Total duration (API), Total duration (wall), Total code changes, and Usage by model with per-model input, output, cache read, and cache write counts; the dollar figure is computed locally from token counts at list price and totals reset when /clear starts a new session. (https://docs.anthropic.com/en/docs/claude-code/costs)
3. The modelPricing managed setting takes a multiplier below 1 for a discount or above 1 for a markup, or per-model four per-token rates under overrides; Claude Code ignores the key in user, project, and local settings and in --settings, and the Session block's Total cost line then carries the note "at your organization's configured rates". (https://docs.anthropic.com/en/docs/claude-code/costs)
4. The /usage plan usage breakdown attributes recent usage to skills, subagents, plugins, and individual MCP servers, each shown as a percentage of the total; an MCP server's share counts only requests that consumed one of its tool results; recommendation rows appear only for behaviors behind 10% or more of recent usage, and one request can count toward several rows. (https://docs.anthropic.com/en/docs/claude-code/costs)
5. A recommendation row can name a single file and its per-request token cost: "25%  Trim ~/code/api/CLAUDE.md - 49k tokens per request". (https://docs.anthropic.com/en/docs/claude-code/costs)
6. OpenTelemetry export works on every setup and is the only option that streams per-user token and cost metrics into your own observability stack in near real time; on cloud providers the alternatives are a Claude apps gateway or an LLM gateway such as LiteLLM that tracks spend by key. (https://docs.anthropic.com/en/docs/claude-code/costs)
7. Per-user reporting by setup: Teams and Enterprise use a spend report CSV with token usage and estimated spend per user and per model, updated daily, plus the Enterprise Analytics API on Enterprise; the Claude Console path uses the Console dashboard and the Claude Code Analytics API for daily per-user metrics. (https://docs.anthropic.com/en/docs/claude-code/costs)
8. On Teams and Enterprise plans usage draws from a per-seat allowance (Standard or Premium tier, rolling five-hour plus weekly window, shared with Claude chat and Cowork), and usage inside the seat allowance is not metered in dollars; the spend report covers usage-credit spend. (https://docs.anthropic.com/en/docs/claude-code/costs)
9. Recommended TPM and RPM per user scale down with team size: 1-5 users 200k-300k TPM and 5-7 RPM; 5-20 users 100k-150k and 2.5-3.5; 20-50 users 50k-75k and 1.25-1.75; 50-100 users 25k-35k and 0.62-0.87; 100-500 users 15k-20k and 0.37-0.47; 500+ users 10k-15k and 0.25-0.35. (https://docs.anthropic.com/en/docs/claude-code/costs)
10. Thinking tokens are billed as output tokens and the default thinking budget can be tens of thousands of tokens per request; agent teams use approximately 7x more tokens than standard sessions when teammates run in plan mode. (https://docs.anthropic.com/en/docs/claude-code/costs)
11. Background functionality uses tokens even when idle, typically under $0.04 per session. (https://docs.anthropic.com/en/docs/claude-code/costs)
12. A response billed at the 1.1x data residency rate is multiplied into the session cost figure, appears in the status line's cost field, and counts toward --max-budget-usd. (https://docs.anthropic.com/en/docs/claude-code/costs)
13. The Cursor URL docs.cursor.com/en/account/plans-and-usage serves the "Cursor Documentation" landing page on both the fit and raw captures; it carries no billing fields, and its pricing pointer is the Models & Pricing entry "Compare models, usage pools, and plan pricing". (https://docs.cursor.com/en/account/plans-and-usage)
14. The Cursor landing page model table has columns Name, Default Context, Max Context, Capabilities; rows include Claude Fable 5.1 at 300k default and 1M max, Claude Sonnet 5.5 at 200k and 1M, and GPT-5.6 Terra at 272k and 1M, all "AgentThinking". (https://docs.cursor.com/en/account/plans-and-usage)
15. The GitHub URL serves "Requests in GitHub Copilot (legacy)", which applies to Copilot Pro and Copilot Pro+ subscribers on existing annual plans who remained on legacy premium request-based billing after June 1, 2026. (https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests)
16. A request is any interaction where you ask Copilot to do something; for agentic features only the prompts you send count as premium requests, and actions Copilot takes autonomously, such as tool calls, do not. (https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests)
17. Premium request allowances: $10 USD per month buys 300 premium requests, $39 USD per month buys 1500, additional premium requests cost $0.04/request, counters reset on the 1st of each month at 00:00:00 UTC, and unused requests do not carry over. (https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests)
18. Each model has a premium request multiplier; Copilot code review consumes 13 premium requests per review from June 1, 2026; the cloud agent uses one per session plus one per real-time steering comment; Spark and cloud agent are tracked in dedicated SKUs from November 1, 2025. (https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests)
19. Premium request billing began June 18, 2025 on GitHub.com and August 1, 2025 on GHE.com. (https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests)
20. The OpenAI Codex pricing URL returned an 81-byte body whose full content is a 404 haiku; the single --filter raw retry exited 5 with "Blocked by anti-bot protection: Cloudflare JS challenge", so no Codex metering facts were obtained. (https://openai.com/codex/pricing/)

## Extracts that matter

### Claude Code /usage Session block (Raw lines 7-15)

```
Total cost:            $0.55
Total duration (API):  6m 20s
Total duration (wall): 6h 33m 10s
Total code changes:    0 lines added, 0 lines removed
Usage by model:
   claude-sonnet-4-6:  1.2k input, 5.3k output, 940.0k cache read, 50.0k cache write ($0.55)
```

### Claude Code Prompt cache line (Raw line 22, ASCII-normalized)

```
Prompt cache (main):   14 requests - 91% of input tokens from cache - 2 misses
(last 6m 10s ago, 310.2k tokens re-cached) - 1 expected rebuild
(compaction or tool-result clearing) - warm (1h TTL, last activity 40s ago)
```

### Claude Code /usage attribution and recommendations (Raw lines 34-36)

```
Attribution: recent usage attributed to skills, subagents, plugins, and
individual MCP servers, each shown as a percentage of the total.
An MCP server's share counts only the requests that consumed one of its
tool results. Before v2.1.222, after one call to an MCP server, Claude Code
attributed every subsequent request to that server, overstating its share.
Recommendations: Each row starts with a share of your recent usage, at
least 10%, as in "25%  Trim ~/code/api/CLAUDE.md - 49k tokens per request".
```

### Claude Code organization controls table (Raw lines 83-88)

```
| Your setup | See spend | Cap spend | Per-user reporting |
| --- | --- | --- | --- |
| Claude for Teams or Enterprise | Spend report in org analytics | Spend limits in admin settings | Spend report CSV; Enterprise Analytics API on Enterprise |
| Claude Console (API) | Console usage page | Workspace spend limits | Console dashboard; Claude Code Analytics API |
| Bedrock, Google Cloud Agent Platform, or Microsoft Foundry | Your cloud billing console | Your cloud's budget controls | OpenTelemetry or an LLM gateway |
```

### Copilot premium feature accounting (Raw lines 15-22, condensed)

```
Copilot Chat (ask, edit, agent, plan modes): one premium request per user prompt, x model rate
Copilot CLI: one premium request per prompt at the default model; other models x model rate
Copilot code review: 13 premium requests per review (from June 1, 2026)
Copilot cloud agent: one per session x model rate; one more per real-time steering comment
Copilot Spaces: one premium request per user prompt, x model rate
OpenAI Codex VS Code integration (preview): one premium request per prompt, x model multiplier
Third-party coding agents (preview): one premium request per prompt, x model rate
```

### Copilot plan table (Raw lines 32-37)

```
| Pricing | $10 USD per month (free for some users) | $39 USD per month |
| Premium requests | 300 per month | 1500 per month |
Purchase additional premium requests at $0.04/request
Counters reset on the 1st of each month at 00:00:00 UTC
```

### Cursor model table shape (Raw lines 96-101)

```
| Name | Default Context | Max Context | Capabilities |
| Claude Fable 5.1 | 300k | 1M | AgentThinking |
| Claude Haiku 5.5 | 300k | 1M | AgentThinking |
| Claude Sonnet 5.5 | 200k | 1M | AgentThinking |
| GPT-5.6 Terra | 272k | 1M | AgentThinking |
Billing fields absent: this capture is the docs landing page, not plans-and-usage.
```

### Codex pricing capture result (Raw file, 81 bytes, quoted in full)

```
# 404
A blank on the chart
The coast bends just out of view
There is more to trace
```
The --filter raw retry exited 5 with "Blocked by anti-bot protection: Cloudflare JS challenge".

## Open questions

- No vendor in this set exposes per-file inference cost. The finest native grains are Claude Code's component attribution (skills, subagents, plugins, MCP servers), its per-file recommendation row naming CLAUDE.md at 49k tokens per request, and Copilot's per-prompt accounting that excludes tool calls.
- Claude Code's OpenTelemetry metric names and attributes for token and cost metrics live on the monitoring-usage page, which was not fetched; per-user attribution there is per user, not per file.
- The per-model cached-token rate, the list prices behind the $0.55 sample, and the 1.1x data residency rate all point to platform.claude.com pricing pages, not fetched here.
- Cursor's current billing model (usage pools, plan pricing, per-model multipliers) sits on cursor.com/docs/models-and-pricing, the successor surface the landing page links; the requested URL no longer serves it.
- GitHub's non-legacy premium request documentation for post June 2026 billing and the per-model multiplier table are separate pages, not fetched; whether the current accounting still counts only user prompts is unverified.
- Whether Codex meters per task, per credit, or per token, and any included-usage numbers for ChatGPT plans, remain unknown because the pricing page was unreachable.
