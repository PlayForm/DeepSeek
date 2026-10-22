// Policy - the shipped DEFAULT policy (the task-routing skill's routing
// table, the plan's agent-loop config: coder = GLM high, explorer = GLM low,
// planner = DeepSeek max). This is the fallback when the user's ~/.dsh
// policy is absent or partial; the user's explicit configuration always
// wins (the plugin merges the user's values over these defaults through the
// schema defaults, it never writes the policy).
//
// The catalog ids are the task-routing skill's three models, exactly,
// including suffixes; the provider is cloudflare-workers-ai; the effort
// tokens are exactly low / high / max.
import type { PolicyShape } from "@Interface/Policy.js";

export const DEFAULT_POLICY = {
	coder: {
		provider: "cloudflare-workers-ai",
		model: "@cf/zai-org/glm-5.3-flash",
		reasoningEffort: "high",
	},
	explorer: {
		provider: "cloudflare-workers-ai",
		model: "@cf/zai-org/glm-5.3-flash",
		reasoningEffort: "low",
	},
	planner: {
		provider: "cloudflare-workers-ai",
		model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
		reasoningEffort: "max",
	},
	allowedModels: [
		"@cf/zai-org/glm-5.3-flash",
		"@cf/deepseek-ai/deepseek-v4.1-flash-1017",
		"@cf/deepseek-ai/deepseek-v4-flash-0731",
	],
	escalation: {
		enabled: true,
		max: 1,
	},
} satisfies PolicyShape;
