// Spaces - the adapter for hook-dsh-normalize-spaces, the third of the five
// remaining normalize flavors (order 13). Same reference pattern: the child
// slot, the settings namespace, the static activation posture, and the D5
// trace names. The spaces schema carries the volatile `replacement` knob
// (the plain ASCII space by default).
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-normalize-spaces",
	bundle: "@playform/ets-hook-dsh-normalize-spaces",
	namespace: "hook-dsh-normalize-spaces",
	title: "normalize-spaces",
	order: 13,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
