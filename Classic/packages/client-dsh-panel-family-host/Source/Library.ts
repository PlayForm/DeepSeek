// Library - the entry module of @playform/client-dsh-panel-family-host (the
// host half of the UI family's panel). Loader contract (cordis):
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }` -
// the ONLY named exports in the tree; every other module is a nameless
// default export composed Rust-style.
//
// The endpoint: tail(namespace, lines) for the family log tails + stats()
// for the ccr store summary (Documentation/Plans/UI-Family/
// PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md). READ-ONLY: the endpoint reads
// ~/.dsh family logs ONLY and has no write surface (A5.3). The Typert
// generation pipeline is documented as not reproducible from an external
// package, so the PoC ships the endpoint as a plain service under
// panelFamilyHost; the end-phase decides Typert vs the v1 shortcut.
// fiberPhases come from the existing remote.pluginManager - no new endpoint.
import Apply from "@Function/Apply.js";
import Definition from "@Variable/Config.js";

export const name = "client-dsh-panel-family-host";

export const Config = Definition;

// No host services are required: the endpoint reads the filesystem directly
// (read-only), so nothing is injected.
export const inject: string[] = [];

/**
 * Apply: provide the panelFamilyHost service and log the activation.
 * Returns nothing (the loader contract).
 */
export function apply(
	context: Parameters<typeof Apply>[0],
	config: Parameters<typeof Apply>[1],
): void {
	Apply(context, config);
}

export default { name, apply, Config, inject };
