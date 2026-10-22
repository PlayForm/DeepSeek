import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { KeywordTable, PolicyShape, Role } from "./Policy.js";
export default interface State extends Shared {
    /** Master switch (config `enabled`, volatile) - false = full passthrough. */
    On: boolean;
    /** The user's routing policy (config `policy`, volatile). Named RoutePolicy
     *  because the factory's shared State already owns `Policy` (the configured
     *  global policy file path); the routing policy is the user's policy SHAPE,
     *  not a file. The service surface keeps the public name (Enforcer's
     *  `Policy` getter). */
    RoutePolicy: PolicyShape;
    /** The keyword table (config `keywords`, volatile; merged over the
     * shipped table at use time). */
    Keywords: KeywordTable;
    /** The omission's default role (config `defaultRole`, volatile). */
    DefaultRole: Role;
    /** The injected factory service itself (the ledger) - set once in Apply. */
    Factory: Factory;
}
