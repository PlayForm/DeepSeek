/** One live agent handle - the registry returns the exact object, and the
 * subagent service compares identity, so only the id is typed here. */
export default interface Agent {
    id: string;
}
/** The structural shape the queue probes for (the `ctx.agents` service). */
export interface AgentsService {
    currentInitiator?: (() => Agent | undefined) | undefined;
    get?: ((Id: string) => Agent | undefined) | undefined;
}
