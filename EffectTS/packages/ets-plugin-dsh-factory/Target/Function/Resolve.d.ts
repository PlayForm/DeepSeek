import { type State } from "@playform/ets-base-dsh";
export default _default;
/**
 * @module Resolve
 *
 * The UNION KEEP-LIST policy discovery.
 *
 * @remarks
 *
 * Order (the pinner's priority, parameterized by the policy sidecar file name): the configured
 * global policy file (State.Policy via `policyFileField`), then the governed file's own directory,
 * then co-located with the discovered registry.json (if any), and ALWAYS the P3 chain-keys union:
 * the chain-governed names from the discovered registry (the registry's `effectiveLatest` keys,
 * passed in as `chain`) are part of the keep-list. The chain pins must never be stripped by a
 * module's transform - the governor canonicalizes chain pins to `^resolved`; if the pinner
 * stripped that `^`, each plugin would consume the other's fresh version token forever (an
 * infinite rewrite ping-pong). With the chain names kept, the modules leave them alone and the
 * pass terminates.
 *
 * Unlike a first-wins path pick, the effective keep-list is the UNION of every readable
 * discovered policy: a global rule ("keep tailwindcss") composes with a per-directory rule
 * ("keep left-pad") instead of one shadowing the other. A configured-but-ABSENT file is simply
 * not a source; a file that EXISTS but does not parse is logged (`unreadable <policyFileName> at
 * ... - using built-in default`) and contributes nothing - the line is PARAMETERIZED MACHINERY
 * (the file name is the only variable), not module vocabulary, so centralizing it keeps the
 * trio's output byte-identical.
 *
 * Exemption (documented): existsSync probes + plain reads of auxiliary discovery files only
 * (policy sidecars) - part of the policy-discovery calculation, same exemption as
 * Function/Discover. The governed manifest is never touched here.
 */
declare function _default(State: State, Dir: string, Found: string | null, Chain: string[], Options?: {
    policyFileField?: string;
    policyFileName?: string;
} | undefined): string[];
