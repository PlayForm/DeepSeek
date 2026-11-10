/**
 * @module Enforcer
 *
 * The routing-enforcer service that exposes the deterministic `dshRoute`
 * surface.
 *
 * @remarks
 * The factory's class/service pattern
 * (docs/user/develop/framework/service.md). Registered as `dshRoute`
 * immediately on construction and removed with its owning fiber; it holds
 * the State (the volatile policy view) and exposes the deterministic surface
 * the sibling orchestration plugins consume (the queue's routed dispatch,
 * SUBAGENT-QUEUE-PLUGIN.md section 2.4):
 *
 * - `Resolve(request)` - the silent role resolution (pure)
 * - `Classify(spec)` - the task-type inference (pure)
 * - `Escalate(escalations)` - the attempts ladder's escalation route
 *
 * Every method delegates to one Function module; the State's volatile fields
 * are read live, so a policy hot-edit applies to the next call without a
 * remount. The service logs NOTHING here - the launch path's listener
 * (Function/Inject) owns the ledger lines.
 */
import { Service, type Context } from "@deepseek-ai/cordis";
import type { KeywordTable, PolicyShape, Role } from "../Interface/Policy.js";
import type Request from "../Interface/Request.js";
import type Route from "../Interface/Route.js";
import type State from "../Interface/State.js";
export default class Enforcer extends Service {
    private State;
    constructor(Context_: Context, State_: State);
    /**
     * The silent role resolution (deterministic, pure).
     */
    Resolve(Request_: Request, Keywords?: KeywordTable): Route;
    /**
     * The task-type inference for one spec text (undefined = no keyword hit;
     * the caller falls back to the policy's default role).
     */
    Classify(Spec: string): Role | undefined;
    /**
     * The attempts ladder's escalation route (undefined = ladder exhausted
     * or escalation disabled by the policy).
     */
    Escalate(Escalations: number): Route | undefined;
    /**
     * The policy view (the audit surface for the user's ledger review).
     */
    get Policy(): PolicyShape;
}
