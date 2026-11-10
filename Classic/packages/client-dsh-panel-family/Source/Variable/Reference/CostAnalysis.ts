import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

/**
 * @module CostAnalysis
 *
 * The adapter for `plugin-dsh-cost-analysis`, the read-only ledger reader (order 85, right after
 * cost).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static activation posture,
 * and the D5 trace names. The section's status and the config form come from the plugin's
 * `Variable/Config.ts` schema; the dedicated table lives in the Cost tab.
 */
export default {
	id: "adapter-plugin-dsh-cost-analysis",
	bundle: "@playform/plugin-dsh-cost-analysis",
	namespace: "plugin-dsh-cost-analysis",
	title: "cost-analysis",
	order: 85,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
