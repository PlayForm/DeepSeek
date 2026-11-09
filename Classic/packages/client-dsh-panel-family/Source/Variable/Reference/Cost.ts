// Cost - the adapter for plugin-dsh-cost, the cost ledger (order 80, right
// after ccr). Same reference pattern: the child slot, the settings
// namespace, the static activation posture, and the D5 trace names. The
// section's status and the config form come from the plugin's
// Variable/Config.ts schema; the dedicated table lives in the Cost tab.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-plugin-dsh-cost",
	bundle: "@playform/plugin-dsh-cost",
	namespace: "plugin-dsh-cost",
	title: "cost",
	order: 80,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
