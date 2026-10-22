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
