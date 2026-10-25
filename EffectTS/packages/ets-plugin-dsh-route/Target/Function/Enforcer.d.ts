import { Service, type Context } from "@deepseek-ai/cordis";
import type { KeywordTable, PolicyShape, Role } from "../Interface/Policy.js";
import type Request from "../Interface/Request.js";
import type Route from "../Interface/Route.js";
import type State from "../Interface/State.js";
export default class Enforcer extends Service {
    private State;
    constructor(Context_: Context, State_: State);
    /** The silent role resolution (deterministic, pure). */
    Resolve(Request_: Request, Keywords?: KeywordTable): Route;
    /** The task-type inference for one spec text (undefined = no keyword hit;
     * the caller falls back to the policy's default role). */
    Classify(Spec: string): Role | undefined;
    /** The attempts ladder's escalation route (undefined = ladder exhausted
     * or escalation disabled by the policy). */
    Escalate(Escalations: number): Route | undefined;
    /** The policy view (the audit surface for the user's ledger review). */
    get Policy(): PolicyShape;
}
