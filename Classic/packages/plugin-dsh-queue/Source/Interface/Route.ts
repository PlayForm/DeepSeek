// Route - the SELF-CONTAINED declaration of the routing-enforcer's service
// shape (the PoC rule: declare the sibling services' shapes in your own
// Interface/ - never import from a sibling that may not be wired). This is
// the structural contract of the `dshRoute` service
// (@playform/plugin-dsh-route, ROUTING-ENFORCER-PLUGIN.md section 2.1); the
// queue's dispatcher probes the service at dispatch time and skips routing
// when it is absent (the plugin ships disabled) - a contained skip, never a
// load block.

import type { Role } from "./Task.js";

// Re-export the role vocabulary in the queue's own terms (the three routing
// roles of the task-routing skill).
export type { Role } from "./Task.js";
export interface ResolvedRoute {
	provider: string;
	model: string;
	reasoningEffort: string;
	taskType: Role;
	source: "resolved" | "kept" | "corrected" | "escalated";
}

/** The structural shape the dispatcher probes for (the dshRoute service). */
export default interface RouteService {
	Resolve: (request: {
		taskType?: Role | undefined;
		spec?: string | undefined;
		route?: { provider?: string; model?: string; reasoningEffort?: string } | undefined;
		escalate?: boolean | undefined;
	}) => ResolvedRoute;
}
