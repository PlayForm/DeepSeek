import type State from "../Interface/State.js";
export default _default;
/**
 * @module Resolve
 *
 * Resolves the host-side update-policy path for the cargo flavor.
 *
 * @remarks
 *
 * Order: the configured global policyFile → the file's own directory →
 * co-located with the discovered registry → "" (the built-in default, handled
 * inside the update job when no policy file resolves). The policy SHAPE is the
 * cargo one (Interface/Policy.ts) — same discovery as the package.json
 * governor, separate policy content.
 *
 * Exemption (documented): `existsSync` probes on auxiliary discovery files
 * only (update-policy.json sidecars) — part of the policy-discovery
 * calculation, same exemption as Function/Discover. The governed manifest is
 * never touched here.
 */
declare function _default(State: State, Dir: string, Found: string | null): string;
