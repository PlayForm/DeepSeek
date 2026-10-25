import type { Role, RoleSpec } from "@Interface/Policy.js";
import type Request from "@Interface/Request.js";
import type Route from "@Interface/Route.js";
export default _default;
declare function _default(Request_: Request, Policy: {
    coder: RoleSpec;
    explorer: RoleSpec;
    planner: RoleSpec;
    allowedModels: string[];
    escalation: {
        enabled: boolean;
        max: number;
    };
}, DefaultRole: Role, Keywords?: import("@Interface/Policy.js").KeywordTable, Advertised?: readonly string[]): Route;
