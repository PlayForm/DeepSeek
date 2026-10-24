// Library - the entry module of @playform/client-dsh-panel-family-host (the
// host half of the UI family's panel). Loader contract (cordis):
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }` -
// the ONLY named exports in the tree; every other module is a nameless
// default export composed Rust-style.
//
// The services (Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-
// TAILS.md, PHASE-7-PLAIN-FIELD-BRIDGE.md):
//   * panelFamilyHost - tail(namespace, lines) + stats(), READ-ONLY;
//   * panelFamilyBridge - editFull(namespace, patch) over
//     ctx.configEditor.edit(), the ONE trusted full-config write surface
//     (secret namespaces refused);
//   * panelFamilyTrace - the D5 bus forwarder (on/ring), provided when
//     ctx.trace exists.
// The Typert generation pipeline is documented as not reproducible from an
// external package, so the services ship as plain cordis services; the
// browser half (Source/Client.ts) forwards them through the generated
// playformFamilyPanel Remote namespace (the documented residual). fiberPhases
// come from the existing remote.pluginManager - no new endpoint.
import Apply from "@Function/Apply.js";
import Definition from "@Variable/Config.js";

export const name = "client-dsh-panel-family-host";

export const Config = Definition;

// No host services are required: the host reads the filesystem directly
// (read-only) and resolves the config editor and the trace bus structurally
// through ctx.get, so nothing is injected.
export const inject: string[] = [];

/**
 * Apply: provide the three services and log the activation.
 * Returns nothing (the loader contract).
 */
export function apply(
	context: Parameters<typeof Apply>[0],
	config: Parameters<typeof Apply>[1],
): void {
	Apply(context, config);
}

export default { name, apply, Config, inject };
