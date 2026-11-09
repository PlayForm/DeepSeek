/**
 * @module Agent
 *
 * The SELF-CONTAINED declaration of the harness agent registry's shape
 * (the `ctx.agents` service, @deepseek-ai/dsh-agent's AgentRegistry).
 *
 * @remarks
 * The PoC rule: declare the sibling service's shape in your own Interface/,
 * never import the package that may not be wired. The queue consumes exactly
 * two members:
 *
 *   currentInitiator() - the exact live Agent that initiated the inherited
 *                        asynchronous chain (the spawn's parent; the harness
 *                        requires the EXACT live object, not an id);
 *   get(id)            - the live Agent for one session id, or undefined
 *                        (the restart reconcile's liveness proof).
 *
 * Both are optional in the shape: an absent registry is a contained skip, and
 * the probe never becomes an injection dependency (the queue ships disabled
 * independently of the agent loop).
 */

/**
 * One live agent handle - the registry returns the exact object, and the
 * subagent service compares identity, so only the id is typed here.
 */
export default interface Agent {
	/**
	 * The agent's session id.
	 */
	id: string;
}

/**
 * The structural shape the queue probes for (the `ctx.agents` service).
 */
export interface AgentsService {
	/**
	 * The exact live Agent that initiated the inherited asynchronous chain
	 * (the spawn's parent), or undefined.
	 */
	currentInitiator?: (() => Agent | undefined) | undefined;
	/**
	 * The live Agent for one session id, or undefined.
	 */
	get?: ((Id: string) => Agent | undefined) | undefined;
}
