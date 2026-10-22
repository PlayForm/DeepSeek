// Policy - the USER'S policy shapes (ROUTING-ENFORCER-PLUGIN.md sections
// 1-3): the user owns the configuration, the plugin only enforces it. The
// policy covers the agent-loop roles (coder / explorer / planner, each with
// its explicit provider / model / reasoningEffort triple), the allowed model
// set (the task-routing skill's three-model catalog is the shipped default),
// and the escalation rules (the attempts ladder: at most one DeepSeek max
// re-dispatch with the artifacts).
//
// The task-type vocabulary is the three routing roles. The values are the
// policy's law: the resolver never invents a route outside them.

/** The three routing roles of the task-routing skill. */
export type Role = "explorer" | "coder" | "planner";

/** One role's route triple. The effort tokens are exactly low / high / max. */
export interface RoleSpec {
	provider: string;
	model: string;
	reasoningEffort: "low" | "high" | "max";
}

/** The user's policy: the role table, the allowed set, the escalation rules. */
export interface PolicyShape {
	coder: RoleSpec;
	explorer: RoleSpec;
	planner: RoleSpec;
	allowedModels: string[];
	escalation: {
		enabled: boolean;
		max: number;
	};
}

/** The keyword table: role -> the keywords that classify a task spec into it.
 * The shipped table lives in Variable/Keywords; the user's config extends or
 * replaces it (the user's configuration is the law). */
export type KeywordTable = Record<string, string[]>;

/** A PARTIALLY specified route as the launcher passes it: each field may be
 * absent or explicitly undefined (the tool arguments arrive that way). The
 * resolver treats an undefined field exactly like an absent one. */
export type RouteHint = {
	provider?: string | undefined;
	model?: string | undefined;
	reasoningEffort?: string | undefined;
};
