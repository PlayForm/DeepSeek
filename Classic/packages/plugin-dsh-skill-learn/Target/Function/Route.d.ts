import type Agent from "../Interface/Agent.js";
import type Configuration from "../Interface/Configuration.js";
/** A resolved route: both halves are present, by construction. */
export interface Route {
    readonly provider: string;
    readonly model: string;
}
export default _default;
declare function _default(Agent: Agent, Knobs: Pick<Configuration, "provider" | "model">): Route | undefined;
