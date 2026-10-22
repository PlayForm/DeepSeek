// Request - the launch request the resolver sees (ROUTING-ENFORCER-PLUGIN.md
// section 2.1): the task type (or the omission), the task spec text for the
// keyword inference, the explicitly passed route (or the omission), and the
// escalation flag (the attempts ladder's automatic triggering).
//
// Every field is optional on purpose: the OMSSION is the normal case the
// plugin resolves silently - it is never an error to surface.

import type { Role, RouteHint } from "./Policy.js";

export default interface Request {
	/** The declared task type, when the launcher declares one. */
	taskType?: Role | undefined;
	/** The task spec text (the keyword inference runs on it when taskType is
	 * omitted). */
	spec?: string | undefined;
	/** The explicitly passed route, when the launcher passed one. */
	route?: RouteHint | undefined;
	/** The escalation flag: the request asks for the escalation rung (the
	 * DeepSeek max re-dispatch with the artifacts). */
	escalate?: boolean | undefined;
}
