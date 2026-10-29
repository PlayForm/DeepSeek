// Bridge - the plain-field bridge contract (Documentation/Plans/UI-Family/
// PHASE-7-PLAIN-FIELD-BRIDGE.md): the ONE trusted full-config write surface.
// A plain (non-volatile) Config field cannot ride the settings mutate without
// remounting its plugin, so the form routes it through `editFull(namespace,
// patch)`, which the host half implements over `ctx.configEditor.edit()`
// (the host endpoint lives in @playform/ets-client-dsh-panel-family-host, the
// next lane). The panel only resolves the client-side face and never imports
// the config editor.
export type PanelBridge = {
	/** Write the namespace's whole plain config; true when the host accepted it. */
	editFull: (namespace: string, patch: Record<string, unknown>) => Promise<boolean>;
};
