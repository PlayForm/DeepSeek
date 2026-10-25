import type { Role } from "../Interface/Policy.js";
/** The hint's opening token (the idempotence marker). */
export declare const PREFIX = "[route: ";
/** The resolved triple plus the task type the hint names. */
export interface Hinted {
    taskType: Role;
    provider: string;
    model: string;
    reasoningEffort: string;
}
export default _default;
declare function _default(Route: Hinted): string;
