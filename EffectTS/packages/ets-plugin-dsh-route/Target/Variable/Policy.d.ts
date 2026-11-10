/**
 * @module Policy
 *
 * The shipped default routing policy for the plugin.
 *
 * @remarks
 *
 * The task-routing skill's routing table, the plan's agent-loop config:
 * coder = GLM high, explorer = GLM low, planner = DeepSeek max. This is the
 * fallback when the user's ~/.dsh policy is absent or partial; the user's
 * explicit configuration always wins (the plugin merges the user's values
 * over these defaults through the schema defaults, it never writes the
 * policy).
 *
 * The catalog ids are the task-routing skill's three models, exactly,
 * including suffixes; the provider is cloudflare-workers-ai; the effort
 * tokens are exactly low / high / max.
 */
/**
 * The shipped DEFAULT policy (the routing table's three roles).
 */
export declare const DEFAULT_POLICY: {
    coder: {
        provider: string;
        model: string;
        reasoningEffort: "high";
    };
    explorer: {
        provider: string;
        model: string;
        reasoningEffort: "low";
    };
    planner: {
        provider: string;
        model: string;
        reasoningEffort: "max";
    };
    allowedModels: string[];
    escalation: {
        enabled: true;
        max: number;
    };
};
