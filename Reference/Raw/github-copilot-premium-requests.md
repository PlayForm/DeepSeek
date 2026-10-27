[Skip to main content](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#main-content)
# Requests in GitHub Copilot (legacy)
Learn about requests in Copilot, including premium requests, how they work, and how to manage your usage effectively.
Copy markdown
Important
This article only applies to Copilot Pro and Copilot Pro+ subscribers on an existing annual plan who remained on legacy premium request-based billing after June 1, 2026.
## [What is a request?](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#what-is-a-request)
A request is any interaction where you ask Copilot to do something for you—whether it's generating code, answering a question, or helping you through an extension. Each time you send a prompt in a chat window or trigger a response from Copilot, you're making a request. For agentic features, only the prompts you send count as premium requests; actions Copilot takes autonomously to complete your task, such as tool calls, do not. For example, using `/plan` in Copilot CLI counts as one premium request, and any follow-up prompt you send counts as another.
## [What are premium requests?](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#what-are-premium-requests)
Some Copilot features use more advanced processing power and count as premium requests. The number of premium requests a feature consumes can vary depending on the feature and the AI model used.
### [Premium features](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#premium-features)
The following Copilot features can use premium requests.
Important
Starting June 1, 2026, Copilot code review will have a model multiplier of 13. This means each time Copilot reviews a pull request or reviews code in your IDE, your monthly quota of Copilot premium requests will be reduced by 13.  
| Copilot Chat uses **one premium request** per user prompt, multiplied by the model's rate. This includes ask, edit, agent, and plan modes in Copilot Chat in an IDE.  | Copilot premium requests  |  
| --- | --- |  
| Each prompt to Copilot CLI uses **one premium request** with the default model. For other models, this is multiplied by the model's rate.  | Copilot premium requests  |  
| Each time Copilot reviews a pull request (when assigned as a reviewer) or reviews code in your IDE, **13 premium requests** are consumed.  | Copilot premium requests  |  
| [Copilot cloud agent](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github)  | Copilot cloud agent uses **one premium request** per session, multiplied by the model's rate. A session begins when you prompt Copilot to undertake a task. In addition, each real-time steering comment made during an active session uses **one premium request** per session, multiplied by the model's rate.  | Copilot cloud agent premium requests  |  
| Copilot Spaces uses **one premium request** per user prompt, multiplied by the model's rate.  | Copilot premium requests  |  
| [OpenAI Codex Visual Studio Code integration](https://docs.github.com/en/copilot/concepts/agent-capabilities/about-agents/about-third-party-coding-agents#vs-code-extension)  | While in preview, each prompt to OpenAI Codex uses **one premium request** multiplied by the model multiplier rates.  | Copilot premium requests  |  
| [Third-party coding agents](https://docs.github.com/en/copilot/concepts/agent-capabilities/about-agents/about-third-party-coding-agents)  | While in preview, each prompt to a third-party coding agent uses **one premium request** , multiplied by the model's rate.  | Copilot premium requests  |  
Note
Premium requests for Spark and Copilot cloud agent are tracked in dedicated SKUs from November 1, 2025. This provides better cost visibility and budget control for each AI product.
Tip
For instructions on viewing how many premium requests you have used and advice on how to optimize usage, see [Monitoring your GitHub Copilot usage and entitlements (legacy)](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/monitor-premium-requests).
## [How do request allowances work per plan?](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#how-do-request-allowances-work-per-plan)
Note
Billing for premium requests began on June 18, 2025, for all paid Copilot plans on GitHub.com, and on August 1, 2025, on GHE.com. The request counters were only set to zero for paid plans.
If you're on a **paid plan** , you get unlimited inline suggestions. Rate limiting is in place to accommodate for high demand. See [Usage limits for GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/usage-limits).
Paid plans also receive a monthly allowance of premium requests, which can be used for advanced chat interactions, inline suggestions using premium models, and other premium features.  
| Pricing  | $10 USD per month(free for some users)  | $39 USD per month  |  
| --- | --- | --- |  
| Premium requests  | 300 per month  | 1500 per month  |  
| Purchase additional premium requests at $0.04/request  |  
## [What happens to unused requests at the end of the month?](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#what-happens-to-unused-requests-at-the-end-of-the-month)
Unused requests for the previous month do not carry over to the following month. Premium request counters reset on the 1st of each month at 00:00:00 UTC. See [Monitoring your GitHub Copilot usage and entitlements (legacy)](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/monitor-premium-requests).
## [What if I run out of premium requests?](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#what-if-i-run-out-of-premium-requests)
Note
Additional premium requests are not available to:
  * Users who subscribe, or have subscribed, to Copilot Pro or Copilot Pro+ through GitHub Mobile on iOS or Android.


If you use all of your premium requests, you can still use Copilot with one of the included models for the rest of the month. This is subject to change. Response times for the included models may vary during periods of high usage. Requests to the included models may be subject to rate limiting. See [Usage limits for GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/usage-limits).
If you need more premium requests beyond your monthly allowance set a budget for additional premium requests or upgrade to a higher plan. See [Setting up budgets to control spending on metered products](https://docs.github.com/en/billing/how-tos/set-up-budgets).
## [Model multipliers](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests#model-multipliers)
Each model has a premium request multiplier, based on its complexity and resource usage. Your premium request allowance is deducted according to this multiplier.
See [Model multipliers for annual plans on request-based billing (legacy)](https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/model-multipliers-for-annual-plans).
