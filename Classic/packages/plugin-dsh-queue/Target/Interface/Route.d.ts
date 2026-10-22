import type { Role } from "./Task.js";
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
        route?: {
            provider?: string;
            model?: string;
            reasoningEffort?: string;
        } | undefined;
        escalate?: boolean | undefined;
    }) => ResolvedRoute;
}
