// State - the per-apply plugin state: the FACTORY's shared shape (built by
// Factory.State(ctx, config, { ... })) extended with the routing enforcer's
// own fields. Every config-derived field is volatile in the schema, so the
// factory's P10 loader/volatile-update listener refreshes them in place.

import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";

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
