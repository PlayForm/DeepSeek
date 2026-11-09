/**
 * @module Ports
 *
 * What the panel hands every adapter section: the slot-aware registry (the data path), the trace
 * tail (the live status source), the open callback, the logger, and the two optional services the
 * form uses (the settings forms and the plain-field bridge).
 *
 * @remarks
 * The section reads host data through this face; it never reads a file or writes a config itself.
 */
import type { PanelBridge } from "./Bridge.js";
import type { PanelConfigForms } from "./Form.js";
import type { LaunchTarget, PanelRegistry } from "./Panel.js";
import type { PanelLive } from "./Trace.js";

/**
 * The logger seam: the panel's own documented lines (the duplicate-adapter refusal, the plain-field
 * audit, the missing-bridge note) route through it.
 */
export type PanelLog = {
	info: (message: string) => void;
	warn: (message: string) => void;
};

/**
 * The panel's ports object.
 */
export type PanelPorts = {
	/** The slot-aware registry: the data path every section reads. */
	registry: PanelRegistry;

	/** The trace tail: the live status source. */
	live: PanelLive;

	/** The open callback: launches a registered overlay view. */
	open: (target: LaunchTarget) => void;

	/** The logger seam for the panel's documented lines. */
	log: PanelLog;

	/** The settings forms service, absent when the host never composed it. */
	configForms?: PanelConfigForms;

	/** The plain-field bridge, absent when the host exposes no full-config write. */
	bridge?: PanelBridge;
};
