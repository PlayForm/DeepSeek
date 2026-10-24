// Ports - what the panel hands every adapter section: the slot-aware registry
// (the data path), the trace tail (the live status source), the open
// callback, the logger, and the two optional services the form uses (the
// settings forms and the plain-field bridge). The section reads host data
// through this face; it never reads a file or writes a config itself.
import type { PanelBridge } from "./Bridge.js";
import type { PanelConfigForms } from "./Form.js";
import type { LaunchTarget, PanelRegistry } from "./Panel.js";
import type { PanelLive } from "./Trace.js";

// The logger seam: the panel's own documented lines (the duplicate-adapter
// refusal, the plain-field audit, the missing-bridge note) route through it.
export type PanelLog = {
	info: (message: string) => void;
	warn: (message: string) => void;
};

// The panel's ports object.
export type PanelPorts = {
	registry: PanelRegistry;
	live: PanelLive;
	open: (target: LaunchTarget) => void;
	log: PanelLog;
	configForms?: PanelConfigForms;
	bridge?: PanelBridge;
};
